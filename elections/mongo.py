from pymongo import MongoClient
from pymongo import ASCENDING, HASHED, DESCENDING
from pymongo.errors import CollectionInvalid
import pytz
import datetime
from bson import ObjectId
from elections.exceptions import ItemNotFoundException


class MongoApi:

    def __init__(self, server, username=None, password=None):
        self.db = MongoClient(server, 27017)['election_results']

    def configure(self, towns):
        for town in towns:
            self.db[town].create_index([
                ('timestamp', DESCENDING)
            ])

    def add_result(self, town, result):
        # Check stations counted
        try:
            latest = self.get_latest_result(town)
        except ItemNotFoundException:
            return self.__insert(town, result)
        else:
            if latest['counted_stations'] == result['counted_stations'] \
                    and latest['total_votes'] == result['total_votes']:
                return latest
        return self.__insert(town, result)

    def __insert(self, town, result):
        timestamp = datetime.datetime.now(tz=pytz.timezone('Europe/Brussels'))
        result['timestamp'] = timestamp
        r = self.db[town].insert_one(result)
        return self.get_result(town, r.inserted_id)

    def get_result(self, town, result_id):
        if not isinstance(result_id, ObjectId):
            result_id = ObjectId
        c = self.db[town]
        r = c.find_one({'_id': result_id})
        if not r:
            raise ItemNotFoundException('No item with id {0}.'.format(result_id))
        return r

    def get_latest_result(self, town):
        c = self.db[town]
        result = c.find().sort('timestamp', DESCENDING).limit(1)
        if not result or result.count() == 0:
            raise ItemNotFoundException('No results for {0}.'.format(town))
        return result[0]
