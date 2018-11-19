document.addEventListener("DOMContentLoaded", function () {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on("connect", function () {
        
        var chatroomindex = chtindex.dataset.chatroomindex;
        
        // lading history with first document load
        if(!localStorage.getItem(chatroomindex)) {
            localStorage.setItem(chatroomindex, "No messages here yet!");
        }
        var historystring = localStorage.getItem(chatroomindex);
        socket.emit("recieve_history", { "historystring" : historystring, "chatroomindex": chatroomindex});
        socket.emit("request_history", { "chatroomindex": chatroomindex });
        // socket.emit("connect_to_room", { "chatroomindex": chatroomindex })

        // emit messagen on send button click
        document.querySelector("#messagesend").onclick = function () {
            // get message
            const message = document.querySelector("#messagebox").value;
            //clear messagebox
            document.querySelector("#messagebox").value = "";
            // get chatroom index
            
            // send message
            socket.emit("send_message", { "message":message, "chatroomindex": chatroomindex } );
        };
    });

    // updating localstorage
    socket.on("update_history", function (data) {
        localStorage.setItem(data.chatroomname, data.chathistory)
    });

    // loading history in caht window
    socket.on("load_history", function (data) {
        document.querySelector("#chathistory").value = data.chathistory;
    });

    // announce message to chat history
    socket.on("announce_message", function (data) {
        // update message screen
        const msg = data.message + "\n";
        document.querySelector("#chathistory").value += msg;
    });

    socket.on("disconnect", function () {
        //socket.emit("disconnect_from_room", { "chatroomindex": chatroomindex })
    });
});