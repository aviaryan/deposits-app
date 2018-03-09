from functools import wraps
from flask import g
from .errors import PermissionDeniedError
from deposits.models.user_model import User
from deposits.models.deposit_model import Deposit


def staff_only(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = g.current_user
        is_user_valid = user and (user.is_admin or user.is_manager)
        if is_user_valid:
            return func(*args, **kwargs)
        else:
            raise PermissionDeniedError(message='Staff account required to access this feature')
    return wrapper


def admin_only(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = g.current_user
        is_user_valid = user and user.is_admin
        if is_user_valid:
            return func(*args, **kwargs)
        else:
            raise PermissionDeniedError(message='Admin account required to access this feature')
    return wrapper


def has_user_access(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = g.current_user
        target_user_id = kwargs.get('user_id')
        if target_user_id is None:
            return func(*args, **kwargs)
        target_user = User.query.get(target_user_id)

        if user.is_admin:  # all good
            return func(*args, **kwargs)
        if user.is_manager and (not target_user.is_manager and not target_user.is_admin):  # manager case
            return func(*args, **kwargs)
        if user.id == target_user.id:
            return func(*args, **kwargs)
        # default
        raise PermissionDeniedError(message='You don\'t have access to this account')
    return wrapper


def has_deposit_access(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = g.current_user
        target_deposit_id = kwargs.get('deposit_id')
        if target_deposit_id is None:
            return func(*args, **kwargs)
        target_deposit = Deposit.query.get(target_deposit_id)

        if user.is_admin:  # all good
            return func(*args, **kwargs)
        if user.id == target_deposit.user_id:  # normal access
            return func(*args, **kwargs)
        # default
        raise PermissionDeniedError(message='You don\'t have access to this deposit')
    return wrapper
