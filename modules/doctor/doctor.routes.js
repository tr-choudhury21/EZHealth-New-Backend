import express from 'express';
import {
  registerDoctor,
  loginDoctor,
  logoutDoctor,
  verifyDoctor,
  getAllDoctors,
  getUnverifiedDoctors,
  getDoctorProfile,
  updateDoctorProfile,
  uploadPrescription,
} from './doctor.controller.js';
import {
  setAvailability,
  getAvailableSlots,
  getDoctorSchedule,
} from './availability.controller.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../../rbac/roles.js';
import {
  isPatientAuthenticated,
  isAdminAuthenticated,
  isDoctorAuthenticated,
} from '../../middlewares/auth.js';
import { upload, uploadPdf } from '../../middlewares/multer.js';

const router = express.Router();

// ─── Auth ────────────────────────────────────────────────────────────────────
router.post('/register', upload.single('profileImage'), registerDoctor);
router.post('/login', loginDoctor);
router.post('/logout', isDoctorAuthenticated, logoutDoctor);

// ─── Doctor ──────────────────────────────────────────────────────────────────
router.get(
  '/me',
  isDoctorAuthenticated,
  requirePermission(PERMISSIONS.VIEW_OWN_APPOINTMENTS),
  getDoctorProfile,
);
router.put(
  '/me',
  isDoctorAuthenticated,
  requirePermission(PERMISSIONS.UPDATE_DOCTOR_PROFILE),
  updateDoctorProfile,
);
router.post(
  '/prescription',
  isDoctorAuthenticated,
  requirePermission(PERMISSIONS.UPLOAD_PRESCRIPTION),
  uploadPdf.single('prescription'),
  uploadPrescription,
);

// ─── Admin ───────────────────────────────────────────────────────────────────
router.get(
  '/all',
  isAdminAuthenticated,
  requirePermission(PERMISSIONS.VIEW_ALL_DOCTORS),
  getAllDoctors,
);
router.get(
  '/unverified',
  isAdminAuthenticated,
  requirePermission(PERMISSIONS.VIEW_UNVERIFIED_DOCTORS),
  getUnverifiedDoctors,
);
router.put(
  '/verify/:id',
  isAdminAuthenticated,
  requirePermission(PERMISSIONS.VERIFY_DOCTOR),
  verifyDoctor,
);

// ─── Availability ─────────────────────────────────────────────────────────────
router.post(
  '/availability',
  isDoctorAuthenticated,
  requirePermission(PERMISSIONS.SET_AVAILABILITY),
  setAvailability,
);
router.get('/availability/me', isDoctorAuthenticated, getDoctorSchedule);
router.get(
  '/slots',
  isPatientAuthenticated,
  requirePermission(PERMISSIONS.VIEW_OWN_APPOINTMENTS),
  getAvailableSlots,
);

export default router;
