import {
  ALL_SLOTS,
  findBookedSlots,
  findConflictingAppointment,
  createAppointment,
  findAppointmentById,
  saveAppointment,
  findAllAppointments,
  findAppointmentsByDoctorId,
} from './appointment.repository.js';
import {
  notifyAppointmentBooked,
  notifyAppointmentAccepted,
  notifyAppointmentRejected,
  notifyAppointmentCancelled,
} from '../shared/notifications/notification.service.js';
import { findDoctorById } from '../doctor/doctor.repository.js';
import { processRefundService } from '../payment/payment.service.js';
import { findAvailabilityByDoctorId } from '../doctor/availability.repository.js';
import { generateSlotsFromRange } from '../doctor/availability.service.js';
import { atomicSlotBook } from './appointment.repository.js';
import { sendEmail } from '../../utils/email.js';
import { log, getActor, AUDIT_ACTIONS } from '../shared/audit/audit.service.js';

// ─── Slots ────────────────────────────────────────────────────────────────────

export const getAvailableSlotsService = async (doctorId, date) => {
  const booked = await findBookedSlots(doctorId, date);
  const bookedTimes = booked.map((a) => a.appointmentTime);
  return ALL_SLOTS.filter((slot) => !bookedTimes.includes(slot));
};

// ─── Book ─────────────────────────────────────────────────────────────────────

// REPLACE your existing bookAppointmentService
export const bookAppointmentService = async (data, patientUser) => {
  const { doctorId, appointmentDate, appointmentTime, department } = data;

  // Step 1 — check slot exists in doctor's availability
  const dayName = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][new Date(`${appointmentDate}T00:00:00Z`).getDay()];

  const doctor = await findDoctorById(doctorId);

  if (!doctor) {
    throw {
      status: 404,
      message: 'Doctor not found',
    };
  }

  const availability = await findAvailabilityByDoctorId(doctorId);

  if (!availability) {
    throw { status: 400, message: 'Doctor has not set their availability yet' };
  }

  const daySchedule = availability.schedule.find((s) => s.day === dayName);

  if (!daySchedule || daySchedule.isOff) {
    throw { status: 400, message: `Doctor is not available on ${dayName}` };
  }

  // check the requested time is actually in the doctor's generated slots
  const validSlots = daySchedule.slots.flatMap((range) =>
    generateSlotsFromRange(
      range.startTime,
      range.endTime,
      availability.slotDuration,
      availability.bufferTime,
    ),
  );

  if (!validSlots.includes(appointmentTime)) {
    throw {
      status: 400,
      message: 'Selected time slot is not available for this doctor',
    };
  }

  // Step 2 — atomic booking (prevents race condition)
  const appointment = await atomicSlotBook({
    doctorId,
    patientId: patientUser._id,
    appointmentDate,
    appointmentTime,
    department,
  });

  if (!appointment) {
    await log({
      performedBy: getActor(patientUser),
      action: AUDIT_ACTIONS.APPOINTMENT_BOOKED,
      target: { resourceType: 'Appointment' },
      status: 'failure',
      metadata: {
        reason: 'Slot already booked',
        doctorId,
        appointmentDate,
        appointmentTime,
      },
    });
    throw {
      status: 409,
      message: 'This slot was just booked. Please select another.',
    };
  }

  await log({
    performedBy: getActor(patientUser),
    action: AUDIT_ACTIONS.APPOINTMENT_BOOKED,
    target: { resourceType: 'Appointment', resourceId: appointment._id },
    changes: { before: null, after: { status: 'AwaitingPayment' } },
    metadata: { doctorId, appointmentDate, appointmentTime, department },
  });

  await notifyAppointmentBooked(appointment, patientUser);

  return appointment;
};

// ─── Cancel ───────────────────────────────────────────────────────────────────

export const cancelAppointmentService = async (appointmentId, user) => {
  const appointment = await findAppointmentById(appointmentId);
  if (!appointment) throw { status: 404, message: 'Appointment not found' };

  if (appointment.patientId.toString() !== user._id.toString()) {
    throw { status: 403, message: 'Not authorized to cancel this appointment' };
  }

  if (!['Accepted', 'Pending'].includes(appointment.status)) {
    throw { status: 400, message: 'Cannot cancel this appointment' };
  }

  const previousStatus = appointment.status;
  appointment.status = 'Cancelled';
  await saveAppointment(appointment);

  await log({
    performedBy: getActor(user),
    action: AUDIT_ACTIONS.APPOINTMENT_CANCELLED,
    target: { resourceType: 'Appointment', resourceId: appointment._id },
    changes: {
      before: { status: previousStatus },
      after: { status: 'Cancelled' },
    },
  });

  // trigger refund if payment was made
  await processRefundService(appointmentId, req.user);
  await notifyAppointmentCancelled(appointment, user);
  return appointment;
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllAppointmentsService = async () => {
  const appointments = await findAllAppointments();

  return appointments.map((a) => ({
    _id: a._id,
    patientName: `${a.patientId.firstName} ${a.patientId.lastName}`,
    doctorName: `${a.doctorId.firstName} ${a.doctorId.lastName}`,
    department: a.department || a.doctorId.department,
    appointmentDate: a.appointmentDate,
    appointmentTime: a.appointmentTime,
    status: a.status,
    createdAt: a.createdAt,
  }));
};

// ─── Doctor ───────────────────────────────────────────────────────────────────

export const getDoctorAppointmentsService = async (doctorId) => {
  return await findAppointmentsByDoctorId(doctorId);
};

export const updateAppointmentStatusService = async (
  appointmentId,
  status,
  doctorUser,
) => {
  const appointment = await findAppointmentById(appointmentId);
  if (!appointment) throw { status: 404, message: 'Appointment not found' };

  if (appointment.doctorId.toString() !== doctorUser._id.toString()) {
    throw { status: 403, message: 'Unauthorized to update this appointment' };
  }

  const previousStatus = appointment.status;
  appointment.status = status;

  const actionMap = {
    Accepted: AUDIT_ACTIONS.APPOINTMENT_ACCEPTED,
    Rejected: AUDIT_ACTIONS.APPOINTMENT_REJECTED,
    Completed: AUDIT_ACTIONS.APPOINTMENT_COMPLETED,
  };

  if (status === 'Accepted') {
    appointment.meetingLink = `https://meet.jit.si/Room-${appointment._id}`;
    await _sendAcceptanceEmail(appointment);
    await notifyAppointmentAccepted(appointment, doctorUser);
  }

  if (status === 'Rejected') {
    await _sendRejectionEmail(appointment);
    await notifyAppointmentRejected(appointment, doctorUser);
    // trigger refund if payment was made
    await processRefundService(appointmentId);
  }

  await log({
    performedBy: getActor(doctorUser),
    action: actionMap[status],
    target: { resourceType: 'Appointment', resourceId: appointment._id },
    changes: { before: { status: previousStatus }, after: { status } },
    metadata: { meetingLink: appointment.meetingLink || null },
  });

  await saveAppointment(appointment);
  return appointment;
};

// ─── Email Helpers (private) ──────────────────────────────────────────────────

const _sendAcceptanceEmail = async (appointment) => {
  try {
    const date = new Date(appointment.appointmentDate).toLocaleDateString();
    const content = `
      <h3>Your Appointment has been Approved ✅</h3>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
      <p><strong>Meeting Link:</strong> <a href="${appointment.meetingLink}">Join Meeting</a></p>
      <p>Thank you for choosing EZHealth!</p>
    `;
    await sendEmail(
      appointment.patientId.email,
      'Appointment Approved - Join Link Inside',
      content,
    );
  } catch (err) {
    console.error('Failed to send acceptance email:', err.message);
  }
};

const _sendRejectionEmail = async (appointment) => {
  try {
    const date = new Date(appointment.appointmentDate).toLocaleDateString();
    const content = `
      <h3>Appointment Rejected ❌</h3>
      <p>Your appointment on <strong>${date}</strong> at <strong>${appointment.appointmentTime}</strong> has been rejected.</p>
      <p>Please consider booking another slot or contacting the hospital for support.</p>
    `;
    await sendEmail(
      appointment.patientId.email,
      'Appointment Rejected',
      content,
    );
  } catch (err) {
    console.error('Failed to send rejection email:', err.message);
  }
};
