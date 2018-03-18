from flask_restplus import Namespace, Resource, reqparse
from flask_login import login_required
from flask import g, request
from datetime import datetime

from deposits.models.deposit_model import Deposit as DepositModel

from deposits.helpers.dao import BaseDAO
from deposits.helpers.banks import BANKS
from deposits.helpers.errors import ValidationError
from deposits.helpers.utils import AUTH_HEADER_DEFN, PaginatedResourceBase, PAGE_PARAMS, PAGINATED_MODEL
from deposits.helpers.permissions import has_deposit_access, admin_only
import deposits.helpers.custom_fields as fields
from deposits.helpers.query_filters import parse_args


api = Namespace('deposits', description='Deposits', path='/')

DEPOSIT = api.model('Deposit', {
    'id': fields.Integer(required=True),
    'bank': fields.String(required=True),
    'account': fields.String(required=True, min=11, max=20, alnum=True),
    'savings': fields.Float(required=True, minx=0.0, max=100000000000000),  # 100 trillion gdp
    'start_date': fields.Date(required=True),
    'end_date': fields.Date(required=True),
    'interest_rate': fields.Float(required=True),
    'tax_rate': fields.Float(required=True, min=0.0, max=100.0),
    'user_id': fields.Integer(min=1)  # for admin assign stuff
})

BANK_MIN = api.model('BankMin', {
    'banks': fields.List(fields.String())
})

DEPOSIT_GET = api.clone('DepositGet', DEPOSIT, {
    'amount': fields.Amount(attribute='id'),
    'interest': fields.Interest(attribute='id'),
    'tax': fields.Tax(attribute='id')
})

DEPOSIT_PAGINATED = api.clone('DepositPaginated', PAGINATED_MODEL, {
    'results': fields.List(fields.Nested(DEPOSIT_GET))
})

DEPOSIT_POST = api.clone('DepositPost', DEPOSIT, {})
del DEPOSIT_POST['id']


class DepositDAO(BaseDAO):
    def fix_user_deposit_access(self, data):
        """
        fixes the situation where a normal user tries to add deposit to another user
        """
        current_user = g.current_user
        if data.get('user_id') is None:  # give default user id
            data['user_id'] = current_user.id
        elif not current_user.is_admin:  # not an admin and cheating
            data['user_id'] = current_user.id
        return data['user_id']

    def full_check(self, data, id_=None):
        if not data.get('start_date'):
            # handle only end_date here
            # happens in case of update request
            if data.get('end_date') and id_:
                deposit = DAO.get(id_)
                if fields.Date().from_str(data['end_date']).date() <= deposit.start_date:
                    raise ValidationError('end_date', 'End date should be more than start date')
            return
        start = fields.Date().from_str(data['start_date'])
        if start > datetime.now():
            raise ValidationError('start_date', 'Start date should be today or some date before that')
        # if not data.get('end_date'):
        #     return
        end = fields.Date().from_str(data['end_date'])
        if end <= start:
            raise ValidationError('end_date', 'End date should be more than start date')

DAO = DepositDAO(DepositModel, DEPOSIT_POST)


# DEFINE Query PARAMS

DEPOSIT_PARAMS = {
    'from_date': {
        'description': 'Deposits done from this point (YYYY-MM-DD)'
    },
    'to_date': {
        'description': 'Deposits done till this point'
    },
    'order_by': {
        'description': 'Order by a field, example "start_date.desc" or "bank.asc"'
    },
    'bank': {},
    'user_id': {},
    'min_amount': {
        'description': 'Deposits done with minimum this amount'
    },
    'max_amount': {
        'description': 'Deposits done with maximum this amount'
    },
}

class DepositResource():
    """
    Deposit Resource Base class
    """
    deposit_parser = reqparse.RequestParser()
    deposit_parser.add_argument('from_date', type=str, dest='__deposit_from')
    deposit_parser.add_argument('to_date', type=str, dest='__deposit_to')
    deposit_parser.add_argument('order_by', type=str, dest='__deposit_order_by')
    deposit_parser.add_argument('bank', type=str)
    deposit_parser.add_argument('user_id', type=int)
    deposit_parser.add_argument('min_amount', type=float, dest='__deposit_min')
    deposit_parser.add_argument('max_amount', type=float, dest='__deposit_max')


@api.route('/deposits/<int:deposit_id>')
class Deposit(Resource):
    @login_required
    @has_deposit_access
    @api.header(*AUTH_HEADER_DEFN)
    @api.doc('get_deposit')
    @api.marshal_with(DEPOSIT_GET)
    def get(self, deposit_id):
        """Fetch a deposit given its id"""
        return DAO.get(deposit_id)

    @login_required
    @has_deposit_access
    @api.header(*AUTH_HEADER_DEFN)
    @api.doc('update_deposit')
    @api.marshal_with(DEPOSIT_GET)
    @api.expect(DEPOSIT_POST)
    def put(self, deposit_id):
        """Update a deposit given its id"""
        data = self.api.payload
        data['user_id'] = DAO.fix_user_deposit_access(data)
        return DAO.update(deposit_id, data)

    @login_required
    @has_deposit_access
    @api.header(*AUTH_HEADER_DEFN)
    @api.doc('delete_deposit')
    @api.marshal_with(DEPOSIT)
    def delete(self, deposit_id):
        """Delete a deposit given its id"""
        return DAO.delete(deposit_id, user_id=None)  # has_deposit_access already checks this


@api.route('/deposits')
class DepositList(Resource, DepositResource, PaginatedResourceBase):
    @api.header(*AUTH_HEADER_DEFN)
    @login_required
    @api.doc('create_deposit')
    @api.marshal_with(DEPOSIT_GET)
    @api.expect(DEPOSIT_POST)
    def post(self):
        """Create a deposit"""
        data = self.api.payload
        data['user_id'] = DAO.fix_user_deposit_access(data)
        return DAO.create(data, user_id=data['user_id'])

    @api.header(*AUTH_HEADER_DEFN)
    @login_required
    @api.doc('list_user_deposits', params=DEPOSIT_PARAMS)
    @api.doc(params=PAGE_PARAMS)
    @api.marshal_with(DEPOSIT_PAGINATED)
    def get(self):
        """List user deposits"""
        args = self.parser.parse_args()
        parsed_args = parse_args(self.deposit_parser)
        parsed_args['user_id'] = g.current_user.id
        return DAO.paginated_list(args=args, **parsed_args)


@api.route('/deposits/all')
class DepositListAll(Resource, DepositResource, PaginatedResourceBase):
    @api.header(*AUTH_HEADER_DEFN)
    @login_required
    @admin_only
    @api.doc('list_all_deposits', params=DEPOSIT_PARAMS)
    @api.doc(params=PAGE_PARAMS)
    @api.marshal_with(DEPOSIT_PAGINATED)
    def get(self):
        """List all deposits in the database"""
        args = self.parser.parse_args()
        parsed_args = parse_args(self.deposit_parser)
        return DAO.paginated_list(args=args, **parsed_args)


@api.route('/deposits/banks/_autocomplete')
class BankAutoComplete(Resource):
    @api.header(*AUTH_HEADER_DEFN)
    @login_required
    @api.doc('autocomplete_banks')
    @api.marshal_list_with(BANK_MIN)
    def get(self):
        """Autocomplete banks"""
        query = request.args.get('query', None)
        # user_id = request.args.get('user_id', g.current_user.id)
        # mine = request.args.get('mine', 'false')
        # ^ params
        # kwargs = {'user_id': user_id}
        deposits = DAO.list()
        banks = [deposit.bank for deposit in deposits]
        # if mine == 'false':
        banks = banks + BANKS
        banks = list(set(banks))
        if not query:
            return {'banks': banks[:10]}
        else:
            ls = list(filter(lambda bank: bank.lower().find(query.lower()) > -1, banks))
            return {'banks': ls[:10]}
