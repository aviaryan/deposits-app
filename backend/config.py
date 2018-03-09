import os

LOCAL_PSQLDB_URL = 'postgresql://dpadmin:dpadmin@localhost:5432/deposits'
DIR_PATH = os.path.dirname(os.path.realpath(__file__))
SQLITE_PATH = 'sqlite:///' + DIR_PATH + '/database.sqlite3'


class Config(object):
    DEBUG = True
    CSRF_ENABLED = True
    SECRET_KEY = 'my_super_secret_key'
    SQLALCHEMY_DATABASE_URI = SQLITE_PATH
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class LocalConfig(Config):
    SQLALCHEMY_DATABASE_URI = LOCAL_PSQLDB_URL


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', LOCAL_PSQLDB_URL)


class SQLiteConfig(Config):
    SQLALCHEMY_DATABASE_URI = SQLITE_PATH


class TestingConfig(Config):
    SQLALCHEMY_DATABASE_URI = LOCAL_PSQLDB_URL + '_test'
