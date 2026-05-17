export const validateCreateOrder = ({ amount, appointmentId }) => {
  if (!appointmentId || appointmentId === 'undefined') {
    return 'appointmentId is missing or invalid';
  }
  if (!amount || isNaN(amount) || amount <= 0) {
    return 'amount must be a valid positive number';
  }
  return null;
};

export const validateVerifyPayment = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return 'razorpay_order_id, razorpay_payment_id and razorpay_signature are all required';
  }
  return null;
};
