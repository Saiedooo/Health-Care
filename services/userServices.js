const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createToken = require('../utils/createToken');

const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeature');
const Department = require('../models/departmentModel');
const specialties = require('../models/specialtyModel');
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

// get all nurses Account for Specefic Department

// controllers/nurseController.js
exports.getAllNurses = asyncHandler(async (req, res, next) => {
  try {
    // 1. Build query with proper filters
    const filter = {
      role: 'nurse',
      isActive: true,
      ...(req.query.department && { departmentId: req.query.department }),
    };

    // 2. Execute query with proper error handling
    const nurses = await User.find(filter)
      .select('-password -passwordResetCode -passwordResetExpires')
      .populate({
        path: 'departmentId',
        select: 'name -_id',
      })
      .populate({
        path: 'specialties',
        select: 'name -_id',
      })
      .lean(); // Convert to plain JS objects

    if (!nurses || !nurses.length) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: [],
      });
    }

    console.log(nurses);
    // 3. Successful response
    res.status(200).json({
      status: 'success',
      results: nurses.length,
      data: nurses,
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new ApiError('Failed to fetch nurses', 500);
  }
});
exports.getNursesByDepartment = asyncHandler(async (req, res, next) => {
  const { departmentId } = req.params;

  // 1. Validate department exists first
  const department = await Department.findById(departmentId);
  if (!department) {
    return res.status(404).json({
      status: 'fail',
      message: 'Department not found',
    });
  }

  try {
    // 2. Build base query
    const query = {
      role: 'nurse',
      departmentId: departmentId,
      isActive: true,
    };

    // 3. Execute query with API features
    const nursesQuery = User.find(query).select(
      '-password -passwordResetCode -passwordResetExpires'
    );

    const apiFeatures = new ApiFeatures(nursesQuery, req.query)
      .filter()
      .search()
      .limitFields()
      .sort();

    // 4. Execute the final query
    const nurses = await apiFeatures.query;

    // 5. Handle empty results
    if (!nurses || nurses.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        message: 'No nurses found in this department',
        data: [],
      });
    }

    // 6. Successful response
    res.status(200).json({
      status: 'success',
      results: nurses.length,
      department: department.name,
      data: {
        nurses,
        // Include pagination if available
        pagination: apiFeatures.paginationResult,
      },
    });
  } catch (err) {
    // Handle any unexpected errors
    console.error('Error fetching nurses:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err : undefined,
    });
  }
});

exports.createUser = asyncHandler(async (req, res, next) => {
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
exports.getUsers = asyncHandler(async (req, res, next) => {
  try {
    // 1. Execute the query
    const users = await User.find().select('-password'); // Exclude sensitive fields

    // 2. Handle empty results
    if (!users || users.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: [],
      });
    }

    // 3. Send successful response
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users,
    });
  } catch (error) {
    // 4. Handle errors properly
    console.error('Error fetching users:', error);
    next(new ApiError('Failed to fetch users. Please try again later.', 500));
  }
});
//   try {
//     // 1. Build the base query
//     const filter = req.filter || {};

//     // 2. Create API features instance
//     const features = new ApiFeatures(User.find(filter), req.query)
//       .filter()
//       .search()
//       .limitFields()
//       .sort();

//     // 3. Execute query for paginated results
//     const users = await features.query;

//     // 4. Get total count for pagination (without filters)
//     const totalCount = await User.countDocuments(filter);

//     // 5. Apply pagination after getting results
//     features.paginate(totalCount);

//     // 6. Handle empty results
//     if (!users.length) {
//       return res.status(200).json({
//         status: 'success',
//         results: 0,
//         data: [],
//       });
//     }

//     // 7. Send response
//     res.status(200).json({
//       status: 'success',
//       results: users.length,
//       total: totalCount,
//       data: users,
//     });
//   } catch (error) {
//     next(new ApiError('Failed to fetch users', 500));
//   }
// });

// Get a single user by ID
exports.getUserbyId = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(200).json(user);
});

exports.getNurseById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id, { role: 'nurse' });
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(200).json(user);
});

// Update a user by ID
exports.updateUserById = asyncHandler(async (req, res, next) => {
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
exports.deleteUserById = asyncHandler(async (req, res, next) => {
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
