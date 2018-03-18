import re
from datetime import date
from flask_restplus.fields import Raw
from deposits.models.deposit_model import Deposit
from flask_restplus.fields import List, Nested  # noqa
from datetime import datetime

# https://stackoverflow.com/a/32010185/2295672
EMAIL_REGEX = re.compile(r'\S+@\S+\.\S+')
NOSPACE_REGEX = re.compile(r'^\S+$')
PASS_REGEX = re.compile(r'.*(\S\d|\d\S).*')
ALNUM_REGEX = re.compile(r'^[a-zA-Z0-9]*$')


class CustomField(Raw):
    """
    Custom Field base class with validate feature
    """
    __schema_type__ = 'string'
    validation_error = 'Validation of %s field failed'
    payload = {}

    def __init__(self, *args, **kwargs):
        super(CustomField, self).__init__(**kwargs)
        # custom params
        self.min = kwargs.get('min')
        self.max = kwargs.get('max')
        self.minx = kwargs.get('minx')
        self.maxx = kwargs.get('maxx')
        self.nospace = kwargs.get('nospace')
        self.passw = kwargs.get('passw')
        self.alnum = kwargs.get('alnum')

    def format(self, value):
        """
        format the text in database for output
        works only for GET requests
        """
        if not self.validate(value):
            print('Validation of field with value \"%s\" (%s) failed' % (
                value, str(self.__class__.__name__)))
            # raise MarshallingError
            # disabling for development purposes as the server crashes when
            # exception is raised. can be enabled when the project is mature
        if self.__schema_type__ == 'string':
            return str(value)
        else:
            return value

    def validate_min_max(self, value, apd=''):
        """
        validates against min/max setting
        """
        if self.min is not None and value < self.min:
            self.validation_error = '%s should be more than or equal to ' + str(self.min) + apd
            return False
        if self.max is not None and value > self.max:
            self.validation_error = '%s should be less than or equal to ' + str(self.max) + apd
            return False
        if self.minx is not None and value <= self.minx:
            self.validation_error = '%s should be more than ' + str(self.min) + apd
            return False
        if self.maxx is not None and value > self.maxx:
            self.validation_error = '%s should be less than ' + str(self.max) + apd
            return False
        return True

    def validate(self, value):
        """
        Validate the value. return True if valid
        """
        pass


class Email(CustomField):
    """
    Email field
    """
    __schema_format__ = 'email'
    __schema_example__ = 'email@domain.com'

    def validate(self, value):
        if not value:
            return True
        if not EMAIL_REGEX.match(value):
            self.validation_error = 'Invalid email address in %s'
            return False
        return True


class String(CustomField):
    """
    Custom String Field
    """
    def validate(self, value):
        if not value:
            return True
        if value.__class__.__name__ in ['unicode', 'str']:
            if self.nospace and not NOSPACE_REGEX.match(value):
                self.validation_error = '%s should not contain space or whitespace characters'
                return False
            if self.passw and not PASS_REGEX.match(value):
                self.validation_error = '%s should contain one non-numeric and one numeric character'
                return False
            if self.alnum and not ALNUM_REGEX.match(value):
                self.validation_error = '%s should only contain alphanumeric characters'
                return False
            return self.validate_min_max(len(value), ' characters in length')
        else:
            self.validation_error = '%s should be a String'
            return False


class Integer(CustomField):
    """
    Custom Integer Field
    Args:
        :positive - accept only positive numbers, True by default
    """
    __schema_type__ = 'integer'
    __schema_format__ = 'int'
    __schema_example__ = 0

    def validate(self, value):
        if value is None:
            return True
        if type(value) != int:
            self.validation_error = '%s should be an Integer'
            return False
        return self.validate_min_max(value)


class Float(CustomField):
    """
    Custom Float Field
    """
    __schema_type__ = 'number'
    __schema_format__ = 'float'
    __schema_example__ = 0.0

    def validate(self, value):
        if value is None:
            return True
        try:
            float(value)
            return self.validate_min_max(value)
        except Exception:
            self.validation_error = '%s should be a Number'
            return False


def get_values_for_deposit(id_):
    """
    returns interest, tax and amount for a deposit
    """
    deposit = Deposit.query.get(id_)
    # calc interest
    end = min(date.today(), deposit.end_date)
    delta = end - deposit.start_date
    days = delta.days
    ipd = deposit.interest_rate / 360.0
    interest = deposit.savings * ipd * days / 100.0
    if interest > 0:
        tax = deposit.tax_rate * interest / 100.0
    else:
        tax = 0
    return interest, tax, deposit.savings + interest - tax


class Amount(Float):
    """
    Amount field for deposits
    """
    def format(self, value):
        return get_values_for_deposit(value)[2]


class Interest(Float):
    """
    Interest field for deposits
    """
    def format(self, value):
        return get_values_for_deposit(value)[0]


class Tax(Float):
    """
    Tax field for deposits
    """
    def format(self, value):
        return get_values_for_deposit(value)[1]


class Boolean(CustomField):
    """Custom Boolean Field"""
    __schema_type__ = 'boolean'
    __schema_example__ = False

    def validate(self, value):
        if type(value) != bool:
            return False
        else:
            return True


class Date(CustomField):
    """
    Custom Date field
    """
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

    # def from_str_query(self, value, end=False):
    #     if end:
    #         return self.from_str(value + 'T23:59:59')
    #     else:
    #         return self.from_str(value + 'T00:00:00')

    def format(self, value):
        return self.to_str(value)

    def validate(self, value):
        if not value:
            return True
        try:
            if value.__class__.__name__ in ['unicode', 'str']:
                self.from_str(value)
            else:
                self.to_str(value)
        except Exception:
            self.validation_error = 'Incorrect format of date used in %s field. Should be YYYY-MM-DD.'
            return False
        return True
