import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import { dbConnect } from './database/db.js';
import { initSocket } from './config/socket.js';
import { startCronJobs } from './utils/cron.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnect();
    console.log('✅ Database connected');

    // Create HTTP server from express app
    // Socket.IO needs raw HTTP server not express app
    const httpServer = http.createServer(app);

    // Initialize Socket.IO with HTTP server
    initSocket(httpServer);
    console.log('🔌 Socket.IO initialized');

    startCronJobs();
    console.log('⏰ Cron jobs started');

    // Use httpServer.listen NOT app.listen
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📄 Docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
