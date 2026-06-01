import { Server } from 'socket.io';

let io;

// Map to track online users
// { userId: socketId }
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client sends their userId after connecting
    socket.on('register', (userId) => {
      if (userId) {
        onlineUsers.set(userId.toString(), socket.id);
        console.log(`👤 User ${userId} registered with socket ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      // Remove user from online map
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`👤 User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const getOnlineUsers = () => onlineUsers;
