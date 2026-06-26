import jwt from 'jsonwebtoken';
import crypto from "crypto";



// ─── Cookie names ─────────────────────────────────────────────────────────────

export const COOKIE_NAMES = {
  Admin:   { access: "adminToken",   refresh: "adminRefreshToken"   },
  Patient: { access: "patientToken", refresh: "patientRefreshToken" },
  Doctor:  { access: "doctorToken",  refresh: "doctorRefreshToken"  },
};

// ─── Generate short-lived access token ───────────────────────────────────────

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
};


// ─── Access token cookie options ──────────────────────────────────────────────

const accessCookieOptions = {
  httpOnly: true,
  secure:   true,
  sameSite: "None",
  expires:  new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
};


// ─── Refresh token cookie options ─────────────────────────────────────────────

const refreshCookieOptions = {
  httpOnly: true,
  secure:   true,
  sameSite: "None",
  expires:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
};


// ─── Main function — send both tokens ───────────────────────────────────────────────────────────────

export const generateToken = (user, message, statusCode, res) => {
  const cookies = COOKIE_NAMES[user.role];

  if (!cookies) {
    return res.status(400).json({
      success: false,
      message: `Invalid role: ${user.role}`,
    });
  }

  // 1. Generate short-lived access token
  const accessToken = generateAccessToken(user._id);

  // 2. Generate refresh token + save hash to DB
  const refreshToken = user.generateRefreshToken();
  await user.save({ validateBeforeSave: false });

  // 3. Remove sensitive fields from response
  const { password, refreshTokenHash, ...safeUser } = user._doc;

  // 4. Set both cookies
  res
    .status(statusCode)
    .cookie(cookies.access,  accessToken,  accessCookieOptions)
    .cookie(cookies.refresh, refreshToken, refreshCookieOptions)
    .json({
      success: true,
      message,
      user: safeUser,
    });
};


// ─── Clear both cookies (logout) ─────────────────────────────────────────────

export const clearTokenCookies = (role, res) => {
  const cookies  = COOKIE_NAMES[role];
  const cleared  = {
    httpOnly: true,
    secure:   true,
    sameSite: "None",
    expires:  new Date(Date.now()),
  };

  res
    .cookie(cookies.access,  "", cleared)
    .cookie(cookies.refresh, "", cleared);
};
