var socket = io(),
		chatWrapper = document.getElementById('chatWrapper'),
		introWrapper = document.getElementById('introWrapper'),
		chatMessages = document.getElementById('chatMessages'),
		chatInput = document.getElementById('chatInput'),
		chatField = document.getElementById('chatField'),
		chatButton = document.getElementById('sendButton'),
		typeIndicator = document.getElementById('typeIndicator'),
		nameInput = document.getElementById('username'), 
		mainDiv = document.getElementById('main');
	

// Name entry event handlers
nameInput.addEventListener('focus', function(event) {
	if (event.target.value === '') {
		event.target.placeholder = '';
		event.stopPropagation();
	}
});

nameInput.addEventListener('blur', function(event) {
	if (event.target.value === '') {
		event.target.placeholder = 'There\'s plenty of time.';
		event.stopPropagation();
	}
});

// Name input reveals chat elements
nameInput.addEventListener('keydown', function(event) {
	if (event.keyCode === 13) {
		socket.emit('username', event.target.value);

		chatWrapper.removeAttribute('hidden');
		introWrapper.setAttribute('hidden', '');
	}
});

// Chat input handlers
chatButton.addEventListener('click', sendMessage);
		
chatInput.addEventListener('keypress', function(event) {
	if (event.keyCode === 13)
		sendMessage(event);
});

// Message reception and display
socket.on('chatMessage', function(msg) {
	typeIndicator.className = 'idle';
	var newItem = document.createElement('li');
	newItem.className = 'ghostMsg';
	newItem.textContent = msg;
	chatMessages.appendChild(newItem);
});

// Autoscroll to most recent message when a message is added
chatMessages.addEventListener('DOMNodeInserted', function(event){
	if (chatMessages.scrollHeight > (chatMessages.scrollTop + chatMessages.clientHeight)) {
		chatMessages.scrollTop = chatMessages.scrollHeight - chatMessages.clientHeight;
	}
});

// "Ghost is typing..." revealer
socket.on('typing', function() {
	typeIndicator.className = 'typing';
});


// Callback for message emission
function sendMessage(event) {
	var newItem;
	if (chatField.value != '') {
		socket.emit('chatMessage', chatField.value);
		newItem = document.createElement('li');
		newItem.className = 'selfMsg';
		newItem.textContent = chatField.value;
		chatField.value = '';
		chatMessages.appendChild(newItem);
	}
	event.stopPropagation();
}