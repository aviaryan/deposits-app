import unittest
from deposits import app, db
from .utils import create_users


class DepositsTestCase(unittest.TestCase):
    def setUp(self):
        app.config.from_object('config.TestingConfig')
        app.config['TESTING'] = True
        app.secret_key = 'super secret key'
        with app.test_request_context():
            db.create_all()
            create_users()
        self.app = app.test_client()

    def tearDown(self):
        with app.test_request_context():
            db.session.remove()
            db.drop_all()
