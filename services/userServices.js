const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createToken = require('../utils/createToken');

const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');

// console.log(uuidv4());

// exports.resizeImage = async (req, res, next) => {
//   try {
//     if (!req.files) return next();

//     // 1) Personal photo
//     if (req.files.personalPhoto) {
//       const filename = `user-${uuidv4()}-${Date.now()}-personal.jpeg`;
//       await sharp(req.files.personalPhoto[0].buffer)
//         .resize(500, 500)
//         .toFormat('jpeg')
//         .jpeg({ quality: 90 })
//         .toFile(`uploads/users/${filename}`);
//       req.body.personalPhoto = filename;
//     }

//     // 2) ID photo
//     if (req.files.idPhoto) {
//       const filename = `user-${uuidv4()}-${Date.now()}-id.jpeg`;
//       await sharp(req.files.idPhoto[0].buffer)
//         .resize(500, 500)
//         .toFormat('jpeg')
//         .jpeg({ quality: 90 })
//         .toFile(`uploads/users/${filename}`);
//       req.body.idPhoto = filename;
//     }

//     // 3) Business card photo (for nurses)
//     if (req.files.businessCardPhoto) {
//       const filename = `user-${uuidv4()}-${Date.now()}-business-card.jpeg`;
//       await sharp(req.files.businessCardPhoto[0].buffer)
//         .resize(500, 500)
//         .toFormat('jpeg')
//         .jpeg({ quality: 90 })
//         .toFile(`uploads/users/${filename}`);
//       req.body.businessCardPhoto = filename;
//     }

//     next();
//   } catch (err) {
//     next(err);
//   }
// };
// upload Single Image
// exports.uploadUserImage = uploadSingleImage('personalPhoto');

// // upload imge processing
// exports.resizeImage = asyncHandler(async (req, res, next) => {
//   if (!req.files) return next();

//   // Handle multiple images
//   if (req.files.personalPhoto) {
//     const filename = `user-${uuidv4()}-${Date.now()}-personal.jpeg`;
//     await sharp(req.files.personalPhoto[0].buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toBuffer();
//     req.body.personalPhoto = req.files.personalPhoto[0].url;
//   }

//   if (req.files.idPhoto) {
//     const filename = `user-${uuidv4()}-${Date.now()}-id.jpeg`;
//     await sharp(req.files.idPhoto[0].buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toBuffer();
//     req.body.idPhoto = req.files.idPhoto[0].url;
//   }

//   if (req.files.businessCardPhoto) {
//     const filename = `user-${uuidv4()}-${Date.now()}-business.jpeg`;
//     await sharp(req.files.businessCardPhoto[0].buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toBuffer();
//     req.body.businessCardPhoto = req.files.businessCardPhoto[0].url;
//   }

//   next();
// });

// @desc  create user
// @route put /api/v1/users
// private

exports.createUser = asyncHandler(async (req, res) => {
  try {
    //   const { firstName, lastName, email, password, role, phoneNumber, address } =
    //     req.body;

    //   if (!firstName || !email) {
    //     return res
    //       .status(400)
    //       .json({ message: 'Username and Email are required' });
    //   }

    const newUser = new User(
      // firstName,
      // lastName,
      // email,
      // password,
      // role,
      // phoneNumber,
      // address,
      req.body
    );

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
  const {
    firstName,
    lastName,
    password,
    role,
    phoneNumber,
    address,
    isActive,
    departmentId,
    email,
  } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      firstName,
      lastName,
      password,
      role,
      phoneNumber,
      address,
      isActive,
      departmentId,
      email,
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
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));

    res.status(200).json({ message: 'User deleted successfully' });
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
