import {
  findUserByEmail,
  findUserById,
  createUser,
  findDoctorByEmail,
  findDoctorById,
  findAppointmentsByPatientId,
  findPrescriptionsByPatientId,
} from './user.repository.js';

import jwt from 'jsonwebtoken';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerPatientService = async (data) => {
  const { firstName, lastName, email, password, phone, gender, age } = data;

  const exists = await findUserByEmail(email);
  if (exists) throw { status: 400, message: 'User already exists' };

  const user = await createUser({
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    age,
    role: 'Patient',
  });

  return user;
};

export const loginService = async ({ email, password, role }) => {
  let user;

  if (role === 'Doctor') {
    user = await findDoctorByEmail(email);
    if (!user) throw { status: 404, message: 'Doctor not found' };
    if (!user.isVerified)
      throw { status: 403, message: 'Doctor not verified by admin' };
  } else {
    user = await findUserByEmail(email);
    if (!user) throw { status: 404, message: 'User not found' };
    if (user.role !== role)
      throw { status: 403, message: 'Access denied, role mismatch' };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw { status: 401, message: 'Invalid email or password' };

  return user;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const addAdminService = async (data) => {
  const exists = await findUserByEmail(data.email);
  if (exists)
    throw { status: 400, message: 'Admin already registered with this email' };

  const admin = await createUser({ ...data, role: 'Admin' });
  return admin;
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getUserProfileService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  const appointments = await findAppointmentsByPatientId(userId);
  const prescriptions = await findPrescriptionsByPatientId(userId);

  const formattedAppointments = appointments.map((a) => ({
    appointmentId: a._id,
    doctorName: `Dr. ${a.doctorId.firstName} ${a.doctorId.lastName}`,
    department: a.doctorId.department,
    date: a.appointmentDate,
    time: a.appointmentTime,
    meetingLink: a.meetingLink,
    status: a.status,
  }));

  const formattedPrescriptions = prescriptions.map((p) => ({
    doctorName: `Dr. ${p.doctorId.firstName} ${p.doctorId.lastName}`,
    medications: p.medications,
    notes: p.notes,
    fileUrl: p.prescriptionFileUrl,
    issuedAt: p.issuedAt,
  }));

  return {
    user,
    appointments: formattedAppointments,
    prescriptions: formattedPrescriptions,
  };
};

// ─── Token / Verify ──────────────────────────────────────────────────────────

export const resolveTokenFromCookies = (cookies) => {
  if (cookies.adminToken) return { token: cookies.adminToken, role: 'Admin' };
  if (cookies.patientToken)
    return { token: cookies.patientToken, role: 'Patient' };
  if (cookies.doctorToken)
    return { token: cookies.doctorToken, role: 'Doctor' };
  return null;
};

export const verifyTokenAndGetUser = async (token, role) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user =
    role === 'Doctor'
      ? await findDoctorById(decoded.id)
      : await findUserById(decoded.id);

  if (!user) throw { status: 404, message: 'User not found' };

  return { user, role };
};
