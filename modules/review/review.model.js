import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true, // one review per appointment
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 500 },

    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
ReviewSchema.index({ doctorId: 1, createdAt: -1 });
ReviewSchema.index({ patientId: 1 });

// ─── Auto update doctor's average rating after save ───────────────────────────
ReviewSchema.post('save', async function () {
  await updateDoctorRatingStats(this.doctorId);
});

ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateDoctorRatingStats(doc.doctorId);
});

// ─── Helper to recalculate doctor rating ──────────────────────────────────────
const updateDoctorRatingStats = async (doctorId) => {
  const Review = mongoose.model('Review');
  const Doctor = mongoose.model('Doctor');

  const stats = await Review.aggregate([
    { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
    {
      $group: {
        _id: '$doctorId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Doctor.findByIdAndUpdate(doctorId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // round to 1 decimal
      totalReviews: stats[0].totalReviews,
    });
  } else {
    // no reviews left after deletion
    await Doctor.findByIdAndUpdate(doctorId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

export default mongoose.model('Review', ReviewSchema);
