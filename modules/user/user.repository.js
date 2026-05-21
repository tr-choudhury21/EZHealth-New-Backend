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

// ─── Doctor ──────────────────────────────────────────────────────────────────

export const findDoctorByEmail = async (email) => {
  return await Doctor.findOne({ email }).select('+password');
};

export const findDoctorById = async (id) => {
  return await Doctor.findById(id).select('-password');
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
