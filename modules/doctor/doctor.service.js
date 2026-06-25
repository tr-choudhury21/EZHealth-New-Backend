import {
  findDoctorByEmail,
  findDoctorById,
  createDoctor,
  findAllVerifiedDoctors,
  findAllUnverifiedDoctors,
  verifyDoctorById,
  updateDoctorById,
  findAppointmentsByDoctorId,
  createPrescription,
} from './doctor.repository.js';
import {
  findReviewsByDoctorId,
  getRatingBreakdown,
} from '../review/review.repository.js';
import {
  notifyDoctorVerified,
  notifyAdminDoctorRegistered,
  notifyPrescriptionUploaded,
} from '../shared/notifications/notification.service.js';
import User from '../user/user.model.js';
import {
  uploadImageToCloudinary,
  uploadPDFToCloudinary,
} from '../../utils/cloudinary.utils.js';
import { log, getActor, AUDIT_ACTIONS } from '../shared/audit/audit.service.js';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerDoctorService = async (data, file) => {
  const exists = await findDoctorByEmail(data.email);
  if (exists) throw { status: 400, message: 'Doctor already exists' };

  let profileImage = '';
  if (file) profileImage = await uploadImageToCloudinary(file.buffer);

  const doctor = await createDoctor({ ...data, profileImage, role: 'Doctor' });

  await log({
    performedBy: {
      userId: doctor._id,
      userType: 'Doctor',
      email: doctor.email,
      role: 'Doctor',
    },
    action: AUDIT_ACTIONS.DOCTOR_REGISTERED,
    target: { resourceType: 'Doctor', resourceId: doctor._id },
    changes: { before: null, after: { isVerified: false } },
  });

  // Get all admin IDs to notify
  const admins = await User.find({ role: 'Admin' }).select('_id');
  const adminIds = admins.map((a) => a._id);
  await notifyAdminDoctorRegistered(doctor, adminIds);

  return {
    _id: doctor._id,
    name: `${doctor.firstName} ${doctor.lastName}`,
    email: doctor.email,
    specialization: doctor.specialization,
    consultationFee: doctor.consultationFee,
    department: doctor.department,
    profileImage: doctor.profileImage,
    isVerified: doctor.isVerified,
  };
};

export const loginDoctorService = async ({ email, password }) => {
  const doctor = await findDoctorByEmail(email);
  if (!doctor) throw { status: 404, message: 'Doctor not found' };
  if (!doctor.isVerified)
    throw { status: 403, message: 'Doctor not verified by admin' };

  const isMatch = await doctor.comparePassword(password);
  if (!isMatch) throw { status: 401, message: 'Invalid credentials' };

  return doctor;
};

// ─── Admin Actions ────────────────────────────────────────────────────────────

export const verifyDoctorService = async (id, adminUser) => {
  const doctor = await verifyDoctorById(id);
  if (!doctor) throw { status: 404, message: 'Doctor not found' };

  await log({
    performedBy: getActor(adminUser),
    action: AUDIT_ACTIONS.DOCTOR_VERIFIED,
    target: { resourceType: 'Doctor', resourceId: doctor._id },
    changes: { before: { isVerified: false }, after: { isVerified: true } },
    metadata: { doctorEmail: doctor.email },
  });

  await notifyDoctorVerified(doctor);

  return doctor;
};

export const getUnverifiedDoctorsService = async () => {
  return await findAllUnverifiedDoctors();
};

export const getAllDoctorsService = async (filters = {}) => {
  return await findAllVerifiedDoctors(filters);
};

// ─── Doctor Actions ───────────────────────────────────────────────────────────

export const getDoctorProfileService = async (doctorId) => {
  const doctor = await findDoctorById(doctorId);
  if (!doctor) throw { status: 404, message: 'Doctor not found' };

  const appointments = await findAppointmentsByDoctorId(doctorId);

  // Latest 5 reviews + rating breakdown
  const [{ reviews }, ratingBreakdown] = await Promise.all([
    findReviewsByDoctorId(doctorId, { page: 1, limit: 5 }),
    getRatingBreakdown(doctorId),
  ]);

  const formattedAppointments = appointments.map((a) => ({
    appointmentId: a._id,
    patientName: `${a.patientId.firstName} ${a.patientId.lastName}`,
    email: a.patientId.email,
    phone: a.patientId.phone,
    department: a.department,
    date: a.appointmentDate,
    time: a.appointmentTime,
    status: a.status,
  }));

  return {
    doctor,
    appointments: formattedAppointments,
    ratings: {
      average: doctor.averageRating,
      total: doctor.totalReviews,
      breakdown: ratingBreakdown,
      latestReviews: reviews,
    },
  };
};

export const updateDoctorProfileService = async (doctorId, updates, file) => {
  if (file) updates.profileImage = await uploadImageToCloudinary(file.buffer);

  const doctor = await updateDoctorById(doctorId, updates);
  if (!doctor) throw { status: 404, message: 'Doctor not found' };

  return doctor;
};

// ─── Prescription ─────────────────────────────────────────────────────────────

export const uploadPrescriptionService = async (data, file, doctorUser) => {
  if (!file) throw { status: 400, message: 'PDF file is required' };

  const fileUrl = await uploadPDFToCloudinary(file.buffer);

  const prescription = await createPrescription({
    ...data,
    doctorId: doctorUser._id,
    prescriptionFileUrl: fileUrl,
  });

  await notifyPrescriptionUploaded(prescription, doctorUser);

  return prescription;
};
