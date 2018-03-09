from flask_restplus import fields

from .errors import ValidationError


def handle_extra_payload(payload, api_model):
    """
    Handles extra keys in payload
    """
    # not checking list type bcoz no such API
    if type(payload) != dict:
        return payload
    data = payload.copy()
    for key in payload:
        if key not in api_model:
            del data[key]
        elif isinstance(api_model[key], fields.Nested):
            data[key] = handle_extra_payload(data[key], api_model[key].model)
        elif isinstance(api_model[key], fields.List):
            temp = []
            for _ in payload[key]:
                temp.append(handle_extra_payload(_, api_model[key].container))
            data[key] = temp
    return data


def validate_payload(payload, api_model, check_required=True):
    """
    Validate payload against an api_model. Aborts in case of failure
    - This function is for custom fields as they can't be validated by
      flask restplus automatically.
    - This is to be called at the start of a post or put method
    """
    # check if any reqd fields are missing in payload
    if check_required:
        for key in api_model:
            if api_model[key].required and key not in payload:
                raise ValidationError(
                    field=key,
                    message='Required field \'{}\' missing'.format(key))
            # another case (empty values)
            if api_model[key].required and not payload[key]:
                raise ValidationError(
                    field=key,
                    message='Required field \'{}\' empty'.format(key))
    # check payload
    for key in payload:
        field = api_model[key]
        if isinstance(field, fields.List):
            field = field.container
            data = payload[key]
        elif isinstance(field, fields.Nested):
            if payload[key]:  # not null
                validate_payload(payload[key], field.model)
        else:
            data = [payload[key]]
        if hasattr(field, 'validate'):  # and isinstance(field, CustomField)
            field.payload = payload
            for i in data:
                if not field.validate(i):
                    raise ValidationError(field=key,
                                          message=field.validation_error %
                                          ('\'%s\'' % key))


def fix_attribute_names(payload, api_model):
    """
    converts payload fields to their real names.
    Uses the attribute parameter
    """
    data = payload.copy()
    for key in payload:
        if api_model[key].attribute:
            data[api_model[key].attribute] = data[key]
            del data[key]
    return data
