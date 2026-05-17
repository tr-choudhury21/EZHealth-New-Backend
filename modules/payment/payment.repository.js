import Appointment from '../appointment/appointment.model.js';

export const findAppointmentById = async (id) => {
  return await Appointment.findById(id);
};

export const findAppointmentByOrderId = async (razorpayOrderId) => {
  return await Appointment.findOne({ razorpayOrderId });
};

export const updateAppointmentPaymentPending = async (
  appointmentId,
  orderId,
  amount,
) => {
  return await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      razorpayOrderId: orderId,
      amount,
      paymentStatus: 'Pending',
    },
    { new: true },
  );
};

export const markAppointmentAsPaid = async (
  appointment,
  paymentId,
  signature,
) => {
  appointment.paymentStatus = 'Paid';
  appointment.razorpayPaymentId = paymentId;
  appointment.razorpaySignature = signature;
  appointment.status = 'Pending';
  return await appointment.save();
};

export const initiateRefund = async (appointmentId) => {
  const appointment = await findAppointmentById(appointmentId);

  if (!appointment) throw { status: 404, message: 'Appointment not found' };

  // only refund if actually paid
  if (appointment.paymentStatus !== 'Paid') return null;

  // already refunded
  if (appointment.paymentStatus === 'Refunded') return null;

  return appointment;
};

export const markAppointmentRefunded = async (appointment) => {
  appointment.paymentStatus = 'Refunded';
  return await appointment.save();
};
