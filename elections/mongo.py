from pymongo import MongoClient


class MongoApi:

    def __init__(self, username, password, server):
        self.db = MongoClient(server, '27017')['election_results']
