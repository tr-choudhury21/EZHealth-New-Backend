import express from 'express';
import {
  getAllDoctors,
  getDoctorProfile,
  getUnverifiedDoctors,
  loginDoctor,
  logoutDoctor,
  registerDoctor,
  updateDoctorProfile,
  uploadPrescription,
  verifyDoctor,
} from '../controllers/docController.js';
import {
  isAdminAuthenticated,
  isDoctorAuthenticated,
} from '../middlewares/auth.js';
import { upload, uploadPdf } from '../middlewares/multer.js';

const router = express.Router();

/**
 * @swagger
 * /doctor/register:
 *   post:
 *     summary: Registration of a new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       400:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post('/register', upload.single('profileImage'), registerDoctor);

/**
 * @swagger
 * /doctor/login:
 *   post:
 *     summary: Login for doctors
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Doctor's email
 *               password:
 *                 type: string
 *                 description: Doctor's password
 *     responses:
 *       200:
 *         description: Doctor logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Doctor login successful
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 *       403:
 *         description: Doctor not verified by admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Doctor not verified by admin
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Login failed"
 */
// router.post('/login', loginDoctor);

/**
 * @swagger
 * /doctor/all:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of all registered doctors
 *       500:
 *         description: Server error
 */
router.get('/all', getAllDoctors);
router.put('/edit', isDoctorAuthenticated, updateDoctorProfile);
router.get('/unverified', isAdminAuthenticated, getUnverifiedDoctors);
router.get('/me', isDoctorAuthenticated, getDoctorProfile);
router.post(
  '/upload-prescription',
  isDoctorAuthenticated,
  uploadPdf.single('prescription'),
  uploadPrescription
);

/**
 * @swagger
 * /doctor/logout:
 *   get:
 *     summary: Logout a doctor
 *     description: Endpoint for doctors to invalidate their current session/token
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully logged out"
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Logout failed"
 */
router.get('/logout', isDoctorAuthenticated, logoutDoctor);

export default router;
