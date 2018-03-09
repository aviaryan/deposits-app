from flask_restplus import Namespace, Resource, fields, reqparse
from flask_login import login_required
from flask import g

from deposits.models.deposit_model import Deposit as DepositModel

from deposits.helpers.dao import BaseDAO
from deposits.helpers.utils import AUTH_HEADER_DEFN
from deposits.helpers.permissions import has_deposit_access, admin_only
from deposits.helpers.custom_fields import DateTime
from deposits.helpers.query_filters import parse_args


api = Namespace('deposits', description='Deposits', path='/')

DEPOSIT = api.model('Deposit', {
    'id': fields.Integer(required=True),
    'bank': fields.String(required=True),
    'account': fields.String(required=True),
    'savings': fields.Float(required=True),
    'start_date': DateTime(required=True),
    'end_date': DateTime(required=False),
    'interest_rate': fields.Float(required=True),
    'tax_rate': fields.Float(required=True),
    'user_id': fields.Integer()  # for admin assign stuff
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


DAO = DepositDAO(DepositModel, DEPOSIT_POST)


# DEFINE Query PARAMS

DEPOSIT_PARAMS = {
    'from': {
        'description': 'Deposits done from this point (YYYY-MM-DD)'
    },
    'to': {
        'description': 'Deposits done till this point'
    },
    'order_by': {
        'description': 'Order by a field, example "start_date.desc" or "bank.asc"'
    },
}

class DepositResource():
    """
    Deposit Resource Base class
    """
    deposit_parser = reqparse.RequestParser()
    deposit_parser.add_argument('from', type=str, dest='__deposit_from')
    deposit_parser.add_argument('to', type=str, dest='__deposit_to')
    deposit_parser.add_argument('order_by', type=str, dest='__deposit_order_by')



@api.route('/deposits/<int:deposit_id>')
class Deposit(Resource):
    @login_required
    @has_deposit_access
    @api.header(*AUTH_HEADER_DEFN)
    @api.doc('get_deposit')
    @api.marshal_with(DEPOSIT)
    def get(self, deposit_id):
        """Fetch a deposit given its id"""
        return DAO.get(deposit_id)

    @login_required
    @has_deposit_access
    @api.header(*AUTH_HEADER_DEFN)
    @api.doc('update_deposit')
    @api.marshal_with(DEPOSIT)
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
class DepositList(Resource, DepositResource):
    @api.header(*AUTH_HEADER_DEFN)
    @login_required
    @api.doc('create_deposit')
    @api.marshal_with(DEPOSIT)
    @api.expect(DEPOSIT_POST)
    def post(self):
        """Create a deposit"""
        data = self.api.payload
        data['user_id'] = DAO.fix_user_deposit_access(data)
        return DAO.create(data, user_id=data['user_id'])

    @api.header(*AUTH_HEADER_DEFN)
    @login_required
    @api.doc('list_user_deposits', params=DEPOSIT_PARAMS)
    @api.marshal_list_with(DEPOSIT)
    def get(self):
        """List user deposits"""
        parsed_args = parse_args(self.deposit_parser)
        parsed_args['user_id'] = g.current_user.id
        return DAO.list(**parsed_args)


@api.route('/deposits/all')
class DepositListAll(Resource, DepositResource):
    @api.header(*AUTH_HEADER_DEFN)
    @login_required
    @admin_only
    @api.doc('list_all_deposits', params=DEPOSIT_PARAMS)
    @api.marshal_list_with(DEPOSIT)
    def get(self):
        """List all deposits in the database"""
        parsed_args = parse_args(self.deposit_parser)
        return DAO.list(**parsed_args)
