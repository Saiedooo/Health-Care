const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const createToken = require('../utils/createToken');

const User = require('../models/userModel');

// @desc  get UnAcctive users
// @route put /api/v1/activation/pendingAccounts
// private

exports.getPendingAccounts = asyncHandler(async (req, res, next) => {
  const pendingAccounts = await User.find({ isActive: false });

  if (pendingAccounts.length === 0) {
    return next(new ApiError('There are no pending accounts', 404));
  }

  res.status(200).json({
    status: 'success',
    results: pendingAccounts.length,
    data: pendingAccounts,
  });
});

// @desc  get UnAcctive users
// @route put /api/v1/activate-account/:id
// private

// تفعيل حساب مستخدم (لأدمن فقط)
exports.activeAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  // Generate Token
  const token = createToken(user._id);

  res.status(200).json({
    message: 'Account activated successfully',
    data: user,
    token,
  });
});
