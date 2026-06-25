import express from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getDoctorReviews,
} from './review.controller.js';
import { isPatientAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

// ─── Patient ──────────────────────────────────────────────────────────────────
router.post('/', isPatientAuthenticated, createReview);
router.put('/:id', isPatientAuthenticated, updateReview);
router.delete('/:id', isPatientAuthenticated, deleteReview);

// ─── Public (anyone can see doctor reviews) ───────────────────────────────────
router.get('/doctor/:doctorId', getDoctorReviews);

export default router;
