const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
const ApiError = require('../utils/apiError');

const Specialities = require('../models/specialtyModel');

// upload Single Image
exports.uploadSpecialitiesImage = uploadSingleImage('proFileImg');

// upload imge processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);
    req.body.proFileImg = filename;
  }
  next();
});

// @desc  create user
// @route put /api/v1/users
// private

exports.createSpecialities = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const newSpecialiteis = new Specialities(req.body);

  await newSpecialiteis.save();
  res.status(201).json(newSpecialiteis);
});

exports.GetAllSpecialities = asyncHandler(async (req, res) => {
  const specialities = await Specialities.find();
  if (!specialities) {
    return next(new ApiError('No specialist for this id', 404));
  }

  res.status(201).json(specialities);
});

// Get a single user by ID

exports.getSpecialitiesById = asyncHandler(async (req, res) => {
  const specialities = await Specialities.findById(req.params.id);
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

  const specialities = await Specialities.findByIdAndUpdate(
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
  const specialities = await Specialities.findByIdAndDelete(req.params.id);
  if (!specialities) {
    return next(
      new ApiError(`No Specialities for this id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ message: 'Specialities deleted successfully' });
});
