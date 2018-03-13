from tests import DepositsTestCase
from tests.utils import login, send_get_request, create_deposit


class TestDepositRead(DepositsTestCase):
    def test_user_can_read_own(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        self.assertIn('5.5', resp.data.decode('utf-8'))
        resp = send_get_request(self, 'api/v1/deposits/1', token=token)
        self.assertIn('normal', resp.data.decode('utf-8'))

    def test_admin_can_read_normals_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/deposits/1', token=token)
        self.assertIn('normal', resp.data.decode('utf-8'))

    def test_admin_can_read_mans_deposit(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='man')
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/deposits/1', token=token)
        self.assertIn('man', resp.data.decode('utf-8'))

    def test_man_cannot_read_other_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        token = login(self, 'man3@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/deposits/1', token=token)
        self.assertNotIn('normal', resp.data.decode('utf-8'))

    def test_anon_cannot_read_any_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        resp = send_get_request(self, 'api/v1/deposits/1')
        self.assertNotIn('normal', resp.data.decode('utf-8'))

    def test_admin_can_read_own(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='admin')
        self.assertIn('5.5', resp.data.decode('utf-8'))
        resp = send_get_request(self, 'api/v1/deposits/1', token=token)
        self.assertIn('admin', resp.data.decode('utf-8'))

    def test_man_can_read_own(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='man')
        self.assertIn('5.5', resp.data.decode('utf-8'))
        resp = send_get_request(self, 'api/v1/deposits/1', token=token)
        self.assertIn('man', resp.data.decode('utf-8'))


class TestDepositListRead(DepositsTestCase):
    def test_admin_can_read_normals_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/deposits/all', token=token)
        self.assertIn('normal', resp.data.decode('utf-8'))

    def test_admin_can_read_managers_deposit(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='manager')
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/deposits/all', token=token)
        self.assertIn('manager', resp.data.decode('utf-8'))

    def test_user_can_read_own_deposit(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/deposits', token=token)
        self.assertIn('normal', resp.data.decode('utf-8'))

    def test_user_cannot_read_all(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = create_deposit(self, token, msg='normal')
        resp = send_get_request(self, 'api/v1/deposits/all', token=token)
        self.assertNotIn('normal', resp.data.decode('utf-8'))
