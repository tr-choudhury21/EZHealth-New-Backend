import {
  getAvailableSlotsService,
  bookAppointmentService,
  cancelAppointmentService,
  getAllAppointmentsService,
  getDoctorAppointmentsService,
  updateAppointmentStatusService,
} from './appointment.service.js';
import {
  validateBookAppointment,
  validateStatusUpdate,
  validateAvailableSlots,
} from './appointment.validation.js';

// ─── Patient ──────────────────────────────────────────────────────────────────

export const getAvailableSlots = async (req, res) => {
  try {
    const error = validateAvailableSlots(req.query);
    if (error) return res.status(400).json({ success: false, message: error });

    const slots = await getAvailableSlotsService(
      req.query.doctorId,
      req.query.date,
    );
    res.status(200).json({ success: true, availableSlots: slots });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const error = validateBookAppointment(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const appointment = await bookAppointmentService(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: appointment._id,
      appointment,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await cancelAppointmentService(
      req.params.id,
      req.user.id,
    );
    res
      .status(200)
      .json({ success: true, message: 'Appointment cancelled', appointment });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await getAllAppointmentsService();
    res
      .status(200)
      .json({ success: true, total: appointments.length, appointments });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// ─── Doctor ───────────────────────────────────────────────────────────────────

export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await getDoctorAppointmentsService(req.user.id);
    res
      .status(200)
      .json({ success: true, total: appointments.length, appointments });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const error = validateStatusUpdate(req.body.status);
    if (error) return res.status(400).json({ success: false, message: error });

    const appointment = await updateAppointmentStatusService(
      req.params.id,
      req.body.status,
      req.user.id,
    );
    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${req.body.status}`,
      appointment,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};
