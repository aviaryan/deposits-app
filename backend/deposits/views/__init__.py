from flask_restplus import Api

from deposits import app
from deposits.helpers.errors import (
    NotFoundError,
    NotAuthorizedError,
    PermissionDeniedError,
    ValidationError,
    ServerError
)


api = Api(app, version='1.0', prefix='/api/v1', doc='/api/v1', title='Deposits API')


# ERRORS
@api.errorhandler(NotFoundError)
@api.errorhandler(NotAuthorizedError)
@api.errorhandler(PermissionDeniedError)
@api.errorhandler(ValidationError)
def handle_error(error):
    return error.to_dict(), getattr(error, 'code')


@api.errorhandler
def default_error_handler(error):
    """Returns Internal server error"""
    error = ServerError()
    return error.to_dict(), getattr(error, 'code', 500)


# import API routes
from .user_api import api as user_api
api.add_namespace(user_api)

from .auth_api import api as auth_api
api.add_namespace(auth_api)

from .deposit_api import api as deposit_api
api.add_namespace(deposit_api)

# import web route
import deposits.views.website  # noqa
