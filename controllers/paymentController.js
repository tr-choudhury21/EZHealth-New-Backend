import { razorpay } from '../utils/razorpay.js';
import Appointment from '../models/appointmentModel.js';
import crypto from 'crypto';

export const createOrder = async (req, res) => {
  try {
    const { amount, appointmentId } = req.body;

    // console.log('Request body:', req.body);

    if (!appointmentId || appointmentId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'appointmentId is missing or invalid',
      });
    }

    // console.log('Received amount:', amount);
    // console.log('Received appointmentId:', appointmentId);

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: 'INR',
      receipt: `apt_${appointmentId.slice(-8)}_${Date.now()}`,
      notes: { appointmentId },
    };

    const order = await razorpay.orders.create(options);
    // Save Razorpay order ID to appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        razorpayOrderId: order.id,
        amount: amount,
        paymentStatus: 'Pending',
      },
      { new: true }
    );

    // console.log('Updated appointment:', updatedAppointment);
    res
      .status(200)
      .json({ success: true, order, appointment: updatedAppointment });
  } catch (error) {
    console.error('❌ Razorpay order creation failed:', error);
    res.status(500).json({
      message: 'Failed to create Razorpay order',
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const appointment = await Appointment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'No appointment found for this order ID',
      });
    }

    const sign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (sign !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: 'Payment verification failed' });
    }

    // Update appointment as paid
    appointment.paymentStatus = 'Paid';
    appointment.razorpayPaymentId = razorpay_payment_id;
    appointment.razorpaySignature = razorpay_signature;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      appointment,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error verifying payment' });
  }
};
