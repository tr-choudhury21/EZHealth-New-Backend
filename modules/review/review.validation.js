export const validateCreateReview = ({ rating, comment }) => {
  if (!rating) return 'Rating is required';
  if (!comment) return 'Comment is required';

  if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
    return 'Rating must be a whole number between 1 and 5';
  }

  if (comment.trim().length < 10) {
    return 'Comment must be at least 10 characters';
  }

  if (comment.trim().length > 500) {
    return 'Comment cannot exceed 500 characters';
  }

  return null;
};

export const validateUpdateReview = ({ rating, comment }) => {
  if (!rating && !comment) {
    return 'At least one of rating or comment is required';
  }

  if (
    rating &&
    (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5)
  ) {
    return 'Rating must be a whole number between 1 and 5';
  }

  if (comment && comment.trim().length < 10) {
    return 'Comment must be at least 10 characters';
  }

  if (comment && comment.trim().length > 500) {
    return 'Comment cannot exceed 500 characters';
  }

  return null;
};
