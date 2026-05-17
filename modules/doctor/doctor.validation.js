export const validateDoctorRegister = ({
  firstName,
  lastName,
  email,
  password,
  phone,
  gender,
  specialization,
  department,
  experience,
  consultationFee,
}) => {
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !phone ||
    !gender ||
    !specialization ||
    !department ||
    !experience ||
    !consultationFee
  ) {
    return 'All fields are required';
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateDoctorLogin = ({ email, password }) => {
  if (!email || !password) return 'Email and password are required';
  return null;
};
