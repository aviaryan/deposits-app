from .data import handle_extra_payload, validate_payload, fix_attribute_names
from .database import get_object_or_404, get_object_list, update_model, create_model, delete_model


# DAO for Models
class BaseDAO:
    """
    DAO for a basic independent model
    """

    def __init__(self, model, post_api_model=None, put_api_model=None):
        self.model = model
        self.post_api_model = post_api_model
        self.put_api_model = put_api_model if put_api_model else post_api_model

    def create(self, data, validate=True, user_id=None):
        if validate:
            data = self.validate(data, self.post_api_model)
        if user_id:  # set user_id after validation
            data['user_id'] = user_id
        item = create_model(self.model, data)
        return item

    def get(self, id_):
        return get_object_or_404(self.model, id_)

    def list(self, **kwargs):
        return get_object_list(self.model, **kwargs)

    def update(self, id_, data, validate=True, user_id=None):
        if validate:
            data = self.validate_put(data, self.put_api_model)
        item = update_model(self.model, id_, data, user_id=user_id)
        return item

    def delete(self, id_, user_id=None):
        item = delete_model(self.model, id_, user_id=user_id)
        return item

    def validate(self, data, model=None, check_required=True):
        if not model:
            model = self.post_api_model
        if model:
            data = handle_extra_payload(data, model)
            validate_payload(data, model, check_required=check_required)
            data = fix_attribute_names(data, model)
        return data

    def validate_put(self, data, model=None):
        """
        Abstraction over validate with check_required set to False
        """
        return self.validate(data, model=model, check_required=False)
