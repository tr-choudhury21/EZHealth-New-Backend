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
router.get('/me', isDoctorAuthenticated, getDoctorProfile);
router.put('/me', isDoctorAuthenticated, updateDoctorProfile);
router.post(
  '/prescription',
  isDoctorAuthenticated,
  uploadPdf.single('prescription'),
  uploadPrescription,
);

// ─── Admin ───────────────────────────────────────────────────────────────────
router.get('/all', isAdminAuthenticated, getAllDoctors);
router.get('/unverified', isAdminAuthenticated, getUnverifiedDoctors);
router.put('/verify/:id', isAdminAuthenticated, verifyDoctor);

// ─── Availability ─────────────────────────────────────────────────────────────
router.post('/availability', isDoctorAuthenticated, setAvailability);
router.get('/availability/me', isDoctorAuthenticated, getDoctorSchedule);
router.get('/slots', isPatientAuthenticated, getAvailableSlots);

export default router;
