import express from 'express';
import {
  getAvailableSlots,
  bookAppointment,
  cancelAppointment,
  getAllAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} from './appointment.controller.js';
import {
  isAdminAuthenticated,
  isDoctorAuthenticated,
  isPatientAuthenticated,
} from '../../middlewares/auth.js';
import {
  requirePermission,
  requireOwnership,
} from '../../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../../rbac/roles.js';
import { findAppointmentById } from './appointment.repository.js';
import { idempotency } from '../../middlewares/idempotency.middleware.js';

const router = express.Router();

// ─── Patient ──────────────────────────────────────────────────────────────────
// router.get('/slots', isPatientAuthenticated, getAvailableSlots);
router.post(
  '/book',
  isPatientAuthenticated,
  requirePermission(PERMISSIONS.BOOK_APPOINTMENT),
  idempotency,
  bookAppointment,
);
router.put(
  '/:id/cancel',
  isPatientAuthenticated,
  requirePermission(PERMISSIONS.CANCEL_APPOINTMENT),
  requireOwnership(async (req) => {
    const apt = await findAppointmentById(req.params.id);
    return apt?.patientId;
  }),
  cancelAppointment,
);

// ─── Doctor ───────────────────────────────────────────────────────────────────
router.get(
  '/doctor',
  isDoctorAuthenticated,
  requirePermission(PERMISSIONS.VIEW_OWN_APPOINTMENTS),
  getDoctorAppointments,
);
router.put(
  '/:id/status',
  isDoctorAuthenticated,
  requirePermission(PERMISSIONS.UPDATE_APPOINTMENT_STATUS),
  updateAppointmentStatus,
);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get(
  '/all',
  isAdminAuthenticated,
  requirePermission(PERMISSIONS.VIEW_ALL_APPOINTMENTS),
  getAllAppointments,
);

export default router;
