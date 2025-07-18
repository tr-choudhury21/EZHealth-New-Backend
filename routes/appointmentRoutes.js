import express from 'express';
import {
  isAdminAuthenticated,
  isDoctorAuthenticated,
  isPatientAuthenticated,
} from '../middlewares/auth.js';
import {
  bookAppointment,
  cancelAppointment,
  getAllAppointments,
  getAvailableSlots,
  getDoctorAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/available-slots', getAvailableSlots);

/**
 * @swagger
 * /appointments/book:
 *   post:
 *     summary: Book a new appointment
 *     description: Allows authenticated patients to book an appointment with a doctor
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentRequest'
 *     responses:
 *       201:
 *         description: Appointment successfully booked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid date format"
 *       401:
 *         description: Unauthorized (invalid or missing patient token)
 *       403:
 *         description: Forbidden (not a patient account)
 *       409:
 *         description: Conflict (time slot already booked)
 *       500:
 *         description: Server error
 */
router.post('/book', isPatientAuthenticated, bookAppointment);

/**
 * @swagger
 * /appointments/all:
 *   get:
 *     summary: Get all appointments (Admin only)
 *     description: Retrieve a list of all appointments in the system
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limit the number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of all appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *                 totalCount:
 *                   type: integer
 *                   example: 25
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Unauthorized (invalid or missing admin token)
 *       403:
 *         description: Forbidden (not an admin)
 *       500:
 *         description: Server error
 */
router.get('/all', isAdminAuthenticated, getAllAppointments);
router.get('/', isDoctorAuthenticated, getDoctorAppointments);

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   put:
 *     summary: Cancel an appointment
 *     description: Allows authenticated patients to cancel their upcoming appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the appointment to cancel
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment cancelled successfully"
 *                 updatedAppointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Bad request (e.g., appointment cannot be cancelled)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Appointment can only be cancelled at least 24 hours in advance"
 *       401:
 *         description: Unauthorized (invalid or missing patient token)
 *       403:
 *         description: Forbidden (not the patient who booked this appointment)
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         patientId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         doctorId:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2023-05-20T10:30:00Z"
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *           example: "cancelled"
 *         reason:
 *           type: string
 *           example: "General checkup"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-05-15T08:45:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-05-18T14:20:00Z"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.put('/:id/cancel', isPatientAuthenticated, cancelAppointment);

/**
 * @swagger
 * /appointments/{id}/status:
 *   put:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Accepted, Rejected, Completed]
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.put('/:id/status', isDoctorAuthenticated, updateAppointmentStatus);

export default router;
