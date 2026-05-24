import jwt from 'jsonwebtoken';

// ─── Generate JWT ─────────────────────────────────────────────────────────────

export const generateJWT = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// ─── Cookie Name by Role ──────────────────────────────────────────────────────

const COOKIE_NAME_BY_ROLE = {
  Admin: 'adminToken',
  Patient: 'patientToken',
  Doctor: 'doctorToken',
};

// ─── Send Token ───────────────────────────────────────────────────────────────

export const generateToken = (user, message, statusCode, res) => {
  const cookieName = COOKIE_NAME_BY_ROLE[user.role];

  const { password, ...safeUser } = user._doc;

  if (!cookieName) {
    return res.status(400).json({
      success: false,
      message: `Invalid role: ${user.role}. Cannot generate token.`,
    });
  }

  const token = generateJWT(user._id);

  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 7;

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      message,
      user: safeUser,
    });
};
