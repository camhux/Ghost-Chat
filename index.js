var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var EventEmitter = require('events');

var dashboard = io.of('/dashboard');
var haunt = require('./haunt.js');
var liveHistory = {};
var closedHistory = {};

/* Initialize an emitter that will be the intermediary between
our socket managers, passing simple messages between. */
var controlManager = new EventEmitter;

// Public chat socket handler
io.on('connection', function(socket){
    /* Initialize flag to prevent simultaneous responses to multiple quick inputs,
       and holder variable to prevent duplicate responses in a row */
    var lastResponse, controlFlag = false, responseFlag = false;

    /* Bind two listeners to control the controlFlag; events are limited 
       to the right socket by concatenating the ID right on. Dashboard has access
       to the same ID through the history object/message interface */
    controlManager.on('enableControlOnSocket' + socket.id, function() {
      controlFlag = true;
    });

    controlManager.on('disableControlOnSocket' + socket.id, function() {
      controlFlag = false;
    });
 
    // One-off name registration for socket
    socket.on('username', function(username) {
      // Create history key for socket by ID, format for message containment
      liveHistory[socket.id] = { messages: [], username: username };
      // Hard-refresh all dashboards
      sendHistoryToDashboard();

      if (controlFlag === false) {
            responseFlag = true;
            setTimeout(function() {
              socket.emit('typing');
              setTimeout(function() {
                // Save ghost's greeting and send to dashboard
                var greeting = haunt.greet(username);
                sendMessageToDashboard(saveMessage(socket.id, 'ghost', greeting, Date.now(), true));
                // Emit greeting
                socket.emit('chatMessage', greeting);
                socket.emit('stopTyping');
                responseFlag = false;
              }, haunt.firstTyping());
            }, haunt.firstPause());
          }
      
    });
  
    // Message routing
    socket.on('chatMessage', function(message){
      // Save user's message and send to dashboard
      sendMessageToDashboard(saveMessage(socket.id, 'user', message, Date.now(), true));

      if (controlFlag === false) {
            if (responseFlag === false) {
              responseFlag = true;
              setTimeout(function() {
                socket.emit('typing');
                setTimeout(function() {
                  var response = lastResponse = haunt.respond(lastResponse);
                  // Save ghost's response and send to dashboard
                  sendMessageToDashboard(saveMessage(socket.id, 'ghost', response, Date.now(), true));
                  // Emit response
                  socket.emit('chatMessage', response);
                  socket.emit('stopTyping');
                  responseFlag = false;
                }, haunt.responseTyping());
              }, haunt.responsePause());
            }
          }
    });


    // Delete history and clean up exposed listeners when a user disconnects
    socket.on('disconnect', function() {
      deleteHistory(socket.id, responseFlag);
      controlManager.removeAllListeners('enableControlOnSocket' + socket.id)
        .removeAllListeners('disableControlOnSocket' + socket.id);
  });

});

// Dashboard connection handler: hard-refreshes all dashboards
dashboard.on('connection', function(socket) {
  sendHistoryToDashboard(socket);

  // Block ghost responses on indicated socket
  socket.on('assumeControl', function(chatId) {
    controlManager.emit('enableControlOnSocket' + chatId);
  });

  // Restore ghostly powers
  socket.on('removeControl', function(chatId) {
    controlManager.emit('disableControlOnSocket' + chatId);
  });

  // Indicate when a human ghost is typing, too
  socket.on('dashTyping', function(data) {
    io.to(data.chatId).emit('typing');
  });

  socket.on('dashStopTyping', function(data) {
    io.to(data.chatId).emit('stopTyping');
  });

  /* When dash sends message, it first saves it to history and sends it back
  to the dash itself as if the ghost had sent it, then emits it to the user socket*/
  socket.on('dashMessage', function(message) {
    sendMessageToDashboard(
      saveMessage(message.chatId, message.sender, message.text, message.timestamp, true));
    io.to(message.chatId).emit('chatMessage', message.text);
  });

});

function saveMessage(socketId, sender, text, timestamp, returnFlag) {
  // Add message to corresponding entry in liveHistory
  liveHistory[socketId].messages.push({
    text: text,
    sender: sender,
    timestamp: timestamp
  });

  // Prepare variable in case the individual message is to be returned
  var isolatedMessage;

  // If individual message is requested in call, format and assign it
  if (returnFlag) {
    isolatedMessage = {chatId: socketId, text: text, sender: sender, timestamp: timestamp};
  }

  // Return either undefined (no issue if call is not nested) or the message
  return isolatedMessage;
}

function sendMessageToDashboard(message) {
  dashboard.emit('messageUpdate', message)
}

function sendHistoryToDashboard(socket) {
  /* Hard-refresh either all dashboards (if there's no socket param)
  or a specific socket */
  if (socket) {
    dashboard.to(socket.id).emit('history', liveHistory);
  } else {
    dashboard.emit('history', liveHistory);
  }
}

// Delete function waits for response timeouts to clear to prevent race condition on liveHistory property
function deleteHistory(socketId, responseFlag) {
  if (responseFlag === true) {
    setTimeout(deleteHistory(socketId, responseFlag), 5000);
  } else {
    closedHistory[socketId] = liveHistory[socketId];
    delete liveHistory[socketId];
    sendHistoryToDashboard();
  }
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

