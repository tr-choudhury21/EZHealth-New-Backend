import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const DoctorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    specialization: { type: String, required: true },
    department: { type: String, required: true },
    experience: { type: Number, required: true },
    consultationFee: { type: Number, required: true },
    profileImage: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    role: { type: String, default: 'Doctor' },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    refreshTokenHash: { type: String, default: null, select: false },
    refreshTokenExpire: { type: Date, default: null },
  },
  { timestamps: true },
);

// Hash password before saving
DoctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
DoctorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//generate refresh token

DoctorSchema.methods.generateRefreshToken = function () {
  const token = crypto.randomBytes(40).toString('hex');

  this.refreshTokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return token;
};

DoctorSchema.methods.clearRefreshToken = function () {
  this.refreshTokenHash = null;
  this.refreshTokenExpire = null;
};

export default mongoose.model('Doctor', DoctorSchema);
