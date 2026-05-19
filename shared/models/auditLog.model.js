import mongoose from 'mongoose';

export const AUDIT_ACTIONS = {
  // ─── Admin Actions ──────────────────────────────────────────
  ADMIN_ADDED: 'ADMIN_ADDED',
  DOCTOR_VERIFIED: 'DOCTOR_VERIFIED',

  // ─── Appointment Actions ────────────────────────────────────
  APPOINTMENT_BOOKED: 'APPOINTMENT_BOOKED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  APPOINTMENT_ACCEPTED: 'APPOINTMENT_ACCEPTED',
  APPOINTMENT_REJECTED: 'APPOINTMENT_REJECTED',
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED',
  APPOINTMENT_EXPIRED: 'APPOINTMENT_EXPIRED', // cron job

  // ─── Payment Actions ────────────────────────────────────────
  PAYMENT_ORDER_CREATED: 'PAYMENT_ORDER_CREATED',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  PAYMENT_REFUND_FAILED: 'PAYMENT_REFUND_FAILED',

  // ─── Doctor Actions ─────────────────────────────────────────
  DOCTOR_REGISTERED: 'DOCTOR_REGISTERED',
  DOCTOR_PROFILE_UPDATED: 'DOCTOR_PROFILE_UPDATED',
  AVAILABILITY_SET: 'AVAILABILITY_SET',
  PRESCRIPTION_UPLOADED: 'PRESCRIPTION_UPLOADED',

  // ─── Patient Actions ────────────────────────────────────────
  PATIENT_REGISTERED: 'PATIENT_REGISTERED',
  PATIENT_PROFILE_UPDATED: 'PATIENT_PROFILE_UPDATED',
};

const AuditLogSchema = new mongoose.Schema(
  {
    // who performed the action
    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'performedBy.userType',
      },
      userType: { type: String, enum: ['User', 'Doctor'], required: true },
      email: { type: String, required: true },
      role: {
        type: String,
        enum: ['Admin', 'Doctor', 'Patient'],
        required: true,
      },
    },

    // what was done
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
    },

    // what resource was affected
    target: {
      resourceType: {
        type: String,
        enum: [
          'Appointment',
          'Doctor',
          'User',
          'Payment',
          'Availability',
          'Prescription',
        ],
        required: true,
      },
      resourceId: { type: mongoose.Schema.Types.ObjectId },
    },

    // what changed
    changes: {
      before: { type: mongoose.Schema.Types.Mixed, default: null },
      after: { type: mongoose.Schema.Types.Mixed, default: null },
    },

    // extra context
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    // was it successful
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true },
);

// ─── Indexes for fast querying ─────────────────────────────────────────────────
AuditLogSchema.index({ 'performedBy.userId': 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ 'target.resourceId': 1 });
AuditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', AuditLogSchema);
