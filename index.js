import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { dbConnect } from './database/db.js';
import userRoutes from './routes/userRoutes.js';
import docRoutes from './routes/docRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import appoinmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swaggerConfig.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//connecting to the database
dbConnect();

//importing routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to EZHealth Backend</h1>
    <p>Frontend URL: ${process.env.FRONTEND_URL}</p>
  `);
});
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/doctor', docRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/appointment', appoinmentRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/ai', aiRoutes);

//start the server
app.listen(process.env.PORT, () => {
  console.log(`Server connected at Port:${process.env.PORT}`);
});
