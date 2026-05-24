import {
  findAvailabilityByDoctorId,
  upsertAvailability,
} from './availability.repository.js';
import { findBookedSlotsByDoctorAndDate } from '../appointment/appointment.repository.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

// generate all slots from a time range based on duration + buffer
export const generateSlotsFromRange = (
  startTime,
  endTime,
  duration,
  buffer,
) => {
  const slots = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (current + duration <= end) {
    slots.push(minutesToTime(current));
    current += duration + buffer;
  }

  return slots;
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const setAvailabilityService = async (
  doctorId,
  { schedule, slotDuration, bufferTime },
) => {
  const availability = await upsertAvailability(doctorId, {
    schedule,
    slotDuration: slotDuration || 30,
    bufferTime: bufferTime || 0,
  });
  return availability;
};

export const getAvailableSlotsService = async (doctorId, date) => {
  const availability = await findAvailabilityByDoctorId(doctorId);

  if (!availability) {
    throw { status: 404, message: 'Doctor has not set availability yet' };
  }

  // get day name from date
  const dayName = DAY_NAMES[new Date(date).getDay()];

  const daySchedule = availability.schedule.find((s) => s.day === dayName);

  if (!daySchedule || daySchedule.isOff || daySchedule.slots.length === 0) {
    return { date, day: dayName, availableSlots: [] };
  }

  // generate all possible slots from the day's time ranges
  const allSlots = daySchedule.slots.flatMap((range) =>
    generateSlotsFromRange(
      range.startTime,
      range.endTime,
      availability.slotDuration,
      availability.bufferTime,
    ),
  );

  // get already booked slots for this doctor on this date
  const booked = await findBookedSlotsByDoctorAndDate(doctorId, date);
  const bookedTimes = new Set(booked.map((a) => a.appointmentTime));

  const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

  return {
    date,
    day: dayName,
    slotDuration: availability.slotDuration,
    availableSlots,
  };
};

export const getDoctorScheduleService = async (doctorId) => {
  const availability = await findAvailabilityByDoctorId(doctorId);
  if (!availability) throw { status: 404, message: 'Availability not set yet' };
  return availability;
};
