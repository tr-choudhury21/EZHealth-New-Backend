import Availability from './availability.model.js';

export const findAvailabilityByDoctorId = async (doctorId) => {
  return await Availability.findOne({ doctorId });
};

export const upsertAvailability = async (doctorId, data) => {
  return await Availability.findOneAndUpdate(
    { doctorId },
    { ...data, doctorId },
    { new: true, upsert: true },
  );
};
