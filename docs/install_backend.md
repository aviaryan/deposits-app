# Installation instructions

The first step is to install requirements.

```sh
pip install -r requirements.txt
```

Then the next step is creating the database. We are using Postgres here.

```sql
create user dpadmin with password 'dpadmin';
create database deposits with owner=dpadmin;
```

Now, we need to set the DATABASE_URL to environment.

```sh
export DATABASE_URL=postgresql://dpadmin:dpadmin@localhost:5432/deposits
```

-----

The next steps are for actually running the application.

To run the application, use -

```sh
python manage.py runserver
```

Occassionally, you might need to do database upgrades as well (when database changes). For that use the following comamnds.

```sh
# python manage.py db init
python manage.py db migrate
python manage.py db upgrade
```

*[dev]* For resolving migrations conflicts, use the following commands.

```sh
python manage.py db heads
python manage.py db merge HEAD1 HEAD2
python manage.py upgrade
```

