// utils/cron.js
import cron from 'node-cron';
import Appointment from '../appointment/appointment.model.js';

export const startCronJobs = () => {
  // runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const result = await Appointment.updateMany(
        {
          status: 'AwaitingPayment',
          paymentDeadline: { $lt: new Date() }, // deadline passed
        },
        {
          status: 'Cancelled',
        },
      );

      if (result.modifiedCount > 0) {
        console.log(`🧹 Released ${result.modifiedCount} expired unpaid slots`);
      }
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });
};
