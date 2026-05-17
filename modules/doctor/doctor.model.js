import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

export default mongoose.model('Doctor', DoctorSchema);
