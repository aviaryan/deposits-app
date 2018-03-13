from tests import DepositsTestCase
from tests.utils import login, send_get_request


class TestUserReadPositive(DepositsTestCase):
    def test_normal_can_read_own(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/5', token=token)
        self.assertIn('normal5', resp.data.decode('utf-8'))

    def test_manager_can_read_own(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/3', token=token)
        self.assertIn('man3', resp.data.decode('utf-8'))

    def test_admin_can_read_own(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/1', token=token)
        self.assertIn('admin1', resp.data.decode('utf-8'))

    def test_admin_can_read_normal(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/5', token=token)
        self.assertIn('normal5', resp.data.decode('utf-8'))

    def test_admin_can_read_man(self):
        token = login(self, 'admin1@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/4', token=token)
        self.assertIn('man4', resp.data.decode('utf-8'))

    def test_man_can_read_normal(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/6', token=token)
        self.assertIn('normal6', resp.data.decode('utf-8'))


class TestUserReadNegative(DepositsTestCase):
    def test_normal_cannot_read_other_normal(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/6', token=token)
        self.assertNotIn('normal6', resp.data.decode('utf-8'))

    def test_normal_cannot_read_man(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/3', token=token)
        self.assertNotIn('man3', resp.data.decode('utf-8'))

    def test_normal_cannot_read_admin(self):
        token = login(self, 'normal5@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/1', token=token)
        self.assertNotIn('admin1', resp.data.decode('utf-8'))

    def test_man_cannot_read_other_man(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/4', token=token)
        self.assertNotIn('man4', resp.data.decode('utf-8'))

    def test_man_cannot_read_admin(self):
        token = login(self, 'man3@gmail.com', 'password1')
        resp = send_get_request(self, 'api/v1/users/1', token=token)
        self.assertNotIn('admin1', resp.data.decode('utf-8'))
