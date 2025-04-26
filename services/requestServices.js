const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');

const Request = require('../models/requestModel');

exports.getAllRequests = asyncHandler(async (req, res, next) => {
  const AllRequests = await Request.find();

  if (!AllRequests) {
    return next(new ApiError('No requests At that Time', 404));
  }
  res.json({ data: AllRequests });
});

// @creater Request

// exports.createRequest = asyncHandler(async (req, res, next) => {
//   const { patientId, departmentId, description } = req.body;

//   // البحث عن ممرض متاح في القسم المحدد
//   const nurse = await User.findOne({
//     role: 'nurse',
//     departmentId,
//     isActive: true,
//   });

//   if (!nurse) {
//     return next(new ApiError('No available nurse in this department', 404));
//   }

//   const newRequest = await Request.create({
//     patientId,
//     nurseId: nurse._id,
//     departmentId,
//     description,
//   });
//   // console.log(newRequest);
//   // تحويل كائن Mongoose إلى كائن JavaScript عادي
//   const requestObject = newRequest.toObject();

//   res.status(201).json({
//     status: 'success',
//     data: requestObject,
//   });
// });

exports.createRequest = asyncHandler(async (req, res, next) => {
  // Get the logged-in user's ID (Patient)
  const patientId = req.user._id;

  // Get nurse and description from body
  const { nurse, description } = req.body;

  // Validate nurse ID
  if (!mongoose.Types.ObjectId.isValid(nurse)) {
    return next(new ApiError('Invalid nurse ID', 400));
  }

  // Create the request
  const request = await Request.create({
    patient: patientId,
    nurse,
    description,
  });

  // Send response
  res.status(201).json({
    status: 'success',
    data: request,
  });
});

// @update Request Status

exports.updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const { status } = req.body;

  // Get the logged-in user's ID (nurse)
  const nurseId = req.user._id;

  // Find the request
  const request = await Request.findById(requestId);

  // Check if the request exists
  if (!request) {
    return next(new ApiError('Request not found', 404));
  }

  // Check if the logged-in nurse is the same nurse assigned to the request
  // if (request.nurseId.toString() !== nurseId.toString()) {
  //   return next(
  //     new ApiError('You are not authorized to update this request', 403)
  //   );
  // }

  // Update the request status
  const updatedRequest = await Request.findByIdAndUpdate(
    requestId,
    { status },
    { new: true }
  );

  // Send response
  res.status(200).json({
    status: 'success',
    data: updatedRequest,
  });
});
// @Get nurse Requests
exports.getRequestsForNurse = asyncHandler(async (req, res, next) => {
  const { nurseId } = req.params;
  const requests = await Request.find({ nurseId }).populate(
    'patientId',
    'username'
  );

  if (!requests || requests.length === 0) {
    throw new ApiError('No requests found for this nurse', 404);
  }
  res.status(201).json({
    status: 'success',
    data: requests,
  });
});

exports.deleteRequest = asyncHandler(async (req, res, next) => {
  const deleteRequest = await Request.findByIdAndDelete(req.params.requestId);

  if (!deleteRequest) {
    return next(new ApiError('No requests for this Id', 404));
  }
  res.json({ data: deleteRequest, status: 'Sucess' });
});
