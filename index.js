var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var dashboard = io.of('/dashboard');
var haunt = require('./haunt.js');
var history = {};

// Public chat socket handler
io.on('connection', function(socket){
    /* Declare var to store username for greeting, and initialize flag
     * to prevent simultaneous responses to multiple quick inputs */
    var responseFlag = false;
 
    // One-off name registration for socket
    socket.on('username', function(username) {
      history[socket.id] = { messages: [], username: username };

      responseFlag = true;
      setTimeout(function() {
        socket.emit('typing');
        setTimeout(function() {
          // save ghost's greeting
          var greeting = haunt.greet(username);
          saveMessage(socket.id, 'ghost', greeting, Date.now());
          io.to(socket.id).emit('chatMessage', greeting);
          responseFlag = false;
        }, haunt.firstTyping());
      }, haunt.firstPause());
      
    });
  
    // Message routing
    socket.on('chatMessage', function(message){
      // save user's message
      saveMessage(socket.id, 'user', message, Date.now());

      if (responseFlag === false) {
        responseFlag = true;
        setTimeout(function() {
          socket.emit('typing');
          setTimeout(function() {
            var response = haunt.respond();
            // save ghost's response
            saveMessage(socket.id, 'ghost', response, Date.now());

            io.to(socket.id).emit('chatMessage', response);
            responseFlag = false;
          }, haunt.responseTyping());
        }, haunt.responsePause());
      }
    });
});

// Dashboard connection handler
dashboard.on('connection', function(socket) {
  sendHistoryToDashboard();
});


function saveMessage(socketId, sender, text, timestamp) {
  history[socketId].messages.push({
    text: text,
    sender: sender,
    timestamp: timestamp
  });

  sendHistoryToDashboard();
}

function sendHistoryToDashboard() {
  // send the whole history object to every dashboard
  // todo: send incremental changes
  dashboard.emit('history', history);
}


// Statics
app.use('/', express.static(__dirname + '/public'));
app.use('/db', express.static(__dirname + '/dashboard', {index: "dashboard.html"}));

// Serve socket client file to browser when requested
app.get('/socket.io.js', function (req, res, next) {
  res.sendFile(__dirname + '/node_modules/socket.io/node_modules/socket.io-client/socket.io.js')
});

// Catch-all 404
app.use(function(req, res) {
  res.send('404');
});

// Initialization
server.listen(3000, function() {
  console.log('Go peep it at localhost:3000, friend.');  
});

