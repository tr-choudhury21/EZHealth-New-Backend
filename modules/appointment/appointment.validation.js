const ALLOWED_STATUSES = [
  'Pending',
  'Accepted',
  'Rejected',
  'Completed',
  'Cancelled',
];

export const validateBookAppointment = ({
  doctorId,
  appointmentDate,
  appointmentTime,
  department,
}) => {
  if (!doctorId || !appointmentDate || !appointmentTime || !department) {
    return 'doctorId, appointmentDate, appointmentTime and department are required';
  }
  return null;
};

export const validateStatusUpdate = (status) => {
  if (!status) return 'Status is required';
  if (!ALLOWED_STATUSES.includes(status)) {
    return `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`;
  }
  return null;
};

export const validateAvailableSlots = ({ doctorId, date }) => {
  if (!doctorId || !date) return 'doctorId and date are required';
  return null;
};
