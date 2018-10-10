from elections.mongo import MongoApi
from elections.remote import VlApi
from flask import make_response
import json


class Api:

    def __init__(self):
        self.__response = make_response()
        self.m = MongoApi(server='localhost')

    def get(self, vl_id, vl_version='2018', vl_year='2018'):
        a = VlApi(vl_version, vl_year, vl_id)
        # get latest from DB. If counted = total, do not request the remote again

    def response(self, status=None, data=None, msg=None, headers=None, raw=False):
        if raw:
            self.__response.data = json.dumps(data, default=lambda o: str(o))
        else:
            self.__response.data = json.dumps({
                'msg': msg,
                'data': data
            }, default=lambda o: str(o))
        self.__response.status_code = 200
        if status:
            self.__response.status_code = status

        self.headers()
        if headers:
            for key, value in headers.items():
                self.__response.headers[key] = value
        return self.__response

    def headers(self):
        self.__response.headers['Content-Type'] = 'application/json'
        self.__response.headers['Access-Control-Allow-Origin'] = '*'
