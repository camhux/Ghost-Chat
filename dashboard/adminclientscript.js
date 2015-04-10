// var socket = io(),
var dashboardSocket = io('http://localhost:3000/dashboard');
var chatDisplayTemplate = document.getElementById('template');
var allChatWrapper = document.getElementById('allChatWrapper');


dashboardSocket.on('history', function(history){
  // cleanse wrapper of chat divs
  allChatWrapper.innerHTML = '';

  Object.keys(history).forEach(function(chatId) {

    // Clone window template, set ID
    var chatWindow = chatDisplayTemplate.cloneNode(true);
    chatWindow.id = (chatId);

    // Set label element
    chatWindow.querySelector('.nameLabel').textContent = 'Chat with: ' + history[chatId].username;

    // Map and format messages from history, then append to display div
    history[chatId].messages.map(function(message) {
      var li = document.createElement('li');
      li.textContent = message.sender + ": " + message.text;
      return li;
      }).forEach(function(li) {
        chatWindow.querySelector('.chatMessages').appendChild(li);
      });

      // Append display div to wrapper
      allChatWrapper.appendChild(chatWindow);

  }); 
  
});

