import { createNotification } from './notification.repository.js';
import { NOTIFICATION_TYPES } from '../models/notification.model.js';
import { getIO, getOnlineUsers } from '../../config/socket.js';

// ─── Core send function ───────────────────────────────────────────────────────

export const sendNotification = async ({
  recipientId,
  recipientType, // "User" or "Doctor"
  recipientRole, // "Patient", "Doctor", "Admin"
  type,
  title,
  message,
  reference = {},
}) => {
  try {
    // 1. Save to DB
    const notification = await createNotification({
      recipient: {
        userId: recipientId,
        userType: recipientType,
        role: recipientRole,
      },
      type,
      title,
      message,
      reference,
    });

    // 2. Send real-time if user is online
    const onlineUsers = getOnlineUsers();
    const socketId = onlineUsers.get(recipientId.toString());

    if (socketId) {
      getIO().to(socketId).emit('notification', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        reference: notification.reference,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (err) {
    // Notification failure should NEVER crash main flow
    console.error('❌ Notification error:', err.message);
  }
};

// ─── Notification helpers per event ──────────────────────────────────────────

export const notifyAppointmentBooked = async (appointment, patient) => {
  // Notify doctor
  await sendNotification({
    recipientId: appointment.doctorId,
    recipientType: 'Doctor',
    recipientRole: 'Doctor',
    type: NOTIFICATION_TYPES.APPOINTMENT_BOOKED,
    title: 'New Appointment Booked',
    message: `${patient.firstName} ${patient.lastName} booked an appointment on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.appointmentTime}`,
    reference: { resourceType: 'Appointment', resourceId: appointment._id },
  });
};

export const notifyAppointmentAccepted = async (appointment, doctor) => {
  // Notify patient
  await sendNotification({
    recipientId: appointment.patientId,
    recipientType: 'User',
    recipientRole: 'Patient',
    type: NOTIFICATION_TYPES.APPOINTMENT_ACCEPTED,
    title: 'Appointment Accepted ✅',
    message: `Dr. ${doctor.firstName} ${doctor.lastName} accepted your appointment. Meeting link: ${appointment.meetingLink}`,
    reference: { resourceType: 'Appointment', resourceId: appointment._id },
  });
};

export const notifyAppointmentRejected = async (appointment, doctor) => {
  // Notify patient
  await sendNotification({
    recipientId: appointment.patientId,
    recipientType: 'User',
    recipientRole: 'Patient',
    type: NOTIFICATION_TYPES.APPOINTMENT_REJECTED,
    title: 'Appointment Rejected ❌',
    message: `Dr. ${doctor.firstName} ${doctor.lastName} rejected your appointment on ${new Date(appointment.appointmentDate).toDateString()}`,
    reference: { resourceType: 'Appointment', resourceId: appointment._id },
  });
};

export const notifyAppointmentCancelled = async (appointment, patient) => {
  // Notify doctor
  await sendNotification({
    recipientId: appointment.doctorId,
    recipientType: 'Doctor',
    recipientRole: 'Doctor',
    type: NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
    title: 'Appointment Cancelled',
    message: `${patient.firstName} ${patient.lastName} cancelled their appointment on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.appointmentTime}`,
    reference: { resourceType: 'Appointment', resourceId: appointment._id },
  });
};

export const notifyPaymentSuccessful = async (appointment, patient) => {
  // Notify patient
  await sendNotification({
    recipientId: appointment.patientId,
    recipientType: 'User',
    recipientRole: 'Patient',
    type: NOTIFICATION_TYPES.PAYMENT_SUCCESSFUL,
    title: 'Payment Successful 💳',
    message: `Payment of ₹${appointment.amount} was successful for your appointment on ${new Date(appointment.appointmentDate).toDateString()}`,
    reference: { resourceType: 'Payment', resourceId: appointment._id },
  });
};

export const notifyRefundProcessed = async (appointment) => {
  // Notify patient
  await sendNotification({
    recipientId: appointment.patientId,
    recipientType: 'User',
    recipientRole: 'Patient',
    type: NOTIFICATION_TYPES.REFUND_PROCESSED,
    title: 'Refund Processed 💰',
    message: `A refund of ₹${appointment.amount} has been processed for your cancelled appointment`,
    reference: { resourceType: 'Payment', resourceId: appointment._id },
  });
};

export const notifyPrescriptionUploaded = async (prescription, doctor) => {
  // Notify patient
  await sendNotification({
    recipientId: prescription.patientId,
    recipientType: 'User',
    recipientRole: 'Patient',
    type: NOTIFICATION_TYPES.PRESCRIPTION_UPLOADED,
    title: 'New Prescription 📋',
    message: `Dr. ${doctor.firstName} ${doctor.lastName} uploaded a new prescription for you`,
    reference: { resourceType: 'Prescription', resourceId: prescription._id },
  });
};

export const notifyDoctorVerified = async (doctor) => {
  // Notify doctor
  await sendNotification({
    recipientId: doctor._id,
    recipientType: 'Doctor',
    recipientRole: 'Doctor',
    type: NOTIFICATION_TYPES.DOCTOR_VERIFIED,
    title: 'Account Verified ✅',
    message:
      'Your account has been verified by admin. You can now login and start accepting appointments.',
    reference: { resourceType: 'Doctor', resourceId: doctor._id },
  });
};

export const notifyAdminDoctorRegistered = async (doctor, adminIds) => {
  // Notify all admins
  for (const adminId of adminIds) {
    await sendNotification({
      recipientId: adminId,
      recipientType: 'User',
      recipientRole: 'Admin',
      type: NOTIFICATION_TYPES.DOCTOR_REGISTERED,
      title: 'New Doctor Registered 🏥',
      message: `Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization}) has registered and is awaiting verification`,
      reference: { resourceType: 'Doctor', resourceId: doctor._id },
    });
  }
};
