const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createToken = require('../utils/createToken');

const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');

// upload Single Image
exports.uploadUserImage = uploadSingleImage('proFileImg');

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

exports.createUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password, role, phoneNumber, address } = req.body;

    if (!username || !email) {
      return res
        .status(400)
        .json({ message: 'Username and Email are required' });
    }

    const newUser = new User({
      username,
      email,
      password,
      role,
      phoneNumber,
      address,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error creating user', error: err.message });
  }
});

// Get all users
// @admin
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
  if (!users) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(200).json(users);
});

// Get a single user by ID

exports.getUserbyId = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(200).json(user);
});

// Update a user by ID
exports.updateUserById = asyncHandler(async (req, res) => {
  const { username, password, role, fullName, phoneNumber, address, isActive } =
    req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      username,
      password,
      role,
      fullName,
      phoneNumber,
      address,
      isActive,
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }

  res.status(200).json(updatedUser);
});

// Delete a user by ID
exports.deleteUserById = asyncHandler(async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return next(new ApiError(`No user for this id ${req.params.id}`, 404));
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error deleting user', error: err.message });
  }
});
// @desc   Delete user
// @route  Delete /api/v1/users
// private
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  if (!user) {
    return next(new ApiError(`No documents for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: user });
});

// @desc Get logged user data
// @route  Delete /api/v1/users/getMe
// protect

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Delete logged user Data
// @route   PUT /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ msg: 'sucess' });
});

// @desc    Update logged user Data
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateData = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  res.status(200).json({ data: updateData });
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});
