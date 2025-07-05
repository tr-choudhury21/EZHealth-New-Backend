import express from 'express';
import {
  addNewAdmin,
  getMe,
  getUserProfile,
  login,
  logoutAdmin,
  logoutPatient,
  registerPatient,
  verifyUser,
} from '../controllers/userControllers.js';
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /patient/register:
 *   post:
 *     summary: Register a new patient
 *     description: Create a new patient account
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientRegistration'
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient registered successfully"
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Bad request (validation errors)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       409:
 *         description: Conflict (email already exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already registered"
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PatientRegistration:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: "securePassword123"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         age:
 *           type: string
 *           example: "24years"
 *         address:
 *           type: string
 *           example: "123 Main St, City, Country"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           example: "male"
 *
 *     Patient:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         age:
 *           type: string
 *         address:
 *           type: string
 *         gender:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
router.post('/patient/register', registerPatient);

/**
 * @swagger
 * /patient/login:
 *   post:
 *     summary: Patient login
 *     description: Authenticate a patient and return an access token
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email and password are required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "patient@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "patient123"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post('/login', login);
router.get('/patient/profile', isPatientAuthenticated, getUserProfile);
router.get('/patient/logout', isPatientAuthenticated, logoutPatient);

router.get('/me', getMe);

router.post('/admin/new', addNewAdmin);
// router.post('/admin/logout', isAdminAuthenticated, logoutAdmin);

export default router;
