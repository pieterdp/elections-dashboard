from flask import Flask
from elections.routes.api import api
from elections.routes.ui import ui


app = Flask(__name__)
app.register_blueprint(api)
app.register_blueprint(ui)


if __name__ == '__main__':
    app.run(debug=True)
