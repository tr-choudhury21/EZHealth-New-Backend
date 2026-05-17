import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { startCronJobs } from './utils/cron.js';
import { dbConnect } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnect();
    startCronJobs();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📄 Docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
