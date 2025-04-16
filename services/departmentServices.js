const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const Department = require('../models/departmentModel');
const ApiError = require('../utils/apiError');

// Image processing middleware
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.personalPhoto) {
    await sharp(req.files.personalPhoto[0].buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    req.body.image = req.files.personalPhoto[0].url;
  }

  next();
});

// Create department handler
exports.createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({
    status: 'success',
    data: department,
  });
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
