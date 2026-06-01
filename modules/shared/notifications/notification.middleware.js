import jwt from 'jsonwebtoken';
import User from '../../user/user.model.js';
import Doctor from '../../doctor/doctor.model.js';

export const isAnyAuthenticated = async (req, res, next) => {
  try {
    let token, user;

    if (req.cookies.adminToken) {
      token = req.cookies.adminToken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      user = await User.findById(decoded.id);
    } else if (req.cookies.patientToken) {
      token = req.cookies.patientToken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      user = await User.findById(decoded.id);
    } else if (req.cookies.doctorToken) {
      token = req.cookies.doctorToken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      user = await Doctor.findById(decoded.id);
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};
