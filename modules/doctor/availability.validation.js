const VALID_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const isValidTime = (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

export const validateSetAvailability = ({ schedule, slotDuration }) => {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return 'schedule array is required';
  }

  for (const entry of schedule) {
    if (!VALID_DAYS.includes(entry.day)) {
      return `Invalid day: ${entry.day}`;
    }
    if (!entry.isOff) {
      if (!entry.slots || entry.slots.length === 0) {
        return `Slots are required for ${entry.day} if it is not a day off`;
      }
      for (const slot of entry.slots) {
        if (!isValidTime(slot.startTime) || !isValidTime(slot.endTime)) {
          return `Invalid time format in ${entry.day}. Use HH:MM (24hr)`;
        }
        if (slot.startTime >= slot.endTime) {
          return `startTime must be before endTime in ${entry.day}`;
        }
      }
    }
  }

  if (slotDuration && (isNaN(slotDuration) || slotDuration < 15)) {
    return 'slotDuration must be a number and at least 15 minutes';
  }

  return null;
};

export const validateGetSlots = ({ doctorId, date }) => {
  if (!doctorId) return 'doctorId is required';
  if (!date) return 'date is required';
  if (isNaN(new Date(date).getTime())) return 'Invalid date format';
  return null;
};
