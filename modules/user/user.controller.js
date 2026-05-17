import { generateToken } from '../../utils/jwtToken.js';

import {
  registerPatientService,
  loginService,
  addAdminService,
  getUserProfileService,
  resolveTokenFromCookies,
  verifyTokenAndGetUser,
} from './user.service.js';
import {
  validateRegisterInput,
  validateLoginInput,
} from './user.validation.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  expires: new Date(Date.now()),
  secure: true,
  sameSite: 'None',
};

//----------------------------------Auth--------------------------------------------//

export const registerPatient = async (req, res) => {
  try {
    const error = validateRegisterInput(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const user = await registerPatientService(req.body); //new service function

    // Generate token and send response
    generateToken(user, 'User Registered!', 201, res);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const error = validateLoginInput(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const user = await loginService(req.body); //new service function

    generateToken(user, 'Login successful', 200, res);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

//Patient Logout
export const logoutPatient = async (req, res, next) => {
  res.status(200).cookie('patientToken', '', COOKIE_OPTIONS).json({
    success: true,
    message: 'Patient logged out!',
  });
};

/*----------------------------------Admin----------------------------------------*/

//add new admin by an Admin

export const addNewAdmin = async (req, res, next) => {
  try {
    const error = validateRegisterInput(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    await addAdminService(req.body);
    res.status(201).json({ success: true, message: 'New Admin Registered!' });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

//Admin Logout
export const logoutAdmin = async (req, res, next) => {
  res.status(200).cookie('adminToken', '', COOKIE_OPTIONS).json({
    success: true,
    message: 'Admin logged out!',
  });
};

/*----------------------------------Profile-------------------------------------*/

//user profile
export const getUserProfile = async (req, res) => {
  try {
    const data = await getUserProfileService(req.user.id);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

//get admin profile

export const getAdminProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/*----------------------------------Verify-----------------------------------------*/

//verify user
export const verifyUser = async (req, res) => {
  try {
    const resolved = resolveTokenFromCookies(req.cookies);
    if (!resolved) return res.status(401).json({ message: 'Not logged in' });

    const { user, role } = await verifyTokenAndGetUser(
      resolved.token,
      resolved.role,
    );

    res.status(200).json({
      success: true,
      user,
      role,
    });
  } catch (error) {
    res
      .status(error.status || 401)
      .json({ message: 'Invalid or expired token', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const resolved = resolveTokenFromCookies(req.cookies);
    if (!resolved)
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated' });

    const { user, role } = await verifyTokenAndGetUser(
      resolved.token,
      resolved.role,
    );

    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        role,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
