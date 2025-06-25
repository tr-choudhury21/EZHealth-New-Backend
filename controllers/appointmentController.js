import Appointment from "../models/appointmentModel.js";

// Book appointment (Patient)
export const bookAppointment = async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime, department } = req.body;
  const patientId = req.user.id; // from JWT

  try {
    const newAppointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      department,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Booking failed",
      error: error.message,
    });
  }
};

//cancel appointment(Patient)
export const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const appointment = await Appointment.findById(id);
  if (!appointment) return res.status(404).json({ message: "Not found" });
  if (appointment.patientId.toString() !== userId)
    return res.status(403).json({ message: "Not authorized" });

  if (["Accepted", "Pending"].includes(appointment.status)) {
    appointment.status = "Cancelled";
    await appointment.save();
    return res.status(200).json({ message: "Appointment cancelled" });
  } else {
    return res.status(400).json({ message: "Cannot cancel this appointment" });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "firstName lastName email")
      .populate("doctorId", "firstName lastName email")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      total: appointments.length,
      appointments: appointments.map((appt) => ({
        _id: appt._id,
        patientName: `${appt.patientId.firstName} ${appt.patientId.lastName}`,
        doctorName: `${appt.doctorId.firstName} ${appt.doctorId.lastName}`,
        department: appt.department || appt.doctorId.department,
        appointmentDate: appt.appointmentDate,
        appointmentTime: appt.appointmentTime,
        status: appt.status,
        createdAt: appt.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// Get appointments assigned to logged-in doctor
export const getDoctorAppointments = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "firstName lastName email phone")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      total: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  const doctorId = req.user.id;
  const appointmentId = req.params.id;

  const allowedStatuses = ["Pending", "Accepted", "Rejected", "Completed"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Make sure only the assigned doctor can update it
    if (appointment.doctorId.toString() !== doctorId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this appointment" });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
      error: error.message,
    });
  }
};
