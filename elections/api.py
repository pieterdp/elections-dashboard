from elections.mongo import MongoApi
from elections.exceptions import ItemNotFoundException
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
        try:
            latest = self.m.get_latest_result(vl_id)
        except ItemNotFoundException:
            try:
                result = a.get_results()
            except Exception as e:
                return self.response(status=502, msg=e)
            latest = self.m.add_result(vl_id, result)
            latest['new'] = True
        else:
            if latest['polling_stations'] == latest['counted_stations']:
                latest['new'] = False
            else:
                try:
                    result = a.get_results()
                except Exception as e:
                    return self.response(status=502, msg=e)
                if result['counted_stations'] == latest['counted_stations']:
                    latest['new'] = False
                else:
                    latest = self.m.add_result(vl_id, result)
                    latest['new'] = True
        return self.response(data=latest)

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
