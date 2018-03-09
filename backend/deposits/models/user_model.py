from flask_login import UserMixin

from deposits import db


class User(db.Model, UserMixin):
    """User model class"""
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    phash = db.Column(db.String, nullable=False)
    salt = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)

    full_name = db.Column(db.String(100), nullable=True)

    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    is_manager = db.Column(db.Boolean, nullable=False, default=False)

    # backrefs
    deposits = db.relationship('Deposit', uselist=True, backref='user')
