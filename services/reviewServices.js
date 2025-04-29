const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const Department = require('../models/departmentModel');
const ApiError = require('../utils/apiError');
const Review = require('../models/reviewModel');

// Nested Route
// Get /api/v1/products/:productId/reviews
// exports.createFilterObj = (req, res, next) => {
//   let filterObject = {};
//   if (req.params.productId) filterObject = { product: req.params.productId };
//   req.filterObj = filterObject;
//   next();
// };

// Create department handler
exports.createReview = asyncHandler(async (req, res, next) => {
  // Get nurse ID from params
  const nurseId = req.params.nurseId;

  // Prepare review data
  const reviewData = {
    title: req.body.title,
    ratings: req.body.ratings || 0, // Default to 0 if not provided
    user: req.body.user,
    nurse: nurseId, // Add nurse ID from params
  };

  // Create review
  const review = await Review.create(reviewData);

  res.status(201).json({
    status: 'success',
    data: review,
  });
});
// Get all users
// @admin
exports.getReviews = asyncHandler(async (req, res, next) => {
  const Reviews = await Review.find();

  if (!Reviews) {
    return next(new ApiError(`No Review for this id ${req.params.id}`, 404));
  }
  res.status(200).json(Reviews);
});

// Get a single user by ID

exports.getReviewById = asyncHandler(async (req, res, next) => {
  const Review = await Review.findById(req.params.id);
  if (!Review) {
    return next(new ApiError(`No Reviews for this User ${req.params.id}`, 404));
  }
  res.status(200).json(Review);
});

// Update a user by ID
exports.updateReviewById = asyncHandler(async (req, res, next) => {
  // const { name, description, specialties } = req.body;

  const updateReview = await Review.findByIdAndUpdate(
    req.params.id,

    req.body,
    { new: true }
  );

  if (!updateReview) {
    return next(new ApiError(`No Review for this id ${req.params.id}`, 404));
  }

  res.status(200).json(Review);
});

// Delete a user by ID
exports.deleteReviewById = asyncHandler(async (req, res, next) => {
  const Review = await Review.findByIdAndDelete(req.params.id);
  if (!Review) {
    return next(new ApiError(`No Review for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ message: 'Review Deleted Succefully' });
});

// Get all reviews for a specific nurse
exports.getNurseReviews = asyncHandler(async (req, res, next) => {
  const nurseId = req.params.nurseId;

  // Find all reviews for the specified nurse
  const reviews = await Review.find({ nurse: nurseId })
    .populate({
      path: 'user',
      select: 'firstName lastName personalPhoto',
    })
    .populate({
      path: 'nurse',
      select: 'firstName lastName personalPhoto',
    });

  // Calculate average rating
  const totalRatings = reviews.reduce(
    (sum, review) => sum + (review.ratings || 0),
    0
  );
  const averageRating = reviews.length > 0 ? totalRatings / reviews.length : 0;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    data: reviews,
  });
});
