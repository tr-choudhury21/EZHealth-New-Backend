import {
  findUserByEmail,
  findUserById,
  createUser,
  findDoctorByEmail,
  findDoctorById,
  findAppointmentsByPatientId,
  findPrescriptionsByPatientId,
  findUserByRefreshToken,
  findDoctorByRefreshToken,
} from './user.repository.js';
import crypto from 'crypto';
import { sendEmail } from '../../utils/email.js';
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
} from '../../utils/emailTemplates.js';
import { generateAccessToken, COOKIE_NAMES } from '../../utils/jwtToken.js';
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

  // Generate verification token
  const token = user.generateEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  await sendEmail(
    user.email,
    'Verify your EZHealth account',
    verificationEmailTemplate(`${user.firstName} ${user.lastName}`, verifyUrl),
  );

  return user;
};

// Verify email
export const verifyEmailService = async (token) => {
  // Hash the token from URL to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await findUserByEmailVerifyToken(hashedToken);
  if (!user) throw { status: 400, message: 'Token is invalid or has expired' };

  user.isEmailVerified = true;
  user.emailVerifyToken = null;
  user.emailVerifyExpire = null;

  await user.save({ validateBeforeSave: false });

  return user;
};

// Resend verification email
export const resendVerificationEmailService = async (email) => {
  const user = await findUserByEmailWithToken(email);
  if (!user) throw { status: 404, message: 'User not found' };

  if (user.isEmailVerified) {
    throw { status: 400, message: 'Email is already verified' };
  }

  const token = user.generateEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  await sendEmail(
    user.email,
    'Verify your EZHealth account',
    verificationEmailTemplate(`${user.firstName} ${user.lastName}`, verifyUrl),
  );
};

// Forgot password
export const forgotPasswordService = async (email) => {
  const user = await findUserByEmailWithToken(email);
  if (!user) throw { status: 404, message: 'User not found' };

  const token = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await sendEmail(
    user.email,
    'Reset your EZHealth password',
    passwordResetEmailTemplate(`${user.firstName} ${user.lastName}`, resetUrl),
  );
};

// Reset password
export const resetPasswordService = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await findUserByResetToken(hashedToken);
  if (!user) throw { status: 400, message: 'Token is invalid or has expired' };

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;

  await user.save();

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

    // Check email verification
    if (!user.isEmailVerified) {
      throw {
        status: 403,
        message: 'Please verify your email before logging in',
      };
    }
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

// ─── Refresh access token ─────────────────────────────────────────────────────

export const refreshAccessTokenService = async (cookies) => {
  // find which refresh token cookie exists
  let refreshToken, role, user;

  if (cookies.adminRefreshToken) {
    refreshToken = cookies.adminRefreshToken;
    role = 'Admin';
  } else if (cookies.patientRefreshToken) {
    refreshToken = cookies.patientRefreshToken;
    role = 'Patient';
  } else if (cookies.doctorRefreshToken) {
    refreshToken = cookies.doctorRefreshToken;
    role = 'Doctor';
  }

  if (!refreshToken) {
    throw {
      status: 401,
      message: 'No refresh token found. Please log in again.',
    };
  }

  // hash incoming token to compare with DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  // find user by hashed token
  if (role === 'Doctor') {
    user = await findDoctorByRefreshToken(hashedToken);
  } else {
    user = await findUserByRefreshToken(hashedToken);
  }

  if (!user) {
    throw {
      status: 401,
      message: 'Refresh token is invalid or expired. Please log in again.',
    };
  }

  // sliding expiry — reset refresh token expiry on every use
  user.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // generate new short-lived access token
  const newAccessToken = generateAccessToken(user._id);

  return { newAccessToken, role, user };
};

// ─── Logout — revoke refresh token ───────────────────────────────────────────

export const logoutService = async (cookies, role) => {
  let refreshToken;

  if (role === 'Admin') refreshToken = cookies.adminRefreshToken;
  if (role === 'Patient') refreshToken = cookies.patientRefreshToken;
  if (role === 'Doctor') refreshToken = cookies.doctorRefreshToken;

  if (!refreshToken) return; // already logged out

  const hashedToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  // find and invalidate
  let user;
  if (role === 'Doctor') {
    user = await findDoctorByRefreshToken(hashedToken);
  } else {
    user = await findUserByRefreshToken(hashedToken);
  }

  if (user) {
    user.clearRefreshToken();
    await user.save({ validateBeforeSave: false });
  }
};
