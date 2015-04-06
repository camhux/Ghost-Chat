var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var haunt = require(__dirname + '/haunt.js');


// Socket handler for name entry
io.on('connection', function(socket){
	
	/* Declare var to store username for greeting, and initialize flag
	 * to prevent simultaneous responses to multiple quick inputs */
	var username, responseFlag = false;

	// One-off name registration for socket
	socket.on('username', function(val) {
		username = val;
		responseFlag = true;
		setTimeout(function() {
			socket.emit('typing');
			setTimeout(function() {
				socket.emit('message', haunt.greet(username));
				responseFlag = false;
			}, (Math.random()*4000 + 2000));
		}, (Math.random()*3000 + 3000));
		
	});

	// Message routing
	socket.on('message', function(message){
		if (responseFlag === false) {
			responseFlag = true;
			setTimeout(function() {
				socket.emit('typing');
				setTimeout(function() {
					socket.emit('message', haunt.respond()); 
					responseFlag = false;
				}, (Math.random()*3000 + 3000));
			}, (Math.random()*3000 + 1000));
			
		}
	});


});

// Serve index
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// Statics
app.use(express.static('public'));
app.use('/socket.io', express.static('node_modules/socket.io/node_modules/socket.io-client'));

// Catch-all 404
app.use(function(req, res) {
	res.send('404');
});

// Initialization
http.listen(3000);
console.log('Go peep it at localhost:3000, friend.');