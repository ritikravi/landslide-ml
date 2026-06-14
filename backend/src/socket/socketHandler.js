export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    socket.on('request-latest-data', async () => {
      // Client can request latest data
      socket.emit('data-requested');
    });
  });

  return io;
};
