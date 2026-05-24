import express from 'express';
import {
  addNewAdmin,
  getAdminProfile,
  logoutAdmin,
} from '../user/user.controller.js';
import { verifyDoctor } from '../doctor/doctor.controller.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../../rbac/roles.js';
import { isAdminAuthenticated } from '../../middlewares/auth.js';
import { getAuditLogs } from '../shared/audit/audit.controller.js';

const router = express.Router();

// ─── Admin Auth ───────────────────────────────────────────────────────────────
router.post('/new', requirePermission(PERMISSIONS.ADD_ADMIN), addNewAdmin);
router.get(
  '/me',
  isAdminAuthenticated,
  requirePermission(PERMISSIONS.VIEW_ADMIN_PROFILE),
  getAdminProfile,
);
router.get(
  '/audit-logs',
  isAdminAuthenticated,
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS),
  getAuditLogs,
);
router.post('/logout', isAdminAuthenticated, logoutAdmin);

// ─── Doctor Management ────────────────────────────────────────────────────────
router.put(
  '/verify-doctor/:id',
  isAdminAuthenticated,
  requirePermission(PERMISSIONS.VERIFY_DOCTOR),
  verifyDoctor,
);

export default router;
