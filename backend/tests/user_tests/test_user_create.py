from tests import DepositsTestCase
import json
from tests.utils import login, send_post_request


class TestUserCreate(DepositsTestCase):

    def create_new_account(self, token=None, is_admin=False, is_manager=False):
        user = {
            'username': 'newguy',
            'email': 'new@gmail.com',
            'password': 'pass1234',
            'is_admin': is_admin,
            'is_manager': is_manager
        }
        return send_post_request(self, 'api/v1/users', user, token=token)

    def test_anyone_can_create_normal_account(self):
        resp = self.create_new_account()
        self.assertIn('newguy', resp.data.decode('utf-8'))

    def test_admin_can_create_manager_account(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.create_new_account(token=token, is_manager=True)
        self.assertIn('newguy', resp.data.decode('utf-8'))

    def test_admin_can_create_admin_account(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.create_new_account(token=token, is_admin=True)
        data = json.loads(resp.data.decode('utf-8'))
        self.assertEqual(data['is_admin'], True)

    def test_anyone_cannot_create_admin_account(self):
        resp = self.create_new_account(is_admin=True)
        data = json.loads(resp.data.decode('utf-8'))
        self.assertEqual(data['is_admin'], False)

    def test_anyone_cannot_create_manager_account(self):
        resp = self.create_new_account(is_manager=True)
        data = json.loads(resp.data.decode('utf-8'))
        self.assertEqual(data['is_manager'], False)

    def test_manager_cannot_create_manager_account(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.create_new_account(token=token, is_manager=True)
        data = json.loads(resp.data.decode('utf-8'))
        self.assertEqual(data['is_manager'], False)

    def test_manager_cannot_create_admin_account(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.create_new_account(token=token, is_admin=True)
        data = json.loads(resp.data.decode('utf-8'))
        self.assertEqual(data['is_admin'], False)
