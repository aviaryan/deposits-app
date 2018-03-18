from deposits.models.deposit_model import Deposit
from deposits.models.user_model import User
# from .custom_fields import Amount
from .custom_fields import Date


def extract_special_queries(queries):
    """
   Separate special queries from normal queries
   """
    specials = {}
    dc = queries.copy()
    for i in queries:
        if i.startswith('__') and i in FILTERS_LIST:
            specials[i] = queries[i]
            del dc[i]
    return (dc, specials)


def apply_special_queries(query, specials):
    """
   Apply all special queries on the current
   existing :query (set)
   """
    for i in specials:
        query = FILTERS_LIST[i](specials[i], query)
    return query


# DEFINE CUSTOM FILTERS BELOW

def deposit_from(value, query):
    return query.filter(Deposit.start_date >= Date().from_str(value))


def deposit_to(value, query):
    return query.filter(Deposit.start_date <= Date().from_str(value))


def deposit_min(value, query):
    return query.filter(Deposit.savings >= value)
    # ^^ reverts 32392bf
    # items = query
    # queries = []
    # for item in items:
    #     amount = Amount.format(None, item.id)
    #     if amount >= value:
    #         queries.append(item)
    # return queries


def deposit_max(value, query):
    return query.filter(Deposit.savings <= value)
    # items = query
    # queries = []
    # for item in items:
    #     amount = Amount.format(None, item.id)
    #     if amount <= value:
    #         queries.append(item)
    # return queries


def deposit_order_by(value, query):
    col, direction = value.split('.')
    col = getattr(Deposit, col)
    if direction == 'desc':
        col = col.desc()
    return query.order_by(col)


def user_order_by(value, query):
    col, direction = value.split('.')
    col = getattr(User, col)
    if direction == 'desc':
        col = col.desc()
    return query.order_by(col)
# ADD CUSTOM FILTERS TO LIST


FILTERS_LIST = {
    '__deposit_to': deposit_to,
    '__deposit_from': deposit_from,
    '__deposit_min': deposit_min,
    '__deposit_max': deposit_max,
    '__deposit_order_by': deposit_order_by,
    '__user_order_by': user_order_by,
}


# UTIL FUNCTIONS

def parse_args(parser, keep_none=False):
    """
    Abstraction over flask_restplus.reqparse.parser.parse_args
    It returned None value if a value was not set
    This completely removes that value from the returned dict
    """
    args = parser.parse_args()
    if not keep_none:
        args = {k: v for k, v in args.items() if v is not None}
    return args
