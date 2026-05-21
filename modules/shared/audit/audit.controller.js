import { findAuditLogs } from './audit.repository.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { action, userId, resourceId, status, page, limit } = req.query;

    const result = await findAuditLogs({
      action,
      userId,
      resourceId,
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};
