import Appointment from './appointment.model.js';

export const ALL_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
];

// ─── Slots ────────────────────────────────────────────────────────────────────

export const findBookedSlots = async (doctorId, date) => {
  return await Appointment.find({
    doctorId,
    appointmentDate: new Date(date),
  }).select('appointmentTime');
};

// ─── Appointment ──────────────────────────────────────────────────────────────

export const findConflictingAppointment = async (doctorId, date, time) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return await Appointment.findOne({
    doctorId,
    appointmentTime: time,
    appointmentDate: { $gte: start, $lte: end },
    status: { $nin: ['Cancelled', 'Rejected'] },
  });
};

// ADD this — atomic findOneAndUpdate to prevent race condition
export const atomicSlotBook = async ({
  doctorId,
  patientId,
  appointmentDate,
  appointmentTime,
  department,
}) => {
  try {
    // Normalize date range
    const start = new Date(appointmentDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(appointmentDate);
    end.setHours(23, 59, 59, 999);

    /*
      Conflict prevention rules:

      1. Same doctor cannot have multiple appointments
         at the same date & time.

      2. Same patient cannot book multiple appointments
         at the same date & time, even with different doctors.

      Cancelled and Rejected appointments are ignored
      because those slots become reusable.
    */

    const existing = await Appointment.findOne({
      appointmentTime,

      appointmentDate: {
        $gte: start,
        $lte: end,
      },

      status: {
        $nin: ['Cancelled', 'Rejected'],
      },

      $or: [{ doctorId }, { patientId }],
    });

    // Conflict detected
    if (existing) {
      // Doctor already booked
      if (existing.doctorId.toString() === doctorId.toString()) {
        throw {
          status: 409,
          message: 'Doctor slot already booked',
        };
      }

      // Patient already has appointment
      if (existing.patientId.toString() === patientId.toString()) {
        throw {
          status: 409,
          message: 'You already have another appointment at this time',
        };
      }
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      patientId,
      appointmentDate,
      appointmentTime,
      department,
      status: 'Pending',
    });

    return appointment;
  } catch (err) {
    // MongoDB duplicate key protection
    // (useful if unique compound indexes are added later)

    if (err.code === 11000) {
      throw {
        status: 409,
        message: 'Appointment slot conflict detected',
      };
    }

    throw err;
  }
};

export const createAppointment = async (data) => {
  return await Appointment.create(data);
};

export const findAppointmentById = async (id) => {
  return await Appointment.findById(id)
    .populate('patientId', 'email firstName lastName')
    .populate('doctorId', 'firstName lastName');
};

export const saveAppointment = async (appointment) => {
  return await appointment.save();
};

export const findAllAppointments = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [appointments, total] = await Promise.all([
    Appointment.find()
      .skip(skip)
      .limit(limit)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName department')
      .sort({ appointmentDate: -1 }),
    Appointment.countDocuments(),
  ]);
  return { appointments, total, page, totalPages: Math.ceil(total / limit) };
};

export const findAppointmentsByDoctorId = async (doctorId) => {
  return await Appointment.find({ doctorId })
    .populate('patientId', 'firstName lastName email phone')
    .sort({ appointmentDate: -1 });
};

export const findAppointmentsByPatientId = async (patientId) => {
  return await Appointment.find({ patientId })
    .populate('doctorId', 'firstName lastName department')
    .sort({ appointmentDate: -1 });
};

export const findBookedSlotsByDoctorAndDate = async (doctorId, date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return await Appointment.find({
    doctorId,
    appointmentDate: { $gte: start, $lte: end },
    status: { $nin: ['Cancelled', 'Rejected'] },
  }).select('appointmentTime');
};
