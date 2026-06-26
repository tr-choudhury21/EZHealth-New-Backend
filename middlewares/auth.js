import jwt from 'jsonwebtoken';
import User from '../modules/user/user.model.js';
import Doctor from '../modules/doctor/doctor.model.js';

// ─── Generic token verifier ───────────────────────────────────────────────────

const authenticate = (cookieName, findUser, requiredRole) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies[cookieName];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: `${requiredRole} not authenticated`,
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await findUser(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists',
        });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `${user.role} is not authorized for this resource`,
        });
      }

      req.user = user;
      next();
    } catch (error) {
      // jwt.verify throws if token is expired or tampered
      // Tell frontend to attempt refresh
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          shouldRefresh: true, // ← frontend uses this flag
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        shouldRefresh: false,
      });
    }
  };
};

// ─── Exported middleware ──────────────────────────────────────────────────────

export const isAdminAuthenticated = authenticate(
  'adminToken',
  (id) => User.findById(id),
  'Admin',
);

export const isPatientAuthenticated = authenticate(
  'patientToken',
  (id) => User.findById(id),
  'Patient',
);

export const isDoctorAuthenticated = authenticate(
  'doctorToken',
  (id) => Doctor.findById(id),
  'Doctor',
);
