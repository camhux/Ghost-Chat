var socket = io(''),
    dashboardSocket = io('/dashboard.io');

dashboardSocket.on('chatIDSync', function(data) {
  for (var id in data) {
    console.log(data[id]);
    socket.emit('joinRequest', data[id]);
  }
});

socket.on('chatMessage', function(msg){
  console.log(msg);
});