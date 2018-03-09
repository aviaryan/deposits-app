import hashlib, uuid
import jwt
from flask import request, g
from functools import wraps
from deposits import app
from deposits.models.user_model import User
from .errors import NotAuthorizedError


def hash_password(password, salt=None):
    """
    hashes password
    https://stackoverflow.com/questions/9594125/salt-and-hash-a-password-in-python
    """
    if salt is None:
        salt = uuid.uuid4().hex.encode('utf-8')
    else:
        salt = salt.encode('utf-8')
    password = password.encode('utf-8')
    # need to encode unicode
    hashed_password = hashlib.sha512(password + salt).hexdigest()
    return hashed_password, salt


def generate_token(user):
    secret = app.config['SECRET_KEY']
    encoded = jwt.encode({'id': user.id, 'email': user.email}, secret, algorithm='HS256')
    return encoded.decode('utf-8')


def decode_token(token):
    secret = app.config['SECRET_KEY']
    try:
        data = jwt.decode(token, secret, algorithms=['HS256'])
    except:
        raise NotAuthorizedError('Authentication failed')
    user = User.query.get(data['id'])
    return user


def get_user_from_header(header_val):
    header_val = header_val.replace('Bearer ', '', 1)
    user = decode_token(header_val)
    # set user status
    g.current_user = user
    # return
    return user


def login_optional(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth = request.headers.get('Authorization')
        g.current_user = None
        if auth:
            get_user_from_header(auth)  # already sets login
        return func(*args, **kwargs)
    return wrapper
