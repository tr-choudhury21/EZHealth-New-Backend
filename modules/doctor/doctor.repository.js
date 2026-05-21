import Doctor from './doctor.model.js';
import Appointment from '../appointment/appointment.model.js';
import Prescription from '../shared/models/prescription.model.js';

// ─── Doctor ──────────────────────────────────────────────────────────────────

export const findDoctorByEmail = async (email) => {
  return await Doctor.findOne({ email }).select('+password');
};

export const findDoctorById = async (id) => {
  return await Doctor.findById(id).select('-password');
};

export const createDoctor = async (data) => {
  return await Doctor.create(data);
};

export const findAllVerifiedDoctors = async ({
  department,
  specialization,
  search,
}) => {
  const query = { isVerified: true };

  if (department) query.department = department;
  if (specialization) query.specialization = specialization;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } }, //case-insensitive search
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  return await Doctor.find(query).select('-password');
};

export const findAllUnverifiedDoctors = async () => {
  return await Doctor.find({ isVerified: false }).select('-password');
};

export const verifyDoctorById = async (id) => {
  return await Doctor.findByIdAndUpdate(
    id,
    { isVerified: true },
    { new: true },
  ).select('-password');
};

export const updateDoctorById = async (id, updates) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) return null;

  const allowedFields = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'gender',
    'specialization',
    'department',
    'experience',
    'consultationFee',
    'profileImage',
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) doctor[field] = updates[field];
  });

  await doctor.save(); // triggers pre-save hooks
  return doctor;
};

// ─── Appointments ─────────────────────────────────────────────────────────────

export const findAppointmentsByDoctorId = async (doctorId) => {
  return await Appointment.find({ doctorId })
    .populate('patientId', 'firstName lastName email phone')
    .sort({ appointmentDate: -1 });
};

// ─── Prescriptions ────────────────────────────────────────────────────────────

export const createPrescription = async (data) => {
  return await Prescription.create(data);
};
