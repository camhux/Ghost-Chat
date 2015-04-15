// var socket = io(),
// var controlFlag = false;
var dashboardSocket = io('http://localhost:3000/dashboard');
var chatDisplayTemplate = document.getElementById('viewTemplate');
var chatControlTemplate = document.getElementById('controlTemplate');
var allChatWrapper = document.getElementById('allChatWrapper');
var controlledChatContainer = document.getElementById('controlledChatContainer');


dashboardSocket.on('history', function(history){
  // cleanse wrapper of chat divs
  allChatWrapper.innerHTML = '';

  Object.keys(history).forEach(function(chatId) {

    // Clone window template, set ID
    var chatWindow = chatDisplayTemplate.cloneNode(true);
    chatWindow.id = chatId;
    chatMessages = chatWindow.querySelector('.chatMessages');

    // Set label element
    chatWindow.querySelector('.nameLabel').textContent = 'Chat with: ' + history[chatId].username;

    // Map and format messages from history, then append to display div
    history[chatId].messages.map(function(message) {
      var li = document.createElement('li');
      li.textContent = message.sender + ": " + message.text;
      return li;
      }).forEach(function(li) {
        chatMessages.appendChild(li);
      });

      // Attach listener for takeover
      chatWindow.querySelector('.takeOver').addEventListener('click', function() {
        takeControl(chatId);
      });

      // Append display div to wrapper
      allChatWrapper.appendChild(chatWindow);

  }); 
  
});

dashboardSocket.on('messageUpdate', function(message) {
  var chatWindow = document.getElementById(message.chatId);
  var newMessage = document.createElement('li');
  newMessage.textContent = message.sender + ": " + message.text;
  chatWindow.querySelector('.chatMessages').appendChild(newMessage);
});

function takeControl(chatId) {
  dashboardSocket.emit('assumeControl', chatId);

  allChatWrapper.setAttribute('hidden', '');

  var controlWindow = chatControlTemplate.cloneNode(true);
  controlWindow.id = chatId + '-C';

  var controlChatMessages = controlWindow.querySelector('.chatMessages');
  var passiveChatMessages = document.getElementById(chatId).querySelector('.chatMessages');

  controlChatMessages.innerHTML =  passiveChatMessages.innerHTML;

  var chatInput = controlWindow.querySelector('.chatInput');

  var alreadyTyping = false;

  chatInput.addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
          sendMessage(chatId, event.target.value);
          event.target.value = '';
          alreadyTyping = false;
        }
  });

  // Primitive "user typing" functionality. TODO: Make better, with more logic.
  // The "alreadyTyping" flag, from above, prevents flooding socket with redundant events
  // TODO: This doesn't properly clear when message is sent.
  chatInput.addEventListener('keypress', function(event) {
    if (alreadyTyping === false && (event.keyCode > 49 || event.keyCode < 90)) {
      dashboardSocket.emit('dashTyping', chatId);
      alreadyTyping = true;
    }
  });



  var binder = new MutationObserver(function() {
    controlChatMessages.innerHTML =  passiveChatMessages.innerHTML;
  });

  binder.observe(passiveChatMessages, {childList: true});

  var giveUpButton = controlWindow.querySelector('.giveUp');
  giveUpButton.addEventListener('click', function(event) {
    removeControlInServer(chatId);
    controlledChatContainer.innerHTML = '';
    allChatWrapper.removeAttribute('hidden');
  });

  controlledChatContainer.appendChild(controlWindow);
}

// Return control to the advanced ghost AI
function removeControlInServer(chatId) {
  dashboardSocket.emit('removeControl', chatId)
}

// Create formatted message and emit it with specific event
function sendMessage(chatId, text) {
  var isolatedMessage = {chatId: chatId, text: text, sender: "ghost", timestamp: Date.now()};
  dashboardSocket.emit('dashMessage', isolatedMessage);
}

