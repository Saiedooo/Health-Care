const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createToken = require('../utils/createToken');
const mongoose = require('mongoose');

const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeature');
const Department = require('../models/departmentModel');
const specialties = require('../models/specialtyModel');
const aiFeatures = require('../utils/apiFeature');
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
    // 1. Build query
    const filter = {
      role: 'nurse',
      isActive: true,
      ...(req.query.specialty && { specialty: req.query.specialty }),
    };

    // 2. Execute query
    const nurses = await User.find(filter)
      .select(
        '-password -passwordResetCode -passwordResetExpires -passwordChangedAt'
      )
      .populate({
        path: 'specialty',
        select: 'name description',
      })
      .lean();

    // 3. Handle response
    res.status(200).json({
      status: 'success',
      results: nurses.length,
      data: nurses,
    });
  } catch (error) {
    console.error('Error fetching nurses:', error);
    throw new ApiError('Failed to fetch nurses', 500);
  }
});

exports.getNursesBySpecialty = asyncHandler(async (req, res, next) => {
  try {
    const { specialtyId } = req.params;
    console.log('Received specialtyId:', specialtyId);

    // 1. Check if specialty ID is valid
    if (!mongoose.Types.ObjectId.isValid(specialtyId)) {
      console.log('Invalid specialty ID format');
      return next(new ApiError('معرف التخصص غير صحيح', 400));
    }

    // 2. Check if specialty exists
    const Specialty = await specialties.findById(specialtyId);
    console.log('Found specialty:', Specialty);
    if (!Specialty) {
      console.log('Specialty not found in database');
      return next(new ApiError('لم يتم العثور على التخصص', 404));
    }

    // 3. Check all nurses first
    const allNurses = await User.find({ role: 'nurse' });
    console.log('Total nurses in system:', allNurses.length);

    // 4. Check nurses with this specialty
    const nursesWithSpecialty = await User.find({
      role: 'nurse',
      specialty: specialtyId,
    });
    console.log('Nurses with this specialty:', nursesWithSpecialty.length);

    // 5. Check active nurses with this specialty
    const activeNurses = await User.find({
      role: 'nurse',
      specialty: specialtyId,
      isActive: true,
    });
    console.log('Active nurses with this specialty:', activeNurses.length);

    // 6. Final query with all conditions
    const nurses = await User.find({
      role: 'nurse',
      specialty: specialtyId,
      isActive: true,
    })
      .select('-password -passwordResetCode -passwordResetExpires')
      .populate('specialty', 'name '); //description

    console.log('Final query results:', nurses.length);

    res.status(200).json({
      status: 'success',
      results: nurses.length,
      data: nurses,
      debug: {
        totalNurses: allNurses.length,
        nursesWithSpecialty: nursesWithSpecialty.length,
        activeNurses: activeNurses.length,
      },
    });
  } catch (error) {
    console.error('Error details:', error);
    next(new ApiError('حدث خطأ أثناء جلب الممرضات', 500));
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
}); //get nurse
// try {
//   // 1. Build the base query
//   const filter = req.filter || {};

//   // 2. Create API features instance
//   const features = new ApiFeatures(User.find(filter), req.query)
//     .filter()
//     .search()
//     .limitFields()
//     .sort();

//   // 3. Execute query for paginated results
//   const users = await features.query;

//   // 4. Get total count for pagination (without filters)
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

// exports.getNurseById = asyncHandler(async (req, res, next) => {
//   const user = await User.findById({ _id: req.params.id }, { role: 'nurse' });
//   if (!user) {
//     return next(new ApiError(`No user for this id ${req.params.id}`, 404));
//   }
//   res.status(200).json(user);
// });

// exports.getNurseById = asyncHandler(async (req, res, next) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.nurseId)) {
//     return next(new ApiError('Invalid nurse ID format', 400));
//   }

//   const nurse = await User.findOne({
//     _id: req.params.nurseId,
//     role: 'nurse',
//   })
//     .select('-password -__v -refreshToken')
//     .populate({
//       path: 'appointments',
//       select: 'date patient status',
//       match: { status: { $ne: 'cancelled' } },
//     })
//     .populate('certifications');

//   if (!nurse) {
//     return next(
//       new ApiError(`No nurse found with ID ${req.params.nurseId}`, 404)
//     );
//   }

//   res.status(200).json({
//     success: true,
//     data: nurse,
//   });
// });

exports.getNurseById = asyncHandler(async (req, res, next) => {
  const nurse = await User.findOne({
    _id: req.params.id,
    role: 'nurse',
  })
    .select('-password')
    .populate('specialty'); // <-- This line populates the specialty field

  if (!nurse) {
    return next(new ApiError(`No nurse found with ID ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: nurse,
  });
});
// Update a user by ID
exports.updateUserById = asyncHandler(async (req, res, next) => {
  // Get all fields from req.body
  const updatedFields = {
    ...req.body,
  };

  // Remove undefined fields
  Object.keys(updatedFields).forEach(
    (key) => updatedFields[key] === undefined && delete updatedFields[key]
  );

  // Log the update operation
  console.log('Updating user with fields:', updatedFields);

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updatedFields },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
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

exports.getNursesBySpecialty = asyncHandler(async (req, res, next) => {
  try {
    const { specialtyId } = req.params;

    // 1. التحقق من صحة ID التخصص
    if (!mongoose.Types.ObjectId.isValid(specialtyId)) {
      return next(new ApiError('معرف التخصص غير صحيح', 400));
    }

    // 2. التحقق من وجود التخصص في قاعدة البيانات
    const Specialty = await specialties.findById(specialtyId);
    if (!Specialty) {
      return next(new ApiError('لم يتم العثور على التخصص', 404));
    }

    // 3. جلب الممرضات
    const nurses = await User.find({
      role: 'nurse',
      specialty: specialtyId,
      isActive: true,
    })
      .select('-password -passwordResetCode -passwordResetExpires')
      .populate('specialty', 'name description');

    res.status(200).json({
      status: 'success',
      results: nurses.length,
      data: nurses,
    });
  } catch (error) {
    console.error('تفاصيل الخطأ:', error);
    next(new ApiError('حدث خطأ أثناء جلب الممرضات', 500));
  }
});
// exports.getNursesByDepartment = asyncHandler(async (req, res, next) => {
//   try {
//     const { specialtyId } = req.params;

//     // 1. Validate specialty exists
//     const specialtyExists = await specialties.exists({ _id: specialtyId });
//     if (!specialtyExists) {
//       return next(new ApiError('Specialty not found', 404));
//     }

//     // 2. Build and execute query
//     const nurses = await User.find({
//       role: 'nurse',
//       specialty: specialtyId,
//       isActive: true,
//     })
//       .select('-password -passwordResetCode -passwordResetExpires')
//       .populate('specialty', 'name description')
//       .lean();

//     // 3. Handle response
//     res.status(200).json({
//       status: 'success',
//       results: nurses.length,
//       data: nurses,
//     });
//   } catch (error) {
//     console.error('Error fetching nurses by specialty:', error);
//     next(new ApiError('Failed to fetch nurses', 500));
//   }
// });
