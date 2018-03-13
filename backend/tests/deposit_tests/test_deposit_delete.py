from tests import DepositsTestCase
from tests.utils import login, create_deposit, send_delete_request, send_get_request


class TestDepositDelete(DepositsTestCase):
    def delete_deposit(self, deposit_id, token=None):
        return send_delete_request(self, 'api/v1/deposits/' + str(deposit_id), token=token)

    def check_deposit_deleted(self, deposit_id):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/deposits/' + str(deposit_id), token=token)
        self.assertNotEqual(resp.status_code, 200)

    def test_user_can_delete_own(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        self.assertEqual(resp.status_code, 200)
        resp = self.delete_deposit(1, token=token)
        self.check_deposit_deleted(1)

    def test_admin_can_delete_normals_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        self.assertEqual(resp.status_code, 200)
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.delete_deposit(1, token=token)
        self.check_deposit_deleted(1)

    def test_admin_can_delete_managers_deposit(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='manager')
        self.assertEqual(resp.status_code, 200)
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = self.delete_deposit(1, token=token)
        self.check_deposit_deleted(1)

    def test_manager_cannot_delete_others(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        self.assertEqual(resp.status_code, 200)
        token = login(self, 'man3@gmail.com', 'password1')
        resp = self.delete_deposit(1, token=token)
        self.assertEqual(resp.status_code, 403)

    def test_normal_cannot_delete_others(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        self.assertEqual(resp.status_code, 200)
        token = login(self, 'normal6@gmail.com', 'password1')
        resp = self.delete_deposit(1, token=token)
        self.assertEqual(resp.status_code, 403)
