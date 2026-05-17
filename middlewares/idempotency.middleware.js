const recentRequests = new Map();

export const idempotency = (req, res, next) => {
  const key = `${req.user?.id}-${req.body?.doctorId}-${req.body?.appointmentDate}-${req.body?.appointmentTime}`;

  if (recentRequests.has(key)) {
    return res.status(429).json({
      success: false,
      message:
        'Duplicate request detected. Your appointment is being processed.',
    });
  }

  recentRequests.set(key, true);

  // clear after 5 seconds
  setTimeout(() => recentRequests.delete(key), 5000);

  next();
};
