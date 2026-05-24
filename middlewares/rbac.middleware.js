import { hasPermission } from '../rbac/roles.js';

// ─── Permission check middleware factory ──────────────────────────────────────

export const requirePermission = (permission) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!hasPermission(role, permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`,
      });
    }

    next();
  };
};

// ─── Role check middleware factory ────────────────────────────────────────────

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

// ─── Resource ownership check ─────────────────────────────────────────────────
// Ensures a patient can only access their own resources

export const requireOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // admins can access anything
      if (req.user.role === 'Admin') return next();

      if (ownerId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.',
        });
      }

      next();
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
};
