const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const Specialties = require('../models/specialtyModel');
const ApiError = require('../utils/apiError');

// Image processing middleware
// exports.resizeImage = asyncHandler(async (req, res, next) => {
//   if (!req.files) return next();

//   if (req.files.personalPhoto) {
//     await sharp(req.files.personalPhoto[0].buffer)
//       .resize(600, 600)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toBuffer();

//     req.body.proFileImg = req.files.personalPhoto[0].url;
//   }

//   next();
// });

// @desc  create user
// @route put /api/v1/users
// private

exports.createSpecialities = asyncHandler(async (req, res) => {
  // const { name, description } = req.body;

  const newSpecialiteis = new Specialties(req.body);

  await newSpecialiteis.save();
  res.status(201).json(newSpecialiteis);
});

exports.GetAllSpecialities = asyncHandler(async (req, res) => {
  const specialities = await Specialties.find();
  if (!specialities) {
    return next(new ApiError('No specialist for this id', 404));
  }

  res.status(201).json(specialities);
});

// Get a single user by ID

exports.getSpecialitiesById = asyncHandler(async (req, res) => {
  const specialities = await specialities.findById(req.params.id);
  if (!specialities) {
    return next(
      new ApiError(`No Specialities for this id ${req.params.id}`, 404)
    );
  }
  res.status(200).json(specialities);
});

// Update a user by ID
exports.updateSpecialitiesById = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  const specialities = await specialities.findByIdAndUpdate(
    req.params.id,

    req.body,
    { new: true }
  );

  if (!specialities) {
    return next(
      new ApiError(`No Specialities for this id ${req.params.id}`, 404)
    );
  }

  res.status(200).json(specialities);
});

// Delete a user by ID
exports.deleteSpecialitiesById = asyncHandler(async (req, res) => {
  const specialities = await specialities.findByIdAndDelete(req.params.id);
  if (!specialities) {
    return next(
      new ApiError(`No Specialities for this id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ message: 'Specialities deleted successfully' });
});
