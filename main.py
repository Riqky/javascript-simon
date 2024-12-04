from random import randint

from flask import *
from flask_socketio import *

app = Flask(__name__, template_folder="frontend", static_folder="frontend/static")
socketio = SocketIO(app,debug=True,cors_allowed_origins='*')

"""
Show: The screen that shows the seq (touch not required)
Touch: The screen that records the seq, so touch is needed.
"""

@app.route("/")
def get_index():
    return abort(404)

@app.route("/show")
def get_show():
    return render_template("show.html")

@app.route("/touch")
def get_touch():
    return render_template("touch.html")

@socketio.on("start")
def start():
    print("start")
    #generate seq and send it
    numbers = []
    for i in range(5):
        numbers.append(randint(1, 4))

    emit("start", numbers, broadcast=True)

@socketio.on("fail")
def fail():
    print("fail")
    emit("fail", "you failed!", broadcast=True)

@socketio.on("win")
def win():
    print("win")
    emit("win", "super_secret_code", broadcast=True)

@socketio.on("new_round")
def win():
    print("new_round")
    emit("new_round", "", broadcast=True)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=True)