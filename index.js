var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);



// Socket handler for name entry
io.on('connection', function(socket){
	var username;

	console.log("someone connected");

	// One-off name registration for socket
	socket.on('username', function(val) {
		username = val;
		console.log(username);
	});

	// Message routing
	socket.on('message', function(message){
		console.log(message);
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