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
  // Block response generation on server
  dashboardSocket.emit('assumeControl', chatId);

  // Hide passive chat displays
  allChatWrapper.setAttribute('hidden', '');

  // Clone and identify (with modified chat ID) the new chat window
  var controlWindow = chatControlTemplate.cloneNode(true);
  controlWindow.id = chatId + '-C';

  // Grab handles for chat message data, and mirror content
  var controlChatMessages = controlWindow.querySelector('.chatMessages');
  var passiveChatMessages = document.getElementById(chatId).querySelector('.chatMessages');

  controlChatMessages.innerHTML =  passiveChatMessages.innerHTML;

  // Grab handle for chat input and initialize a flag for "Ghost is typing" function
  var chatInput = controlWindow.querySelector('.chatInput');
  var alreadyTyping = false;

  // Input listener
  chatInput.addEventListener('keypress', function(event) {
    if (event.keyCode === 13) {
          sendMessage(chatId, event.target.value);
          event.target.value = '';
          alreadyTyping = false;
          chatInput.blur();
        }
  });

  // Primitive "user typing" functionality. 
  chatInput.addEventListener('focus', function(event) {
    dashboardSocket.emit('dashTyping', chatId);
  });

  chatInput.addEventListener('blur', function(event) {
    dashboardSocket.emit('dashStopTyping', chatId);
  });


  /* Initialize and use an observer to watch the dashboard message field and mirror it
     to the controlled chat.
     Using this one-way binding prevents some icky routing with socket events. */
  var binder = new MutationObserver(function() {
    controlChatMessages.innerHTML =  passiveChatMessages.innerHTML;
  });

  binder.observe(passiveChatMessages, {childList: true});

  // Make the "relinquish" button do something
  var giveUpButton = controlWindow.querySelector('.giveUp');
  giveUpButton.addEventListener('click', function(event) {
    removeControlInServer(chatId);
    controlledChatContainer.innerHTML = '';
    allChatWrapper.removeAttribute('hidden');
  });

  // Append that sucker. You're the ghost now
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

