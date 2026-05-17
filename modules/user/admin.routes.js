import express from 'express';
import {
  addNewAdmin,
  getAdminProfile,
  logoutAdmin,
} from '../user/user.controller.js';
import { verifyDoctor } from '../doctor/doctor.controller.js';
import { isAdminAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

// ─── Admin Auth ───────────────────────────────────────────────────────────────
router.post('/new', addNewAdmin);
router.get('/me', isAdminAuthenticated, getAdminProfile);
router.post('/logout', isAdminAuthenticated, logoutAdmin);

// ─── Doctor Management ────────────────────────────────────────────────────────
router.put('/verify-doctor/:id', isAdminAuthenticated, verifyDoctor);

export default router;
