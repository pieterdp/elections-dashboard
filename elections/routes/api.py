from flask import Blueprint
from elections.api import Api


api = Blueprint('api', __name__)


@api.route('/api/results/<string:vl_id>', methods=['GET'])
@api.route('/api/results/year/<string:vl_year>/<string:vl_id>', methods=['GET'])
@api.route('/api/results/year/<string:vl_year>/version/<string:vl_version>/<string:vl_id>', methods=['GET'])
def results(vl_id, vl_year='2018', vl_version='2018'):
    a = Api()
    return a.get(vl_id, vl_version, vl_year)

