module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('joinRoom', async (roomId) => {
      if (!roomId) return;
      await socket.join(roomId);
    });

    socket.on('leaveRoom', async (roomId) => {
      if (!roomId) return;
      await socket.leave(roomId);
    });
  });
};
