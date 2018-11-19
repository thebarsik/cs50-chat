document.addEventListener("DOMContentLoaded", function () {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on("connect", function () {
        
        if (!window.localStorage) {
            Object.defineProperty(window, "localStorage", new (function () {
              var aKeys = [], oStorage = {};
              Object.defineProperty(oStorage, "getItem", {
                value: function (sKey) { return this[sKey] ? this[sKey] : null; },
                writable: false,
                configurable: false,
                enumerable: false
              });
              Object.defineProperty(oStorage, "key", {
                value: function (nKeyId) { return aKeys[nKeyId]; },
                writable: false,
                configurable: false,
                enumerable: false
              });
              Object.defineProperty(oStorage, "setItem", {
                value: function (sKey, sValue) {
                  if(!sKey) { return; }
                  document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
                },
                writable: false,
                configurable: false,
                enumerable: false
              });
              Object.defineProperty(oStorage, "length", {
                get: function () { return aKeys.length; },
                configurable: false,
                enumerable: false
              });
              Object.defineProperty(oStorage, "removeItem", {
                value: function (sKey) {
                  if(!sKey) { return; }
                  document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                },
                writable: false,
                configurable: false,
                enumerable: false
              });    
              Object.defineProperty(oStorage, "clear", {
                value: function () {
                  if(!aKeys.length) { return; }
                  for (var sKey in aKeys) {
                    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                  }
                },
                writable: false,
                configurable: false,
                enumerable: false
              });
              this.get = function () {
                var iThisIndx;
                for (var sKey in oStorage) {
                  iThisIndx = aKeys.indexOf(sKey);
                  if (iThisIndx === -1) { oStorage.setItem(sKey, oStorage[sKey]); }
                  else { aKeys.splice(iThisIndx, 1); }
                  delete oStorage[sKey];
                }
                for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) { oStorage.removeItem(aKeys[0]); }
                for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
                  aCouple = aCouples[nIdx].split(/\s*=\s*/);
                  if (aCouple.length > 1) {
                    oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
                    aKeys.push(iKey);
                  }
                }
                return oStorage;
              };
              this.configurable = false;
              this.enumerable = true;
            })());
          }


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