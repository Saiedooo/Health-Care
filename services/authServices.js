const crypto = require('crypto');
require('dotenv').config();
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');
const multer = require('multer');
const { put } = require('@vercel/blob');
const sharp = require('sharp');
const createToken = require('../utils/createToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { uploadSingleImage } = require('../middleware/uploadImageMiddleware');

const User = require('../models/userModel');

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

// const sharp = require('sharp');
// const { v4: uuidv4 } = require('uuid');
// const ApiError = require('../utils/apiError');

// Configure Multer with memory storage
// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image')) {
//       cb(null, true);
//     } else {
//       cb(new ApiError('Only image files are allowed!', 400), false);
//     }
//   },
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// });

// // Generic image processing and upload function
// const processAndUploadImage = async (file, folder = 'users') => {
//   try {
//     // Generate unique filename
//     const ext = file.mimetype.split('/')[1];
//     const filename = `${folder}/${uuidv4()}-${Date.now()}.${ext}`;

//     // Process image with Sharp
//     const processedBuffer = await sharp(file.buffer)
//       .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
//       .toFormat('jpeg')
//       .jpeg({
//         quality: 80,
//         mozjpeg: true,
//       })
//       .toBuffer();

//     // Upload to Vercel Blob
//     const { url } = await put(filename, processedBuffer, {
//       access: 'public',
//       contentType: `image/jpeg`,
//     });

//     return url;
//   } catch (error) {
//     throw new ApiError(`Image processing failed: ${error.message}`, 500);
//   }
// };

// // Single image upload middleware
// exports.uploadSingleImage = (fieldName) => {
//   return (req, res, next) => {
//     upload.single(fieldName)(req, res, async (err) => {
//       try {
//         if (err) throw new ApiError(err.message, 400);
//         if (!req.file) throw new ApiError(`No ${fieldName} uploaded`, 400);

//         req.body[fieldName] = await processAndUploadImage(req.file);
//         next();
//       } catch (error) {
//         next(error);
//       }
//     });
//   };
// };

// // Multiple images upload middleware
// exports.uploadMixOfImages = (fields) => {
//   return (req, res, next) => {
//     upload.fields(fields)(req, res, async (err) => {
//       try {
//         if (err) throw new ApiError(err.message, 400);
//         if (!req.files) throw new ApiError('No files uploaded', 400);

//         await Promise.all(
//           Object.entries(req.files).map(async ([fieldName, files]) => {
//             req.body[fieldName] = await processAndUploadImage(files[0]);
//           })
//         );

//         next();
//       } catch (error) {
//         next(error);
//       }
//     });
//   };
// };

// // Specialized user images upload
// exports.uploadUserImages = () => {
//   return exports.uploadMixOfImages([
//     { name: 'personalPhoto', maxCount: 1 },
//     { name: 'idPhoto', maxCount: 1 },
//     { name: 'businessCardPhoto', maxCount: 1 },
//   ]);
// };

// // upload Single Image
// exports.uploadUserImage = uploadSingleImage('personalPhoto');

// // // upload imge processing
// exports.resizeImage = asyncHandler(async (req, res, next) => {
//   if (!req.files) return next();

//   // Handle multiple images
//   if (req.files.personalPhoto) {
//     await sharp(req.files.personalPhoto[0].buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toBuffer();
//     req.body.personalPhoto = req.files.personalPhoto[0].url;
//   }

//   if (req.files.idPhoto) {
//     await sharp(req.files.idPhoto[0].buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toBuffer();
//     req.body.idPhoto = req.files.idPhoto[0].url;
//   }

//   if (req.files.businessCardPhoto) {
//     await sharp(req.files.businessCardPhoto[0].buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toBuffer();
//     req.body.businessCardPhoto = req.files.businessCardPhoto[0].url;
//   }

//   next();
// });

// @desc Signup
// @route Post /api/v1/auth/signup
// @acces public

// exports.signup = asyncHandler(async (req, res, next) => {
//   // create User
//   const user = await User.create(req.body);
//   // generate Token
//   const token = createToken(user._id);

//   res.status(201).json({ data: user, token });
// });

exports.nurseSignup = asyncHandler(async (req, res, next) => {
  // create User
  const user = await User.create(req.body);
  // generate Token
  const token = createToken(user._id);

  res.status(201).json({ data: user, token });
});

exports.patientSignup = asyncHandler(async (req, res, next) => {
  // create User
  const user = await User.create(req.body);
  // generate Token
  const token = createToken(user._id);

  res.status(201).json({ data: user, token });
});
// @desc Login
// @route Post /api/v1/auth/login
// @acces public
exports.login = asyncHandler(async (req, res, next) => {
  // Check if user exists & check if password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect Email Or password', 401));
  }

  // Check if the account is active
  if (!user.isActive) {
    return next(
      new ApiError(
        'Account is not active. Wait for admin approval. Please contact the admin.',
        403
      )
    );
  }

  // Generate Token
  const token = createToken(user._id);

  // Send Response
  res.status(200).json({ data: user, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  // 1) cheeck if token exist if exist hold it
  //console.log(req.headers);  // headers in hidden postman
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
    // console.log(token);
  }
  if (!token) {
    return next(
      new ApiError(
        'you are not login , Please login to get access this route  ',
        401
      )
    );
  }

  // 2)verify token (no change happen ,expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); //return decoded cl decded
  //   console.log(decoded);

  // 3)check if user exists

  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError('the user that belong to token does not longer Exist', 401)
    );
  }

  // 4)check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getDate() / 1000,
      10
    );
    if (passwordChangedTimestamp > decoded.iat) {
      return next(
        new ApiError('User recently changed password plz login again', 401)
      );
    }
  }
  req.user = currentUser;
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: No user found' });
  }
  next();
});

// @desc authorization
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new ApiError('You are not allowed to access this route', 403));
    }
    next();
  });

// @desc Forget Password
// @route Post /api/v1/auth/forgotPassword
// @acces public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save({ validateBeforeSave: false });

  // 3) Send the reset code via email
  const message = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <div style="text-align: center; padding: 20px; background-color: #f8f8f8;">
      <img src="https://imgs.search.brave.com/3TnUO9ZctY1iDFo9xGRbGODzSap1Axe3tMGAzVc6MNU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzcxLzU1LzQx/LzM2MF9GXzM3MTU1/NDE3MV9wcjlCWnBV/c3BWZTdmQ1g5aVlE/NDRYVnBLbVpqTk93/Mi5qcGc" alt="Nurse Care Logo" style="width: 150px;">
    </div>
    <div style="padding: 20px;">
      <h2>Password Reset Request</h2>
      <p style="font-size: 18px; text-align: center; margin: 20px 0;"> Hi ${user.firstName} ${user.lastName},</p>
      <p style="font-size: 18px; text-align: center; margin: 20px 0;"> We received a request to reset the password for your Nurse Care account. Use the code below to complete the process:</p>
      <p style="font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 2px;">${resetCode}</p>
      <p style="font-size: 18px; text-align: center; margin: 20px 0;"> If you did not request a password reset, please ignore this email. This code will expire in 10 minutes.</p>
      <p style="font-size: 18px; text-align: center; margin: 20px 0;"> Thanks for helping us keep your account secure.</p>
      <p style="font-size: 18px; text-align: center; margin: 20px 0;"> <br>The Nurse Care Team</p>
    </div>
    <div style="text-align: center; padding: 10px; font-size: 15px; color: #777; background-color: #f8f8f8;">
      <p>&copy; Nurse Care. All rights reserved.</p>
    </div>
  </div>
`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset code (valid for 10 min)',
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ApiError('There is an error in sending email', 500));
  }

  res
    .status(200)
    .json({ status: 'Success', message: 'Reset code sent to email' });
});

// @desc verify Password Reset code
// @route Post /api/v1/auth/verifyResetCode
// @acces public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const hashshedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashshedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError('Reset code invalid or expired'));
  }
  // send response
  user.passwordResetVerified = true;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'Succes',
  });
});

// @desc Reset Password
// @route Post /api/v1/auth/resetPassword
// @acces public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user for this email ${req.body.email}`, 404)
    );
  }
  // check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError('there is no user reset code not verified ', 404));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save({ validateBeforeSave: false });

  // 3) should generate new token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
