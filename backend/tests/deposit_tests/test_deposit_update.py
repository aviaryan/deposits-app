from tests import DepositsTestCase
from tests.utils import login, create_deposit, send_put_request


class TestDepositUpdate(DepositsTestCase):
    def update_deposit(self, deposit_id, data, token=None):
        return send_put_request(self, 'api/v1/deposits/' + str(deposit_id), data, token=token)

    def test_user_can_update_own(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        create_deposit(self, token, msg='normal')
        resp = self.update_deposit(1, {'bank': 'toptal'}, token=token)
        self.assertIn('toptal', resp.data.decode('utf-8'))

    def test_admin_can_update_own(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        create_deposit(self, token, msg='admin')
        resp = self.update_deposit(1, {'bank': 'toptal'}, token=token)
        self.assertIn('toptal', resp.data.decode('utf-8'))

    def test_man_can_update_own(self):
        token = login(self, 'man3@gmail.com', 'password1')
        create_deposit(self, token, msg='manager')
        resp = self.update_deposit(1, {'bank': 'toptal'}, token=token)
        self.assertIn('toptal', resp.data.decode('utf-8'))

    def test_admin_can_update_normals_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        create_deposit(self, token, msg='normal')
        # update
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.update_deposit(1, {'bank': 'toptal'}, token=token)
        self.assertIn('toptal', resp.data.decode('utf-8'))

    def test_admin_can_update_managers_deposit(self):
        token = login(self, 'man3@gmail.com', 'password1')
        create_deposit(self, token, msg='manager')
        # update
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.update_deposit(1, {'bank': 'toptal'}, token=token)
        self.assertIn('toptal', resp.data.decode('utf-8'))

    def test_manager_cannot_update_others_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='manager', user_id=6)
        # update fail
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.update_deposit(1, {'bank': 'toptal'}, token=token)
        self.assertEqual(resp.status_code, 403)  # unauthorized

    def test_user_cannot_update_others_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='manager', user_id=6)
        # update fail
        token = login(self, 'normal6@gmail.com', 'password1')
        resp = self.update_deposit(1, {'bank': 'toptal'}, token=token)
        self.assertEqual(resp.status_code, 403)  # unauthorized

