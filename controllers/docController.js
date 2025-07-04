import Doctor from '../models/doctorModel.js';
import Appointment from '../models/appointmentModel.js';
import Prescription from '../models/prescriptionModel.js';
import { generateToken } from '../utils/jwtToken.js';
import cloudinary from '../utils/cloudinary.js';

// Utility: Upload to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'doctors',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload image'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const uploadPDFToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'prescriptions',
        resource_type: 'raw',
        format: 'pdf', // Explicitly set for raw files
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload PDF'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

export const registerDoctor = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    specialization,
    consultationFee,
    department,
    experience,
  } = req.body;
  const file = req.file;

  try {
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    let imageUrl = '';
    if (file) {
      console.log('Uploading to Cloudinary...');
      imageUrl = await uploadToCloudinary(file.buffer);
      console.log('Upload successful:', imageUrl);
    }

    const doctor = await Doctor.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      specialization,
      consultationFee,
      department,
      experience,
      profileImage: imageUrl,
      role: 'Doctor',
    });

    console.log('Doctor created:', doctor._id);

    // Don't generate token yet since not verified
    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully. Awaiting admin verification.',
      doctor: {
        name: `${doctor.firstName} ${doctor.lastName}`,
        _id: doctor._id,
        email: doctor.email,
        specialization: doctor.specialization,
        conconsultationFee: doctor.consultationFee,
        department: doctor.department,
        profileImage: doctor.profileImage,
        isVerified: doctor.isVerified,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const loginDoctor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.isVerified) {
      return res.status(403).json({ message: 'Doctor not verified by admin' });
    }

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    generateToken(doctor, 'Doctor login successful', 200, res);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// PUT /api/admin/verify-doctor/:id
export const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json({ message: 'Doctor verified', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get unverified doctors
export const getUnverifiedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: false });
    res.status(200).json({ doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all verified doctors and count
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: true }).select('-password'); // exclude passwords
    const totalDoctors = doctors.length;

    res.status(200).json({
      success: true,
      totalDoctors,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message,
    });
  }
};

// @desc    Update doctor's profile
// @route   PUT /api/v1/doctor/update-profile
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      specialization,
      department,
      experience,
      consultationFee,
      profileImage,
    } = req.body;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: 'Doctor not found' });
    }

    // Update only the fields that are provided
    if (firstName) doctor.firstName = firstName;
    if (lastName) doctor.lastName = lastName;
    if (email) doctor.email = email;
    if (phone) doctor.phone = phone;
    if (gender) doctor.gender = gender;
    if (specialization) doctor.specialization = specialization;
    if (department) doctor.department = department;
    if (experience) doctor.experience = experience;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (profileImage) doctor.profileImage = profileImage;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      doctor,
    });
  } catch (error) {
    console.error('Update Doctor Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not update profile.',
    });
  }
};

export const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctor = await Doctor.findById(doctorId).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Optional: Fetch doctor's appointments
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'firstName lastName email phone')
      .sort({ appointmentDate: -1 });

    const formattedAppointments = appointments.map((a) => ({
      appointmentId: a._id,
      patientName: `${a.patientId.firstName} ${a.patientId.lastName}`,
      email: a.patientId.email,
      phone: a.patientId.phone,
      department: a.department,
      date: a.appointmentDate,
      time: a.appointmentTime,
      status: a.status,
    }));

    res.status(200).json({
      success: true,
      doctor: doctor,
      appointments: formattedAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const logoutDoctor = async (req, res, next) => {
  res
    .status(200)
    .cookie('doctorToken', '', {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: 'None',
    })
    .json({
      success: true,
      message: 'Doctor logged out!',
    });
};

export const uploadPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medications, notes } = req.body;
    const doctorId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'PDF file is required' });

    const fileUrl = await uploadPDFToCloudinary(file.buffer);

    const prescription = await Prescription.create({
      doctorId,
      patientId,
      appointmentId,
      medications,
      notes,
      prescriptionFileUrl: fileUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Prescription uploaded successfully',
      prescription,
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};
