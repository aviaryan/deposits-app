from tests import DepositsTestCase
from tests.utils import login, send_delete_request, send_get_request


class TestUserDelete(DepositsTestCase):
    def delete_account(self, user_id, token=None):
        return send_delete_request(self, 'api/v1/users/' + str(user_id), token=token)

    def check_account_deleted(self, user_id):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/' + str(user_id), token=token)
        self.assertNotEqual(resp.status_code, 200)

    def test_normal_can_delete_own_account(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = self.delete_account(5, token=token)
        self.assertEqual(resp.status_code, 200)
        self.check_account_deleted(5)

    def test_admin_can_delete_manager_account(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.delete_account(3, token=token)
        self.assertEqual(resp.status_code, 200)
        self.check_account_deleted(3)

    def test_admin_can_delete_another_admin_account(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.delete_account(2, token=token)
        self.assertEqual(resp.status_code, 200)
        self.check_account_deleted(2)

    def test_admin_can_delete_normal_account(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.delete_account(5, token=token)
        self.assertEqual(resp.status_code, 200)
        self.check_account_deleted(5)

    def test_manager_can_delete_normal_account(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.delete_account(5, token=token)
        self.assertEqual(resp.status_code, 200)
        self.check_account_deleted(5)

    def test_normal_cannot_delete_other_accounts(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = self.delete_account(6, token=token)
        self.assertNotEqual(resp.status_code, 200)

    def test_manager_cannot_delete_another_manager_account(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.delete_account(4, token=token)
        self.assertNotEqual(resp.status_code, 200)

    def test_manager_cannot_delete_admin_account(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.delete_account(2, token=token)
        self.assertNotEqual(resp.status_code, 200)

    def test_anon_cannot_update_any_account(self):
        resp = self.delete_account(6)
        self.assertNotEqual(resp.status_code, 200)
