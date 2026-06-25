import {
  findCompletedAppointment,
  findReviewByAppointmentId,
  findReviewById,
  createReview,
  updateReviewById,
  deleteReviewById,
  findReviewsByDoctorId,
  getRatingBreakdown,
} from './review.repository.js';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createReviewService = async (
  { appointmentId, rating, comment },
  patientId,
) => {
  // Check appointment exists and is completed
  const appointment = await findCompletedAppointment(appointmentId, patientId);
  if (!appointment) {
    throw {
      status: 400,
      message: 'You can only review a completed appointment',
    };
  }

  // Check review doesn't already exist for this appointment
  const existingReview = await findReviewByAppointmentId(appointmentId);
  if (existingReview) {
    throw {
      status: 400,
      message: 'You have already reviewed this appointment',
    };
  }

  const review = await createReview({
    doctorId: appointment.doctorId,
    patientId,
    appointmentId,
    rating: Number(rating),
    comment: comment.trim(),
  });

  return review;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateReviewService = async (reviewId, updates, patientId) => {
  const review = await findReviewById(reviewId);
  if (!review) throw { status: 404, message: 'Review not found' };

  // Only the patient who wrote it can edit
  if (review.patientId.toString() !== patientId.toString()) {
    throw { status: 403, message: 'Not authorized to edit this review' };
  }

  const updatedReview = await updateReviewById(reviewId, {
    ...(updates.rating && { rating: Number(updates.rating) }),
    ...(updates.comment && { comment: updates.comment.trim() }),
  });

  return updatedReview;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteReviewService = async (reviewId, patientId) => {
  const review = await findReviewById(reviewId);
  if (!review) throw { status: 404, message: 'Review not found' };

  if (review.patientId.toString() !== patientId.toString()) {
    throw { status: 403, message: 'Not authorized to delete this review' };
  }

  await deleteReviewById(reviewId);
};

// ─── Get doctor reviews ───────────────────────────────────────────────────────

export const getDoctorReviewsService = async (
  doctorId,
  { page, limit } = {},
) => {
  const [{ reviews, total, totalPages }, breakdown] = await Promise.all([
    findReviewsByDoctorId(doctorId, { page, limit }),
    getRatingBreakdown(doctorId),
  ]);

  return {
    reviews,
    total,
    page,
    totalPages,
    ratingBreakdown: breakdown,
  };
};
