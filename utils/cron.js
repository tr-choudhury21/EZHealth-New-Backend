// utils/cron.js
import cron from 'node-cron';
import Appointment from '../appointment/appointment.model.js';
import { log, AUDIT_ACTIONS } from '../shared/audit/audit.service.js';

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
        await log({
          performedBy: {
            userId: null,
            userType: 'User',
            email: 'system@ezhealth.com',
            role: 'Admin',
          },
          action: AUDIT_ACTIONS.APPOINTMENT_EXPIRED,
          target: { resourceType: 'Appointment' },
          metadata: { expiredCount: result.modifiedCount },
        });

        console.log(`🧹 Released ${result.modifiedCount} expired unpaid slots`);
      }
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });
};
