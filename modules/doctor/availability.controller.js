import {
  setAvailabilityService,
  getAvailableSlotsService,
  getDoctorScheduleService,
} from './availability.service.js';
import {
  validateSetAvailability,
  validateGetSlots,
} from './availability.validation.js';

// Doctor sets their own availability
export const setAvailability = async (req, res) => {
  try {
    const error = validateSetAvailability(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const availability = await setAvailabilityService(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      availability,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// Patient gets available slots for a doctor on a date
export const getAvailableSlots = async (req, res) => {
  try {
    const error = validateGetSlots(req.query);
    if (error) return res.status(400).json({ success: false, message: error });

    const data = await getAvailableSlotsService(
      req.query.doctorId,
      req.query.date,
    );
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// Doctor views their own schedule
export const getDoctorSchedule = async (req, res) => {
  try {
    const availability = await getDoctorScheduleService(req.user.id);
    res.status(200).json({ success: true, availability });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};
