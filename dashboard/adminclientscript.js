// var socket = io(),
var dashboardSocket = io('http://localhost:3000/dashboard');
var chatWindow = document.getElementById('cw1')


dashboardSocket.on('history', function(history){
chatWindow.innerHTML = '';
  Object.keys(history).forEach(function(chatId) {
    
    var chatname = document.createElement('li');
    chatname.textContent = 'Chat with: ' + history[chatId].username;
    chatWindow.appendChild(chatname);


    var messages = history[chatId].messages.map(function(message) {
      return message.text;
    });
    
    var messagesEl = document.createElement('li');
    messagesEl.textContent = messages;
    chatWindow.appendChild(messagesEl);
  });
  
});

