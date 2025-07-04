export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  let cookieName;

  switch (user.role) {
    case 'Admin':
      cookieName = 'adminToken';
      break;
    case 'Patient':
      cookieName = 'patientToken';
      break;
    case 'Doctor':
      cookieName = 'doctorToken';
      break;
  }
  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};
