import AuditLog from '../models/auditLog.model.js';

export const createAuditLog = async (data) => {
  try {
    return await AuditLog.create(data);
  } catch (err) {
    // audit log failure should NEVER crash the main flow
    console.error('❌ Audit log creation failed:', err.message);
  }
};

export const findAuditLogs = async ({
  action,
  userId,
  resourceId,
  status,
  page = 1,
  limit = 20,
}) => {
  const query = {};

  if (action) query.action = action;
  if (userId) query['performedBy.userId'] = userId;
  if (resourceId) query['target.resourceId'] = resourceId;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
