import {
  createReviewService,
  updateReviewService,
  deleteReviewService,
  getDoctorReviewsService,
} from './review.service.js';
import {
  validateCreateReview,
  validateUpdateReview,
} from './review.validation.js';

// ─── Patient ──────────────────────────────────────────────────────────────────

export const createReview = async (req, res) => {
  try {
    const error = validateCreateReview(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const review = await createReviewService(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const error = validateUpdateReview(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const review = await updateReviewService(
      req.params.id,
      req.body,
      req.user._id,
    );
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    await deleteReviewService(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

// ─── Public ───────────────────────────────────────────────────────────────────

export const getDoctorReviews = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await getDoctorReviewsService(req.params.doctorId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};
