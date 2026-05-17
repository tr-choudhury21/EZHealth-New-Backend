import express from 'express';
import { createOrder, verifyPayment } from './payment.controller.js';
import { isPatientAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

// ─── Payment ──────────────────────────────────────────────────────────────────
router.post('/create-order', isPatientAuthenticated, createOrder);
router.post('/verify', isPatientAuthenticated, verifyPayment);

export default router;
