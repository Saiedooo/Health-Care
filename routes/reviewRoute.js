const express = require('express');

const router = express.Router();

const {
  getReviewById,
  getReviews,
  updateReviewById,
  deleteReviewById,
  createReview,
} = require('../services/reviewServices');

const authService = require('../services/authServices');

// Apply protection to all routes
// router.use(authService.protect);
// router.use(authService.allowedTo('patient', 'admin'));

// Create review for specific nurse
router.post('/nurse/:nurseId', createReview);

// General review routes
router.route('/').get(getReviews).post(createReview);

router
  .route('/:id')
  .get(getReviewById)
  .put(updateReviewById)
  .delete(deleteReviewById);

module.exports = router;
