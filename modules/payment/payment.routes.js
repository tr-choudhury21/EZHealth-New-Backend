import express from 'express';
import { createOrder, verifyPayment } from './payment.controller.js';
import { isPatientAuthenticated } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../../rbac/roles.js';

const router = express.Router();

// ─── Payment ──────────────────────────────────────────────────────────────────
router.post(
  '/create-order',
  isPatientAuthenticated,
  requirePermission(PERMISSIONS.CREATE_PAYMENT_ORDER),
  createOrder,
);
router.post(
  '/verify',
  isPatientAuthenticated,
  requirePermission(PERMISSIONS.VERIFY_PAYMENT),
  verifyPayment,
);

export default router;
