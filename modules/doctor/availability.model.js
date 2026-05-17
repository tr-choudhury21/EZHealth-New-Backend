import mongoose from 'mongoose';

const TimeSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "09:30"
  },
  { _id: false },
);

const DayScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      required: true,
    },
    isOff: { type: Boolean, default: false },
    slots: { type: [TimeSlotSchema], default: [] },
  },
  { _id: false },
);

const AvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      unique: true,
    },
    schedule: { type: [DayScheduleSchema], default: [] },
    slotDuration: { type: Number, default: 30 }, // in minutes
    bufferTime: { type: Number, default: 0 }, // break between slots in minutes
  },
  { timestamps: true },
);

export default mongoose.model('Availability', AvailabilitySchema);
