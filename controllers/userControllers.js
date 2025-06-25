import User from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";
import Prescription from "../models/prescriptionModel.js";
import { generateToken } from "../utils/jwtToken.js";

export const registerPatient = async (req, res) => {
  const { firstName, lastName, email, password, phone, gender, age } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user (password is auto-hashed by pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      age,
      role: "Patient",
    });

    // Generate token and send response
    generateToken(user, "User Registered!", 200, res);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  //compare password
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (role !== user.role) {
    return res.status(403).json({ message: "Access denied, role mismatch" });
  }

  //generate token
  generateToken(user, "User Logged In!", 200, res);
};

//add new admin by an Admin

export const addNewAdmin = async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, age } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !age
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields!",
    });
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return res.status(400).json({
      success: false,
      message: "Admin already registered with this email!",
    });
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    age,
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New Admin Registered!",
  });
};

//Admin Logout
export const logoutAdmin = async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Admin logged out!",
    });
};

//Patient Logout
export const logoutPatient = async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Patient logged out!",
    });
};

//user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get full user info
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get all appointments for this user
    const appointments = await Appointment.find({ patientId: userId })
      .populate("doctorId", "firstName lastName department")
      .sort({ appointmentDate: -1 });

    const formattedAppointments = appointments.map((a) => ({
      appointmentId: a._id,
      doctorName: `Dr. ${a.doctorId.firstName} ${a.doctorId.lastName}`,
      department: a.doctorId.department,
      date: a.appointmentDate,
      time: a.appointmentTime,
      status: a.status,
    }));

    //get prescription details
    const prescriptions = await Prescription.find({ patientId: userId })
      .populate("doctorId", "firstName lastName")
      .sort({ issuedAt: -1 });

    const formattedPrescriptions = prescriptions.map((p) => ({
      doctorName: `Dr. ${p.doctorId.firstName} ${p.doctorId.lastName}`,
      medications: p.medications,
      notes: p.notes,
      fileUrl: p.prescriptionFileUrl,
      issuedAt: p.issuedAt,
    }));

    res.status(200).json({
      success: true,
      profile: user,
      appointments: formattedAppointments,
      prescriptions: formattedPrescriptions,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
