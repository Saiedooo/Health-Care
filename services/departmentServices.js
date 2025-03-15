const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
const ApiError = require('../utils/apiError');

const Department = require('../models/departmentModel');

// upload Single Image
exports.uploadDepartmentImage = uploadSingleImage('proFileImg');

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

exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, description, image, specialties } = req.body;

  const newDepartment = new Department(req.body);

  await newDepartment.save();
  res.status(201).json(newDepartment);
});

// Get all users
// @admin
exports.getDepartments = asyncHandler(async (req, res) => {
  const department = await Department.find();
  res.status(200).json(department);
  if (!department) {
    return next(new ApiError(`No Department this id ${req.params.id}`, 404));
  }
  res.status(200).json(department);
});

// Get a single user by ID

exports.getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(200).json(department);
});

// Update a user by ID
exports.updateDepartmentById = asyncHandler(async (req, res) => {
  const { name, description, specialties } = req.body;

  const updateDepartment = await Department.findByIdAndUpdate(
    req.params.id,

    req.body,
    { new: true }
  );

  if (!updateDepartment) {
    return next(
      new ApiError(`No Department for this id ${req.params.id}`, 404)
    );
  }

  res.status(200).json(updateDepartment);
});

// Delete a user by ID
exports.deleteDepartmentById = asyncHandler(async (req, res) => {
  const deleteDepartment = await Department.findByIdAndDelete(req.params.id);
  if (!deleteDepartment) {
    return next(
      new ApiError(`No Department for this id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ message: 'Department deleted successfully' });
});
