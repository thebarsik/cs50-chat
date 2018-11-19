import os

from flask import Flask, Session, request, redirect, url_for
from flask_socketio import SocketIO, emit
from flask import render_template
from datetime import datetime

from message import Message

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


# chat history
history = {}
active_channels = []
username = "Anonymus"


@app.route("/")
def index():
    print("\n")
    print("===== Welcome to the simple chat app =====")

    chat_list = []
    for key in active_channels:
        chat_list.append(key)
    context = { "active_channels" : active_channels, "errormessage": ""}
    
    print(f"Passing following channel list { active_channels }")
    print("\n")

    return render_template("index.html", context = context)
    
@app.route("/redirect", methods = ["POST"])
def chat_redirect():
    global username
    if request.form.get("username") != "":
        username = request.form.get("username")
    selected_channel = request.form.get("channellist")
    create_channel_name = request.form.get("channelname")
    button_pressed = request.form.get("submit_button")
    print(f" == Redirecting... button pressed is {button_pressed} == ")
    if button_pressed == "create":
        print("==== Creatig channel ====")
        if create_channel_name != "":
            return redirect(url_for("join_chat", chatindex = create_channel_name))
        else:
            return render_template("error.html")
    else:
        if (selected_channel):
            print("==== Joining channel ====")
            return redirect(url_for("join_chat", chatindex = selected_channel))
        else:
            render_template("error.html")
    return render_template("error.html")

@app.route("/chatroom/<string:chatindex>", methods = ["GET", "POST"])
def join_chat(chatindex):
    context = {"history": history, "chatroomindex":chatindex, "errormessage":""}
    return render_template("chatroom.html", context = context)


# @socketio.on("connect_to_room")
# def connect_ro_room(data):
#     if data["chatroomindex"] in active_channels:
#         active_channels[data["chatroomindex"]] += 1
#     else:
#         active_channels[data["chatroomindex"]] = 1

# @socketio.on("disconnect_from_room")
# def disconnect_from_room(data):
#     active_channels[data["chatroomindex"]] -= 1

@socketio.on("retrieve_channel_list")
def get_active_lists(data):
    print("==== Getting channel list ====")
    
    global active_channels
    active_channels = data["channel_list"]
    active_channels.remove("debug")

    print(f"Success!")

@socketio.on("send_message")
def send_message(data):
    # get data from js
    message = data["message"]
    chatroomindex = data["chatroomindex"]

    # get readable timestamp
    timestamp = datetime.now()
    messagetime = str(timestamp.date()) + "|" + str(timestamp.time().hour) + ":" +str(timestamp.time().minute)
    
    msg = Message(messagetime, username, message)
    # save it to history

    # update history
    update_history(msg.toString(), chatroomindex)

    emit("announce_message", { "message" : msg.toString() }, broadcast = True)


@socketio.on("request_history")
def load_history(data):
    print("\n===============")
    print("Sending history to chat window...")

    chatindex = data["chatroomindex"]
    historystring = get_history_string(chatindex)

    emit("load_history", { "chathistory": historystring}, broadcast = False) 

    print(f" {historystring} of type {str(type(historystring))}")
    print("===============")


def get_history_string(chatindex):
    print("\n===============")
    print("Concating history string")

    hist = []
    for message in history[chatindex]:
        hist.append(message)
    historystring = "\n".join(hist) + "\n"

    print(f"history string is {historystring}")
    print("===============")

    return historystring


def get_history(chatroomname):
    emit("request_history", { "chatroomname":chatroomname }, broadcast = False)

@socketio.on("recieve_history")
def set_history(data):
    print("\n===============")
    print("Recieving history...")

    historystring = data["historystring"]
    history[data["chatroomindex"]] = historystring.split("\n")

    print("Hisotry recieved, length :" + str(len(history[data["chatroomindex"]])))
    print("===============")

def update_history(message, chatroomindex): 
    print("\n===============")
    print(f"Updating history in {chatroomindex} with {message} of type {str(type(message))}...")

    history[chatroomindex].append(message)
    if len(history[chatroomindex]) > 99:
        history[chatroomindex].pop(0)
    # generate chatstrinng
    historystring = get_history_string(chatroomindex)
    # generate chatname
    chat_index_string = str(chatroomindex)
    emit("update_history", { "chathistory": historystring, "chatroomname":chat_index_string }, broadcast = False)

    print("Success!!!")
    print("===============")