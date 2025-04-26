const express = require('express');

const router = express.Router();

const {
  getReviewById,
  getReviews,
  updateReviewById,
  deleteReviewById,
} = require('../services/reviewServices');

const authService = require('../services/authServices');

authService.protect;
authService.allowedTo('patient', 'admin');
router
  .route('/')
  .get(getReviews)
  .get(getReviewById)
  .put(updateReviewById)
  .delete(deleteReviewById);
module.exports = router;
