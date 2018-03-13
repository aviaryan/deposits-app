# Testing


First, create the test database.

```sql
create user dpadmin with password 'dpadmin';
create database deposits_test with owner=dpadmin;
```

Then run the tests

```sh
python -m unittest discover tests/
```
