// var socket = io(),
var dashboardSocket = io('http://localhost:3000/dashboard');

dashboardSocket.on('history', function(history){
  Object.keys(history).forEach(function(chatId) {
    console.log(history[chatId]);
    var chatname = document.createElement('li');
    chatname.textContent = 'Chat with: ' + history[chatId].username;
    document.body.appendChild(chatname);


    var messages = history[chatId].messages.map(function(message) {
      return message.text;
    });
    
    var messagesEl = document.createElement('li');
    messagesEl.textContent = messages;
    document.body.appendChild(messagesEl);
  });
  
});
