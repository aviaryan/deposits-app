from tests import DepositsTestCase
from tests.utils import login, send_put_request


class TestUserUpdate(DepositsTestCase):
    def update_account(self, user_id, data, token=None, is_admin=False, is_manager=False):
        return send_put_request(self, 'api/v1/users/' + str(user_id), data, token=token)

    def test_normal_can_update_own_account(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = self.update_account(5, {'username': 'newname'}, token=token)
        self.assertIn('newname', resp.data.decode('utf-8'))

    def test_admin_can_update_manager_account(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.update_account(3, {'username': 'newname'}, token=token)
        self.assertIn('newname', resp.data.decode('utf-8'))

    def test_admin_can_update_another_admin_account(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.update_account(2, {'username': 'newname'}, token=token)
        self.assertIn('newname', resp.data.decode('utf-8'))

    def test_manager_can_update_normal_account(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.update_account(5, {'username': 'newname'}, token=token)
        self.assertIn('newname', resp.data.decode('utf-8'))

    def test_normal_cannot_update_other_accounts(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = self.update_account(6, {'username': 'newname'}, token=token)
        self.assertEqual(resp.status_code, 403)

    def test_manager_cannot_update_another_manager_account(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.update_account(4, {'username': 'newname'}, token=token)
        self.assertEqual(resp.status_code, 403)

    def test_manager_cannot_update_admin_account(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.update_account(1, {'username': 'newname'}, token=token)
        self.assertEqual(resp.status_code, 403)

    def test_anon_cannot_update_any_account(self):
        resp = self.update_account(5, {'username': 'newname'})
        self.assertEqual(resp.status_code, 401)
