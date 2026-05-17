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
import { idempotency } from '../../middlewares/idempotency.middleware.js';

const router = express.Router();

// ─── Patient ──────────────────────────────────────────────────────────────────
// router.get('/slots', isPatientAuthenticated, getAvailableSlots);
router.post('/book', isPatientAuthenticated, idempotency, bookAppointment);
router.put('/:id/cancel', isPatientAuthenticated, cancelAppointment);

// ─── Doctor ───────────────────────────────────────────────────────────────────
router.get('/doctor', isDoctorAuthenticated, getDoctorAppointments);
router.put('/:id/status', isDoctorAuthenticated, updateAppointmentStatus);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/all', isAdminAuthenticated, getAllAppointments);

export default router;
