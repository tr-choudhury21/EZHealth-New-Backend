import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    department: { type: String, required: true },

    status: {
      type: String,
      enum: [
        'AwaitingPayment',
        'Pending',
        'Accepted',
        'Rejected',
        'Completed',
        'Cancelled',
      ],
      default: 'AwaitingPayment',
    },
    meetingLink: { type: String, default: '' },
    hasVisited: { type: Boolean, default: false },

    // ─── Payment ───────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },

    paymentDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 mins from booking
    },
    amount: { type: Number, default: 0 },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Appointment', AppointmentSchema);
