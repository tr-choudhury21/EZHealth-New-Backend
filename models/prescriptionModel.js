import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  medications: [String], // e.g., ["Paracetamol 500mg", "Vitamin D3"]
  notes: String,
  prescriptionFileUrl: String, // (Cloudinary/S3)
  issuedAt: Date,
});

export default mongoose.model("Prescription", PrescriptionSchema);
