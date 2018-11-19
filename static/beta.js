
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('button').onclick = sendMessage; 
});

window.onload = loadHistory;
var username = prompt("Please choose username!", "Anonymus");

function loadHistory()
{
    if(!localStorage.getItem('chathistory'))
    {
        localStorage.setItem('chathistory', ['\n'])
    }
    chathistory = JSON.parse(localStorage.getItem("chathistory"));
    if (chathistory.length < 1)
    {
        return;
    }
    document.querySelector("#history").value = chathistory.join("\n");
}

function updateLocalHistory() {
    hist = document.querySelector("#history").value.split("\n");
    if (hist.length >= 99)
    {
        hist.splice(0,hist.length-100);
    }
    if (hist.length === 0)
    {
        return;
    }
    localStorage.setItem("chathistory", JSON.stringify(hist));  
}

function sendMessage() {
    let msg = document.querySelector("#message").value;
    let hist = document.querySelector("#history").value;
    let timestamp = new Date().toString().split("GMT")[0];
    message = timestamp + "- " + username + " : " + msg;
    hist = hist + message + "\n";
    document.querySelector("#history").value = hist;
    document.querySelector("#message").value = "";
    document.querySelector("#history").scrollTop = document.querySelector("#history").scrollHeight;
    updateLocalHistory();
}
