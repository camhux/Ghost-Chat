var chatField,
	chatButton,
	chatInput,
	chatMessages,
	socket = io(), 
	nameInput = document.getElementById("username"), 
	mainDiv = document.getElementById("main");
	

// Name entry event handlers
nameInput.addEventListener("focus", function(event) {
	if (event.target.value === '') {
		event.target.placeholder = '';
		event.stopPropagation();
	}
});

nameInput.addEventListener("blur", function(event) {
	if (event.target.value === '') {
		event.target.placeholder = 'There\'s plenty of time.';
		event.stopPropagation();
	}
});

// Name input transforms the DOM, presenting chat elements
nameInput.addEventListener("keydown", function(event) {
	if (event.keyCode === 13) {
		socket.emit('username', event.target.value);
		mainDiv.innerHTML = '<div id="chatWrapper"><ul id="chatMessages"></ul><span id="chatInput"><input type="text" id="chatField" noautocomplete><input type="button" value="Send" id="sendButton"></span></div>'
		
		// Grab new handles
		chatMessages = document.getElementById("chatMessages");
		chatInput = document.getElementById("chatInput");
		chatField = document.getElementById("chatField");
		chatButton = document.getElementById("sendButton");

		// Chat input handlers
		chatButton.addEventListener("click", sendMessage);
		
		chatInput.addEventListener("keypress", function(event) {
			if (event.keyCode === 13)
					sendMessage(event);
			});
	}
});
// End name entry handlers



// Callback for message emission
function sendMessage(event) {
	var newItem;
	if (chatField.value != '') {
		socket.emit('message', chatField.value);
		newItem = document.createElement('li');
		newItem.textContent = chatField.value;
		chatField.value = '';
		chatMessages.appendChild(newItem);
	}
	event.stopPropagation();
}