import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DoctorSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    phone: String,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    specialization: String,
    department: String,
    experience: String,
    profileImage: {
      type: String, // URL of the image
      default: "", // Optional: fallback avatar
    },
    isVerified: { type: Boolean, default: false },
    role: { type: String, default: "Doctor" },
  },
  { timestamps: true }
);

DoctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

DoctorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

DoctorSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export default mongoose.model("Doctor", DoctorSchema);
