import { createAuditLog } from './audit.repository.js';
import { AUDIT_ACTIONS } from '../models/auditLog.model.js';

// ─── Core logger ──────────────────────────────────────────────────────────────

export const log = async ({
  performedBy,
  action,
  target,
  changes = { before: null, after: null },
  metadata = {},
  status = 'success',
  ipAddress = '',
}) => {
  await createAuditLog({
    performedBy,
    action,
    target,
    changes,
    metadata,
    status,
    ipAddress,
  });
};

// ─── Helper to build performedBy from req.user ────────────────────────────────

export const getActor = (user) => ({
  userId: user._id,
  userType: user.role === 'Doctor' ? 'Doctor' : 'User',
  email: user.email,
  role: user.role,
});

export { AUDIT_ACTIONS };
