import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = {
  // Patient notifications
  APPOINTMENT_ACCEPTED: 'APPOINTMENT_ACCEPTED',
  APPOINTMENT_REJECTED: 'APPOINTMENT_REJECTED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  PAYMENT_SUCCESSFUL: 'PAYMENT_SUCCESSFUL',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  PRESCRIPTION_UPLOADED: 'PRESCRIPTION_UPLOADED',

  // Doctor notifications
  APPOINTMENT_BOOKED: 'APPOINTMENT_BOOKED',
  DOCTOR_VERIFIED: 'DOCTOR_VERIFIED',

  // Admin notifications
  DOCTOR_REGISTERED: 'DOCTOR_REGISTERED',
};

const NotificationSchema = new mongoose.Schema(
  {
    // who receives this notification
    recipient: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipient.userType',
        required: true,
      },
      userType: { type: String, enum: ['User', 'Doctor'], required: true },
      role: {
        type: String,
        enum: ['Patient', 'Doctor', 'Admin'],
        required: true,
      },
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },

    // resource the notification is about
    reference: {
      resourceType: {
        type: String,
        enum: ['Appointment', 'Payment', 'Prescription', 'Doctor', 'User'],
      },
      resourceId: { type: mongoose.Schema.Types.ObjectId },
    },

    isRead: { type: Boolean, default: false },

    // auto delete after 15 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
NotificationSchema.index({ 'recipient.userId': 1, createdAt: -1 });
NotificationSchema.index({ 'recipient.userId': 1, isRead: 1 });

export default mongoose.model('Notification', NotificationSchema);
