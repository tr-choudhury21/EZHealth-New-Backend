import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    appointmentDate: Date,
    appointmentTime: String, // e.g., "10:00 AM"
    department: String,
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    amount: {
      type: Number,
      default: 0,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    hasVisited: { type: Boolean, default: false },
    meetingLink: { type: String, default: '' }, // for video consultation
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', AppointmentSchema);
