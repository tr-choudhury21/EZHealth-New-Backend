import Appointment from '../models/appointmentModel.js';
import { sendEmail } from '../utils/email.js';

//available slots for appointment (Patient)
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    const allSlots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '12:00 PM',
      '12:30 PM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
      '05:00 PM',
      '05:30 PM',
      '06:00 PM',
      '06:30 PM',
      '07:00 PM',
    ];

    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: new Date(date),
    });

    const bookedTimes = bookedAppointments.map((app) => app.appointmentTime);

    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    res.status(200).json({ success: true, availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Book appointment (Patient)
export const bookAppointment = async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime, department } = req.body;
  const patientId = req.user.id; // from JWT

  try {
    const exists = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Time slot already booked. Please select another.',
      });
    }

    const newAppointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      department,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: newAppointment._id,
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Booking failed',
      error: error.message,
    });
  }
};

//cancel appointment(Patient)
export const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const appointment = await Appointment.findById(id);
  if (!appointment) return res.status(404).json({ message: 'Not found' });
  if (appointment.patientId.toString() !== userId)
    return res.status(403).json({ message: 'Not authorized' });

  if (['Accepted', 'Pending'].includes(appointment.status)) {
    appointment.status = 'Cancelled';
    await appointment.save();
    return res.status(200).json({ message: 'Appointment cancelled' });
  } else {
    return res.status(400).json({ message: 'Cannot cancel this appointment' });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email')
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
      message: 'Failed to fetch appointments',
      error: error.message,
    });
  }
};

// Get appointments assigned to logged-in doctor
export const getDoctorAppointments = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'firstName lastName email phone')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      total: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  const doctorId = req.user.id;
  const appointmentId = req.params.id;

  const allowedStatuses = ['Pending', 'Accepted', 'Rejected', 'Completed'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Make sure only the assigned doctor can update it
    if (appointment.doctorId.toString() !== doctorId) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to update this appointment' });
    }

    appointment.status = status;

    const patientEmail = appointment.patientId.email;
    const doctorName = `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`;
    const date = new Date(appointment.appointmentDate).toLocaleDateString();
    const time = appointment.appointmentTime;

    if (status === 'Accepted') {
      // Generate and save meeting link
      appointment.meetingLink = `https://meet.jit.si/Room-${appointment._id}`;

      //   const emailContent = `
      //   <h3>Your Appointment has been Approved ✅</h3>
      //   <p><strong>Doctor:</strong> ${doctorName}</p>
      //   <p><strong>Date:</strong> ${date}</p>
      //   <p><strong>Time:</strong> ${time}</p>
      //   <p><strong>Meeting Link:</strong> <a href="${appointment.meetingLink}" target="_blank">Join Meeting</a></p>
      //   <br/>
      //   <p>Thank you for choosing our hospital!</p>
      // `;

      //   await sendEmail(
      //     patientEmail,
      //     'Appointment Approved - Join Link Inside',
      //     emailContent
      //   );
    }

    // if (status === 'Rejected') {
    //   const emailContent = `
    //   <h3>Appointment Rejected ❌</h3>
    //   <p>We regret to inform you that your appointment with <strong>${doctorName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been <span style="color:red;"><strong>rejected</strong></span>.</p>
    //   <p>Please consider booking another slot or contacting the hospital for support.</p>
    //   <br/>
    //   <p>We apologize for the inconvenience.</p>
    // `;

    //   await sendEmail(patientEmail, 'Appointment Rejected', emailContent);
    // }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message,
    });
  }
};
