module.exports=async (io, roomId, event, data) => {
    const socketsInRoom = await io.in(roomId).fetchSockets();
    
    socketsInRoom.forEach((connectedSocket) => {
        if (connectedSocket.currentRoomId === roomId) {
            connectedSocket.emit(event, data);
        }
    });
};
