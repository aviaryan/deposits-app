from deposits import db


class Deposit(db.Model):
    """Deposit model class"""
    __tablename__ = 'deposit'
    id = db.Column(db.Integer, primary_key=True)
    bank = db.Column(db.String, nullable=False)
    account = db.Column(db.String, nullable=False)
    savings = db.Column(db.Float, nullable=False)

    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)  # because savings can be current
    # https://en.wikipedia.org/wiki/Deposit_account

    interest_rate = db.Column(db.Float, nullable=False)
    tax_rate = db.Column(db.Float, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
