from deposits.views.user_api import DAO as user_dao
import json


user_skull = {
    'username': 'admin',
    'full_name': 'a user',
    'email': 'admin1@gmail.com',
    'password': 'password1',
    'is_admin': False,
    'is_manager': False
}


def create_users():
    user1 = user_skull.copy()
    user1['username'] = 'admin1'
    user1['email'] = 'admin1@gmail.com'
    user1['is_admin'] = True
    user_dao.create(user1)

    user2 = user_skull.copy()
    user2['username'] = 'admin2'
    user2['email'] = 'admin2@gmail.com'
    user2['is_admin'] = True
    user_dao.create(user2)

    user3 = user_skull.copy()
    user3['username'] = 'man3'
    user3['email'] = 'man3@gmail.com'
    user3['is_manager'] = True
    user_dao.create(user3)

    user4 = user_skull.copy()
    user4['username'] = 'man4'
    user4['email'] = 'man4@gmail.com'
    user4['is_manager'] = True
    user_dao.create(user4)

    user5 = user_skull.copy()
    user5['username'] = 'normal5'
    user5['email'] = 'normal5@gmail.com'
    user_dao.create(user5)

    user6 = user_skull.copy()
    user6['username'] = 'normal6'
    user6['email'] = 'normal6@gmail.com'
    user_dao.create(user6)


def create_deposit(interface, token, msg='', user_id=None):
    data = {
        'bank': 'bank ' + msg,
        'account': 'abcdef000012',
        'savings': 1500,
        'start_date': '2017-10-13',
        'end_date': '2018-10-13',
        'interest_rate': 5.5,
        'tax_rate': 3.5
    }
    if user_id:
        data['user_id'] = user_id
    # send
    resp = interface.app.post(
        'api/v1/deposits',
        data=json.dumps(data),
        headers={
            'Authorization': 'Bearer ' + token,
            'content-type': 'application/json'
        }
    )
    return resp


def login(interface, email, password):
    resp = interface.app.post(
        'api/v1/auth/login',
        data=json.dumps({
            'email': email,
            'password': password
        }),
        headers={'content-type': 'application/json'},
        follow_redirects=True
    )
    data = json.loads(resp.data.decode('utf-8'))
    interface.assertEqual(resp.status_code, 200)
    return data['token']


def send_get_request(interface, path, token=None):
    headers = {}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    resp = interface.app.get(
        path,
        headers=headers
    )
    return resp


def send_post_request(interface, path, data, token=None):
    headers = {'content-type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    resp = interface.app.post(
        path,
        data=json.dumps(data),
        headers=headers,
        follow_redirects=True
    )
    return resp

def send_put_request(interface, path, data, token=None):
    headers = {'content-type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    resp = interface.app.put(
        path,
        data=json.dumps(data),
        headers=headers,
        follow_redirects=True
    )
    return resp

def send_delete_request(interface, path, token=None):
    headers = {}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    resp = interface.app.delete(
        path,
        headers=headers,
        follow_redirects=True
    )
    return resp
