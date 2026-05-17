import { createOrderService, verifyPaymentService } from './payment.service.js';
import {
  validateCreateOrder,
  validateVerifyPayment,
} from './payment.validation.js';

export const createOrder = async (req, res) => {
  try {
    const error = validateCreateOrder(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const { order, appointment } = await createOrderService(req.body);
    res.status(200).json({ success: true, order, appointment });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const error = validateVerifyPayment(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const appointment = await verifyPaymentService(req.body);
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      appointment,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};
