import express from 'express';
import {
  addNewAdmin,
  getAdminProfile,
  logoutAdmin,
} from '../controllers/userControllers.js';
import { isAdminAuthenticated } from '../middlewares/auth.js';
import { verifyDoctor } from '../controllers/docController.js';

const router = express.Router();

router.post('/new', addNewAdmin);
router.get('/me', isAdminAuthenticated, getAdminProfile);
router.get('/logout', isAdminAuthenticated, logoutAdmin);

/**
 * @swagger
 * doctor/admin/verify-doctor/{id}:
 *   put:
 *     summary: Verify a doctor account (Admin only)
 *     description: Endpoint for admin to verify a doctor's account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the doctor to verify
 *     responses:
 *       200:
 *         description: Doctor verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Doctor verified successfully"
 *       401:
 *         description: Unauthorized (invalid or missing admin token)
 *       403:
 *         description: Forbidden (not an admin)
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
router.put('/verify-doctor/:id', isAdminAuthenticated, verifyDoctor);

export default router;
