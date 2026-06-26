import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerPatient,
  login,
  logoutAdmin,
  logoutPatient,
  addNewAdmin,
  getUserProfile,
  getAdminProfile,
  verifyUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe,
  refreshToken,
} from './user.controller.js';
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from '../../middlewares/auth.js';

const router = express.Router();

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts, try again later' },
});

// ─── Auth ────────────────────────────────────────────────────────────────────
router.post('/patient/register', registerPatient);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Email verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Password reset
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// ─── Patient ─────────────────────────────────────────────────────────────────
router.get('/patient/me', isPatientAuthenticated, getUserProfile);
router.post('/patient/logout', isPatientAuthenticated, logoutPatient);

// ─── Admin ───────────────────────────────────────────────────────────────────
router.post('/admin/new', isAdminAuthenticated, addNewAdmin);
router.get('/admin/me', isAdminAuthenticated, getAdminProfile);
router.post('/admin/logout', isAdminAuthenticated, logoutAdmin);

// ─── Shared ──────────────────────────────────────────────────────────────────
router.get('/me', getMe);
router.get('/verify', verifyUser);

export default router;
