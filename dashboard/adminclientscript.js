var socket = io(''),
    dashboardSocket = io('/dashboard.io');

dashboardSocket.on('chatIDSync', function(data) {
  for (ID in data) {
    console.log(data[ID]);
    socket.emit('joinRequest', data[ID])
  }
});

socket.on('chatMessage', function(msg){
  console.log(msg);
});