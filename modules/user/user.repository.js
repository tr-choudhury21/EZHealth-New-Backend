import User from './user.model.js';
import Doctor from '../doctor/doctor.model.js';
import Appointment from '../appointment/appointment.model.js';
import Prescription from '../shared/models/prescription.model.js';

// ─── User ────────────────────────────────────────────────────────────────────

export const findUserByEmail = async (email) => {
  return await User.findOne({ email }).select('+password');
};

export const findUserById = async (id) => {
  return await User.findById(id).select('-password');
};

export const createUser = async (data) => {
  return await User.create(data);
};

export const findUserByRefreshToken = async (hashedToken) => {
  return await User.findOne({
    refreshTokenHash: hashedToken,
    refreshTokenExpire: { $gt: new Date() },
  }).select('+refreshTokenHash +refreshTokenExpire');
};

// ─── Doctor ──────────────────────────────────────────────────────────────────

export const findDoctorByEmail = async (email) => {
  return await Doctor.findOne({ email }).select('+password');
};

export const findDoctorById = async (id) => {
  return await Doctor.findById(id).select('-password');
};

export const findDoctorByRefreshToken = async (hashedToken) => {
  return await Doctor.findOne({
    refreshTokenHash: hashedToken,
    refreshTokenExpire: { $gt: new Date() },
  }).select('+refreshTokenHash +refreshTokenExpire');
};

// ─── Appointments ─────────────────────────────────────────────────────────────

export const findAppointmentsByPatientId = async (patientId) => {
  return await Appointment.find({ patientId })
    .populate('doctorId', 'firstName lastName department')
    .sort({ appointmentDate: -1 });
};

// ─── Prescriptions ───────────────────────────────────────────────────────────

export const findPrescriptionsByPatientId = async (patientId) => {
  return await Prescription.find({ patientId })
    .populate('doctorId', 'firstName lastName')
    .sort({ issuedAt: -1 });
};

// ─── Email Verification ───────────────────────────────────────────────────────────

// Find user by email (includes sensitive fields)
export const findUserByEmailWithToken = async (email) => {
  return await User.findOne({ email }).select(
    '+emailVerifyToken +emailVerifyExpire +resetPasswordToken +resetPasswordExpire +password',
  );
};

// Find user by email verify token (hashed)
export const findUserByEmailVerifyToken = async (hashedToken) => {
  return await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpire: { $gt: new Date() }, // not expired
  });
};

// Find user by reset token (hashed)
export const findUserByResetToken = async (hashedToken) => {
  return await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() }, // not expired
  });
};
