var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dashboard = io.of('/dashboard.io');
var haunt = require('./haunt.js');
var history = {};
var chatIDs = {};




// Public chat socket handler
io.on('connection', function(socket){
		// IIFE returns closure for each socket
		return (function(socket)	{
					/* Declare var to store username for greeting, and initialize flag
					 * to prevent simultaneous responses to multiple quick inputs */
					var username, responseFlag = false;
				
					// One-off name registration for socket
					socket.on('username', function(val) {
						username = val;
						chatIDs[username] = socket.id;
						responseFlag = true;
						setTimeout(function() {
							socket.emit('typing');
							setTimeout(function() {
								io.to(socket.id).emit('chatMessage', haunt.greet(username));
								responseFlag = false;
							}, haunt.firstTyping())
						}, haunt.firstPause());
						
					});
				
					// Message routing
					socket.on('chatMessage', function(message){
						if (responseFlag === false) {
							responseFlag = true;
							setTimeout(function() {
								socket.emit('typing');
								setTimeout(function() {
									io.to(socket.id).emit('chatMessage', haunt.respond()); 
									responseFlag = false;
								}, haunt.responseTyping());
							}, haunt.responsePause());
						}
					});
				
					// Listener for dashboard join
					socket.on('joinRequest', function(id) {
						socket.join(id);
						console.log('Dashboard socket successfully joined room ID: ' + id);
					});
		
			})

}());

// Dashboard connection handler
dashboard.on('connection', function(socket) {
	// IIFE returns closure for each socket
	return function(socket){
		// Send object of ongoing chats to begin monitoring
		socket.emit('chatIDSync', chatIDs);
	}

}());



// Serve index
// app.get('/', function(req, res) {
// 	res.sendFile(__dirname + '/public/index.html');
// });

// Dashboard route
// app.route('/dashboard')
// .get(function(req, res, next) {
// 	res.sendFile(__dirname + '/dashboard/dashboard.html')
// });


// Statics
app.use('/', express.static(__dirname + '/public'));

// app.use('/socket.io.js', express.static(__dirname + '/node_modules/socket.io/node_modules/socket.io-client'));
app.use('/dashboard', express.static(__dirname + '/dashboard', {index: "dashboard.html"}));

// Serve socket client file to browser when requested
app.get('/socket.io.js', function (req, res, next) {
	res.sendFile(__dirname + '/node_modules/socket.io/node_modules/socket.io-client/socket.io.js')
});

// Catch-all 404
app.use(function(req, res) {
	res.send('404');
});

// Initialization
http.listen(3000);
console.log('Go peep it at localhost:3000, friend.');