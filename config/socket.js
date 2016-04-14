module.exports = function(socketioServer) {
	socketioServer.on('connection', function(socket) {
		socket.on('join', function(data) {
			socket.join(data.id);
		});

		socket.on('forceDisconnect', function() {
    		socket.disconnect();
		});

		socket.on('chat_frontend', function(data) {
			socketioServer.in(data.chat_list_id).emit('chat_backend', data);
		});		
	});
};
