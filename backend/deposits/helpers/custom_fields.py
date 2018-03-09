from flask_restplus.fields import Raw
from datetime import datetime


class Date(Raw):
    """
    Custom Date field
    """
    validation_error = 'Validation of %s field failed'
    __schema_format__ = 'date'
    __schema_example__ = '2016-06-06'
    dt_format = '%Y-%m-%d'

    def to_str(self, value):
        return None if not value \
            else value.strftime(self.dt_format)

    def from_str(self, value):
        if not value:
            return None
        # value = value.replace(' ', 'T', 1)
        return datetime.strptime(value, self.dt_format)

    def from_str_query(self, value, end=False):
        if end:
            return self.from_str(value + 'T23:59:59')
        else:
            return self.from_str(value + 'T00:00:00')

    def format(self, value):
        return self.to_str(value)

    def validate_empty(self):
        """
        Return when value is empty or null
        """
        if self.required:
            self.validation_error = 'Required field %s. Cannot be null or empty'
            return False
        else:
            return True

    def validate(self, value):
        if not value:
            return self.validate_empty()
        try:
            if value.__class__.__name__ in ['unicode', 'str']:
                self.from_str(value)
            else:
                self.to_str(value)
        except Exception:
            self.validation_error = 'Incorrect format of date used in %s field. Should be YYYY-MM-DD.'
            return False
        return True
