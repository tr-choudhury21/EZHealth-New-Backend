import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerDefinition } from './swagger/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

// ─── Routes ──────────────────────────────────────────────────────────────────
import userRoutes from './modules/user/user.routes.js';
import doctorRoutes from './modules/doctor/doctor.routes.js';
import appointmentRoutes from './modules/appointment/appointment.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import adminRoutes from './modules/user/admin.routes.js';
import notificationRoutes from './shared/notifications/notification.routes.js';
import reviewRoutes from './review/review.routes.js';
// import aiRoutes from './ai/ai.routes.js';

const app = express();

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// ─── Swagger ──────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EZHealth API is running',
    docs: '/api-docs',
    version: '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/doctor', doctorRoutes);
app.use('/api/v1/appointment', appointmentRoutes);
app.use('/api/v1/payment', paymentRoutes);
// app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
