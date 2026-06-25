import Review from './review.model.js';
import Appointment from '../appointment/appointment.model.js';
import mongoose from 'mongoose';

// ─── Appointment validation ───────────────────────────────────────────────────

export const findCompletedAppointment = async (appointmentId, patientId) => {
  return await Appointment.findOne({
    _id: appointmentId,
    patientId,
    status: 'Completed',
  });
};

// ─── Review CRUD ──────────────────────────────────────────────────────────────

export const findReviewByAppointmentId = async (appointmentId) => {
  return await Review.findOne({ appointmentId });
};

export const findReviewById = async (id) => {
  return await Review.findById(id);
};

export const createReview = async (data) => {
  return await Review.create(data);
};

export const updateReviewById = async (id, updates) => {
  return await Review.findByIdAndUpdate(
    id,
    {
      ...updates,
      isEdited: true,
      editedAt: new Date(),
    },
    { new: true, runValidators: true },
  );
};

export const deleteReviewById = async (id) => {
  return await Review.findByIdAndDelete(id);
};

// ─── Doctor reviews ───────────────────────────────────────────────────────────

export const findReviewsByDoctorId = async (
  doctorId,
  { page = 1, limit = 10 } = {},
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ doctorId })
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ doctorId }),
  ]);

  return { reviews, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Rating breakdown ─────────────────────────────────────────────────────────

export const getRatingBreakdown = async (doctorId) => {
  const breakdown = await Review.aggregate([
    { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  // Format as { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
  const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  breakdown.forEach(({ _id, count }) => {
    result[_id] = count;
  });

  return result;
};

// ─── Patient's own review ─────────────────────────────────────────────────────

export const findReviewByPatientAndDoctor = async (patientId, doctorId) => {
  return await Review.findOne({ patientId, doctorId });
};
