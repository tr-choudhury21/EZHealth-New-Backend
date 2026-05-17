import crypto from 'crypto';
import { razorpay } from '../../config/razorpay.config.js';
import {
  findAppointmentById,
  findAppointmentByOrderId,
  updateAppointmentPaymentPending,
  markAppointmentAsPaid,
  initiateRefund,
  markAppointmentRefunded,
} from './payment.repository.js';

// ─── Create Order ─────────────────────────────────────────────────────────────

export const createOrderService = async ({ amount, appointmentId }) => {
  const appointment = await findAppointmentById(appointmentId);
  if (!appointment) throw { status: 404, message: 'Appointment not found' };

  if (appointment.status !== 'AwaitingPayment') {
    throw { status: 400, message: 'Appointment is not awaiting payment' };
  }

  if (new Date() > appointment.paymentDeadline) {
    // cancel the appointment — free the slot
    appointment.status = 'Cancelled';
    await appointment.save();
    throw {
      status: 410,
      message: 'Payment window expired. Please book again.',
    };
  }

  if (appointment.paymentStatus === 'Paid') {
    throw { status: 400, message: 'Appointment is already paid' };
  }

  const options = {
    amount: amount * 100, // paise
    currency: 'INR',
    receipt: `apt_${appointmentId.slice(-8)}_${Date.now()}`,
    notes: { appointmentId },
  };

  const order = await razorpay.orders.create(options);

  const updatedAppointment = await updateAppointmentPaymentPending(
    appointmentId,
    order.id,
    amount,
  );

  return { order, appointment: updatedAppointment };
};

// ─── Verify Payment ───────────────────────────────────────────────────────────

export const verifyPaymentService = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const appointment = await findAppointmentByOrderId(razorpay_order_id);
  if (!appointment) {
    throw { status: 404, message: 'No appointment found for this order ID' };
  }

  // verify payment deadline again
  if (new Date() > appointment.paymentDeadline) {
    appointment.status = 'Cancelled';
    await appointment.save();
    throw {
      status: 410,
      message: 'Payment window expired. Slot has been released.',
    };
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw {
      status: 400,
      message: 'Payment verification failed — signature mismatch',
    };
  }

  const updatedAppointment = await markAppointmentAsPaid(
    appointment,
    razorpay_payment_id,
    razorpay_signature,
  );

  return updatedAppointment;
};

// ─── Refund Payment ───────────────────────────────────────────────────────────

export const processRefundService = async (appointmentId) => {
  const appointment = await initiateRefund(appointmentId);

  // nothing to refund
  if (!appointment) return null;

  // call Razorpay refund API
  const refund = await razorpay.payments.refund(appointment.razorpayPaymentId, {
    amount: appointment.amount * 100, // full refund in paise
    notes: { reason: 'Appointment cancelled or rejected' },
  });

  await markAppointmentRefunded(appointment);

  return refund;
};
