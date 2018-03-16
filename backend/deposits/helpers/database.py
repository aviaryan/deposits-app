import traceback
from traceback import print_exc
from flask import request

from sqlalchemy import func

from deposits import db
from .errors import NotFoundError, PermissionDeniedError
from .query_filters import extract_special_queries, apply_special_queries


def _make_url_query(args):
    """
    Helper function to return a query url string from a dict
    """
    return '?' + '&'.join('%s=%s' % (key, args[key]) for key in args)


def _get_queryset(klass):
    """Returns the queryset for `klass` model"""
    return klass.query


def get_list_or_404(klass, **kwargs):
    """Abstraction over `get_object_list`.
    Raises 404 error if the `obj_list` is empty.
    """
    obj_list = get_object_list(klass, **kwargs)
    if not obj_list:
        raise NotFoundError(message='Object list is empty')
    return obj_list


def get_object_list(klass, **kwargs):
    """Returns a list of objects of a model class. Uses other passed arguments
    with `filter_by` to filter objects.
    `klass` can be a model such as a User, Post, etc.
    """
    queryset = _get_queryset(klass)
    kwargs, specials = extract_special_queries(kwargs)
    # case insenstive filter
    for i in kwargs:
        if type(kwargs[i]) == str:
            queryset = queryset.filter(
                func.lower(getattr(klass, i)) == kwargs[i].lower())
        else:
            queryset = queryset.filter(getattr(klass, i) == kwargs[i])
    # special filters
    obj_list = apply_special_queries(queryset, specials)
    # return as list
    return list(obj_list)


def get_object_or_404(klass, id_):
    """Returns a specific object of a model class given its identifier. In case
    the object is not found, 404 is returned.
    `klass` can be a model such as a User, Post, etc.
    """
    queryset = _get_queryset(klass)
    obj = queryset.get(id_)
    if obj is None:
        raise NotFoundError(message='{} does not exist'.format(klass.__name__))
    return obj


def save_to_db(item):
    """Save a model to database"""
    try:
        db.session.add(item)
        db.session.commit()
        return True
    except Exception:
        traceback.print_exc()
        db.session.rollback()
        return False


def get_paginated_list(klass, url=None, args={}, **kwargs):
    """
    Returns a paginated response object

    klass - model class to query from
    url - url of the request
    args - args passed to the request as query parameters
    kwargs - filters for query on the `klass` model. if
        kwargs has event_id, check if it exists for 404
    """
    # if 'event_id' in kwargs:
    #     get_object_or_404(EventModel, kwargs['event_id'])
    # auto-get url
    if url is None:
        url = request.base_url
    # get page bounds
    start = args.get('start', 1)
    limit = args.get('limit', 20)
    # check if page exists
    results = get_object_list(klass, **kwargs)
    count = len(results)
    if count < start and ((count > 0) or (count == 0 and start > 1)):
        raise NotFoundError(
            message='Start position \'{}\' out of bound'.format(start))
    # make response
    obj = {}
    obj['start'] = start
    obj['limit'] = limit
    obj['count'] = count
    # make URLs
    # make previous url
    args_copy = args.copy()
    if start == 1:
        obj['previous'] = ''
    else:
        args_copy['start'] = max(1, start - limit)
        args_copy['limit'] = start - 1
        obj['previous'] = url + _make_url_query(args_copy)
    # make next url
    args_copy = args.copy()
    if start + limit > count:
        obj['next'] = ''
    else:
        args_copy['start'] = start + limit
        obj['next'] = url + _make_url_query(args_copy)
    # finally extract result according to bounds
    obj['results'] = results[(start - 1):(start - 1 + limit)]

    return obj


def delete_from_db(item, msg='Deleted from db'):
    """
    Delete from database
    """
    try:
        result = db.engine.execute("delete from \"{}\" where id={}".format(item.__table__, item.id))
        # ^^ quotes so that "user" works
        print(result)
        # ^^ experimental
        # db.session.delete(item)
        # db.session.commit()
        return True
    except Exception:
        print_exc()
        db.session.rollback()
        return False


def update_model(model, item_id, data, user_id=None):
    """
    Updates a model
    """
    item = get_object_or_404(model, item_id)
    # if no data in payload, happens when only related models were
    # changed through the API
    if len(data) == 0:
        return item
    # check if item belongs to user
    if user_id and item.user_id != user_id:
        raise PermissionDeniedError(message='This {} belongs to another user'.format(model.__name__))
    # update data
    db.session.query(model).filter_by(id=item_id).update(dict(data))
    # model.__table__.update().where(model.id==item_id).values(**data)
    save_to_db(item)
    return item


def create_model(model, data):
    """
    Creates a model
    """
    new_model = model(**data)
    save_to_db(new_model)
    return new_model


def delete_model(model, item_id, user_id=None):
    """
    Deletes a model
    """
    item = get_object_or_404(model, item_id)
    if user_id and item.user_id != user_id:
        raise PermissionDeniedError(message='This {} belongs to another user'.format(model.__name__))
    else:
        status = delete_from_db(item, '{} deleted'.format(model.__name__))
        if not status:
            raise NotFoundError('{} delete failed'.format(model.__name__))
    return item
