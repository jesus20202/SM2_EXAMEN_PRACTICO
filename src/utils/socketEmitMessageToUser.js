module.exports = function(io, userId, event, data) {
  if (!io || !io.sockets || !io.sockets.sockets) {
    console.error('Instancia de Socket.IO inválida.');
    return;
  }

  const sockets = Array.from(io.sockets.sockets.values());

  const userSockets = sockets.filter(socket => socket.userId.toString() === userId.toString());

  if (userSockets.length === 0) {
    return;
  }

  userSockets.forEach(socket => {
    socket.emit(event, data);
  });
};
