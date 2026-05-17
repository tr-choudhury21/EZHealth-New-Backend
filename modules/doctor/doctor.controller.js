import { generateToken } from '../../utils/jwtToken.js';
import {
  registerDoctorService,
  loginDoctorService,
  verifyDoctorService,
  getUnverifiedDoctorsService,
  getAllDoctorsService,
  getDoctorProfileService,
  updateDoctorProfileService,
  uploadPrescriptionService,
} from './doctor.service.js';
import {
  validateDoctorRegister,
  validateDoctorLogin,
} from './doctor.validation.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  expires: new Date(Date.now()),
  secure: true,
  sameSite: 'None',
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerDoctor = async (req, res) => {
  try {
    const error = validateDoctorRegister(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const doctor = await registerDoctorService(req.body, req.file);
    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully. Awaiting admin verification.',
      doctor,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const error = validateDoctorLogin(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const doctor = await loginDoctorService(req.body);
    generateToken(doctor, 'Doctor login successful', 200, res);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const logoutDoctor = (req, res) => {
  res.status(200).cookie('doctorToken', '', COOKIE_OPTIONS).json({
    success: true,
    message: 'Doctor logged out!',
  });
};

// ─── Admin Actions ────────────────────────────────────────────────────────────

export const verifyDoctor = async (req, res) => {
  try {
    const doctor = await verifyDoctorService(req.params.id);
    res.status(200).json({ success: true, message: 'Doctor verified', doctor });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const getUnverifiedDoctors = async (req, res) => {
  try {
    const doctors = await getUnverifiedDoctorsService();
    res.status(200).json({ success: true, doctors });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await getAllDoctorsService();
    res
      .status(200)
      .json({ success: true, totalDoctors: doctors.length, doctors });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// ─── Doctor Actions ───────────────────────────────────────────────────────────

export const getDoctorProfile = async (req, res) => {
  try {
    const data = await getDoctorProfileService(req.user.id);
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await updateDoctorProfileService(
      req.user.id,
      req.body,
      req.file,
    );
    res
      .status(200)
      .json({ success: true, message: 'Profile updated successfully', doctor });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// ─── Prescription ─────────────────────────────────────────────────────────────

export const uploadPrescription = async (req, res) => {
  try {
    const prescription = await uploadPrescriptionService(
      req.body,
      req.file,
      req.user.id,
    );
    res.status(201).json({
      success: true,
      message: 'Prescription uploaded successfully',
      prescription,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};
