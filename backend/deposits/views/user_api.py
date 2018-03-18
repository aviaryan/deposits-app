from flask_restplus import Namespace, Resource, reqparse
from flask_login import login_required
from flask import g, request, current_app

from deposits.models.user_model import User as UserModel

from deposits.helpers.dao import BaseDAO
from deposits.helpers.database import save_to_db
from deposits.helpers.auth import hash_password, login_optional, get_user_from_header, generate_token
from deposits.helpers.errors import ValidationError, NotFoundError
from deposits.helpers.utils import AUTH_HEADER_DEFN, PaginatedResourceBase, PAGE_PARAMS, PAGINATED_MODEL
from deposits.helpers.mail import send_verify_mail, send_welcome_mail
from deposits.helpers.permissions import has_user_access, staff_only
import deposits.helpers.custom_fields as fields
from deposits.helpers.query_filters import parse_args


api = Namespace('users', description='Users', path='/')

USER = api.model('User', {
    'id': fields.Integer(required=True),
    'email': fields.Email(required=True),
    'username': fields.String(required=True, min=3, nospace=True, uname=True),
    'full_name': fields.String(min=2, max=100),
    'is_admin': fields.Boolean(default=False),
    'is_manager': fields.Boolean(default=False),
    'is_verified': fields.Boolean(default=False),
})

USER_MIN = api.model('UserMin', {
    'id': fields.Integer(),
    'username': fields.String(),
})

USER_PAGINATED = api.clone('UserPaginated', PAGINATED_MODEL, {
    'results': fields.List(fields.Nested(USER))
})

USER_POST = api.clone('UserPost', USER, {
    'password': fields.String(required=True, min=6, passw=True),
})
del USER_POST['id']

USER_PUT = api.clone('UserPut', USER_POST)
del USER_PUT['is_verified']


class UserDAO(BaseDAO):
    def create(self, data):
        # if testing, verified already
        if current_app.config['TESTING']:
            data['is_verified'] = True
        # validate
        data = self.validate(data)
        # set password
        data = self.update_password(data)
        # save to database
        user = self.model(**data)
        if not save_to_db(user):
            raise ValidationError('email', 'The username or email already exists')
        # return token at login
        return self.get(user.id), 201

    def update_password(self, data):
        phash, salt = hash_password(data['password'])
        del data['password']
        data['phash'] = phash
        data['salt'] = salt.decode('utf-8')
        return data

    def update(self, id_, data):
        # validate
        data = self.validate(data, check_required=False)
        # update password
        if data.get('password'):
            data = self.update_password(data)
        # check username
        for field in ['username', 'email']:
            if data.get(field):
                dc = {}
                dc[field] = data[field]
                user = UserModel.query.filter_by(**dc).first()
                if user and user.id != id_:
                    raise ValidationError(field, 'The {} already exists'.format(field))
        # save
        return super(UserDAO, self).update(id_, data, validate=False, user_id=None)

    def fix_access_levels(self, data, id_=None):
        """
        fixes is_admin, is_manager and is_verified levels
        """
        current_user = g.current_user
        # dont allow changing is_verified on update (id present)
        if id_ and data.get('is_verified') is not None:
            del data['is_verified']
        # solve
        if current_user and current_user.is_admin:  # all is good
            return data
        if current_user and current_user.is_manager:  # can change own power, not anyone else
            data['is_admin'] = False  # don't allow to make anyone admin
            if current_user.id != id_:
                data['is_manager'] = False  # this happens in new user case
            return data
        # normal user case
        if id_ is None:  # dont allow verifying themselves
            data['is_verified'] = False
        data['is_admin'] = False
        data['is_manager'] = False
        return data


DAO = UserDAO(UserModel, USER_POST, USER_PUT)


# DEFINE Query PARAMS

USER_PARAMS = {
    'order_by': {
        'description': 'Order by a field, example "id.desc" or "username.asc"'
    },
}

class UserResource():
    """
    User Resource Base class
    """
    user_parser = reqparse.RequestParser()
    user_parser.add_argument('order_by', type=str, dest='__user_order_by')


@api.route('/users/<int:user_id>')
class User(Resource):
    @login_required
    @has_user_access
    @api.header(*AUTH_HEADER_DEFN)
    @api.doc('get_user')
    @api.marshal_with(USER)
    def get(self, user_id):
        """Fetch a user given its id"""
        return DAO.get(user_id)

    @login_required
    @has_user_access
    @api.header(*AUTH_HEADER_DEFN)
    @api.doc('update_user')
    @api.marshal_with(USER)
    @api.expect(USER_PUT)
    def put(self, user_id):
        """Update a user given its id"""
        # fix access level
        data = DAO.fix_access_levels(self.api.payload, id_=user_id)
        return DAO.update(user_id, data)

    @login_required
    @has_user_access
    @api.header(*AUTH_HEADER_DEFN)
    @api.doc('delete_user')
    @api.marshal_with(USER)
    def delete(self, user_id):
        """Delete a user given its id"""
        return DAO.delete(user_id, user_id=None)


@api.route('/users/usernames/<string:username>')
class UserByUsername(Resource):
    @api.doc('get_user_by_username')
    @api.marshal_with(USER)
    def get(self, username):
        """Fetch a user given their username"""
        user = UserModel.query.filter_by(username=username).first()
        if not user:
            raise NotFoundError('User not found')
        return user


@api.header(*AUTH_HEADER_DEFN)
@api.route('/users/user')
class UserCurrent(Resource):
    @login_required
    @api.doc('get_user_current')
    @api.marshal_with(USER)
    def get(self):
        """Fetch the current user"""
        return DAO.get(g.current_user.id)


@api.route('/users/_verify')
class UserVerify(Resource):
    @api.doc('verify_user')
    @api.marshal_with(USER)
    def get(self):
        """Verify the user"""
        token = request.args.get('token', 'default')
        user = get_user_from_header(token)
        user.is_verified = True
        save_to_db(user)
        # welcome
        send_welcome_mail(user.email, user.username)
        return user


@api.route('/users')
class UserList(Resource, UserResource, PaginatedResourceBase):
    @api.header(*AUTH_HEADER_DEFN)
    @login_optional
    @api.doc('create_user')
    @api.marshal_with(USER)
    @api.expect(USER_POST)
    def post(self):
        """Create an user"""
        # fix access level
        data = DAO.fix_access_levels(self.api.payload)
        user, code = DAO.create(data)
        # send email
        if not user.is_verified:
            send_verify_mail(user.email, user.username, generate_token(user))
        elif not current_app.config['TESTING']:
            # new user case (normal)
            send_welcome_mail(user.email, user.username)
        return user, code

    @api.header(*AUTH_HEADER_DEFN)
    @login_required
    @staff_only
    @api.doc('list_users', params=USER_PARAMS)
    @api.doc(params=PAGE_PARAMS)
    @api.marshal_with(USER_PAGINATED)
    def get(self):
        """List all users"""
        args = self.parser.parse_args()
        user = g.current_user
        parsed_args = parse_args(self.user_parser)
        if user.is_admin:
            return DAO.paginated_list(args=args, **parsed_args)
        else:
            parsed_args['is_admin'] = False
            parsed_args['is_manager'] = False
            return DAO.paginated_list(args=args, **parsed_args)


@api.route('/users/_autocomplete')
class UserAutoComplete(Resource):
    @api.header(*AUTH_HEADER_DEFN)
    @login_required
    @staff_only
    @api.doc('autocomplete_users')
    @api.marshal_list_with(USER_MIN)
    def get(self):
        """Autocomplete users"""
        query = request.args.get('query', None)
        user = g.current_user
        if not query:
            return DAO.list()[:20]
        else:
            ls = list(filter(lambda user: user.username.find(query) > -1, DAO.list()))
            return ls[:20]
