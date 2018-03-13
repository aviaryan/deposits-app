import json
from tests import DepositsTestCase
from tests.utils import login, send_get_request, create_deposit


class TestDepositCreate(DepositsTestCase):
    def test_user_can_create_own(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        self.assertIn('normal', resp.data.decode('utf-8'))

    def test_admin_can_create_normals_deposit(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal', user_id=5)
        self.assertIn('normal', resp.data.decode('utf-8'))
        # read to verify
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/deposits/1', token=token)
        self.assertIn('normal', resp.data.decode('utf-8'))

    def test_admin_can_create_managers_deposit(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='manager', user_id=3)
        self.assertIn('manager', resp.data.decode('utf-8'))
        # read to verify
        token = login(self, 'man3@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/deposits/1', token=token)
        self.assertIn('manager', resp.data.decode('utf-8'))

    def test_user_cannot_create_others_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal', user_id=6)
        data = json.loads(resp.data.decode('utf-8'))
        self.assertNotEqual(data['user_id'], 6)
        self.assertEqual(data['user_id'], 5)

    def test_manager_cannot_create_others_deposit(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal', user_id=5)
        data = json.loads(resp.data.decode('utf-8'))
        self.assertNotEqual(data['user_id'], 5)
        self.assertEqual(data['user_id'], 3)

