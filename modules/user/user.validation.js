export const validateRegisterInput = ({
  firstName,
  lastName,
  email,
  password,
  phone,
  gender,
  age,
}) => {
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !phone ||
    !gender ||
    !age
  ) {
    return 'All fields are required';
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return 'Invalid email format';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null; // null = valid
};

export const validateLoginInput = ({ email, password, role }) => {
  if (!email || !password || !role) {
    return 'Email, password and role are required';
  }
  return null;
};
