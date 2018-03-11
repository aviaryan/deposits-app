"""
python scripts/populate_db.py
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.realpath(__file__)) + '/../')


from deposits.views.user_api import DAO as user_dao


users = [
    {
        'username': 'avi',
        'full_name': 'avi',
        'email': 'avi.aryan123@gmail.com',
        'password': 'normal',
        'is_admin': False,
        'is_manager': False,
        'is_verified': True
    },
    {
        'username': 'avi_admin',
        'full_name': 'avi admin',
        'email': 'avi.aryan123+admin@gmail.com',
        'password': 'admin',
        'is_admin': True,
        'is_manager': False,
        'is_verified': True
    },
    {
        'username': 'avi_manager',
        'full_name': 'avi manager',
        'email': 'avi.aryan123+manager@gmail.com',
        'password': 'manager',
        'is_admin': False,
        'is_manager': True,
        'is_verified': True
    },
]

for user in users:
    try:
        user_dao.create(user)
        print('Created user: %s' % user)
    except Exception as e:
        print('Error while creating: %s' % e)
