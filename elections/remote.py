import requests
from functools import reduce


class VlApi:
    API_VERSIONS = {
        '2018': 'https://www.vlaanderenkiest.be/verkiezingen2018/api/{0}/lv/gemeente/{1}/{2}',
        '2012': 'https://www.vlaanderenkiest.be/verkiezingen2012/{0}/gemeente/{1}/{2}'
    }

    def __init__(self, vl_version, vl_year, vl_id):
        self.I_HAVE_NO_COLOUR = ['#dcdcdc', '#d3d3d3', '#c0c0c0', '#a9a9a9', '#808080', '#696969', '#778899', '#708090',
                                 '#2f4f4f']
        self.url = self.API_VERSIONS[vl_version].format(
            vl_year,
            vl_id,
            '{0}'
        )
        self.__id = vl_id
        self.lists = self.get_lists()
        self.results = self.get_results()

    def get_lists(self):
        # https://www.vlaanderenkiest.be/verkiezingen2012/2012/gemeente/41034/entiteitLijsten.json
        r = requests.get(self.url.format('entiteitLijsten.json'))
        r.raise_for_status()
        parties = {}
        for party_id, party in r.json()['G'].items():
            party_f = {
                'id': party_id,
                'name': party['nm']
            }
            if 'kl' in party:
                if party['kl'] != '':
                    party_f['colour'] = self.I_HAVE_NO_COLOUR.pop()
                else:
                    party_f['colour'] = party['kl']
            else:
                party_f['colour'] = self.I_HAVE_NO_COLOUR.pop()
            parties[party_id] = party_f
        return parties

    def get_results(self):
        # https://www.vlaanderenkiest.be/verkiezingen2012/2006/gemeente/41034/entiteitUitslag.json
        r = requests.get(self.url.format('entiteitUitslag.json'))
        r.raise_for_status()
        results = []
        result_json = r.json()
        total = self.total(result_json)
        for party_id, result in result_json['G'][self.__id]['us'].items():
            results.append({
                'id': party_id,
                'name': self.lists[party_id]['name'],
                'colour': self.lists[party_id]['colour'],
                'votes': result['sc'],
                'seats': result['zs'] if 'zs' in result else None,
                'percentage': (result['sc'] / total * 100) if total > 0 else 0
            })
        polling_stations = self.parse_polling_stations(result_json['G'][self.__id]['gb'])
        return {
            'id': self.__id,
            'polling_stations': polling_stations['total'],
            'counted_stations': polling_stations['counted'],
            'total_votes': total,
            'results': results
        }

    def parse_polling_stations(self, vl_gb):
        polling_stations_a = vl_gb.split('/')
        return {
            'counted': polling_stations_a[0],
            'total': polling_stations_a[1]
        }

    def total(self, result_json):
        return \
            reduce(lambda x, y: x + y, [r['sc'] for r in result_json['G'][self.__id]['us'].values()]) \
            + result_json['G'][self.__id]['os']
