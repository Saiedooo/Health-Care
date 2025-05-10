const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');

const Request = require('../models/requestModel');
const Notification = require('../models/notificationModel');

// Only patients can see their sent requests
// exports.sentNotifi = async (req, res) => {
//   try {
//     if (req.user.role !== 'patient') {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     // For patients: show requests they've sent
//     const requests = await Request.find({ patient: req.user._id }).populate(
//       'nurse'
//     );
//     res.json({ data: requests });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// Only nurses can accept/reject requests
exports.requestAction = async (req, res) => {
  try {
    const { id, action } = req.params;
    if (req.user.role !== 'nurse') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const request = await Request.findById(id).populate('patient');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.nurse.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your request' });
    }
    if (action === 'Approved') request.status = 'Approved';
    else if (action === 'Rejected') request.status = 'Rejected';
    else return res.status(400).json({ message: 'Invalid action' });
    await request.save();

    // Notify the patient if rejected
    if (action === 'Rejected') {
      const io = req.app.get('io');
      if (io) {
        io.to(request.patient._id.toString()).emit('request_rejected', {
          requestId: request._id,
          message: 'تم رفض طلبك من قبل الممرضة',
        });
      }
    }

    res.json({ message: 'Request updated', data: request });

    // After approving/rejecting a request
    await Notification.create({
      user: patientId, // the patient who should receive the notification
      message:
        " تم ${action === 'Approved' ? 'قبول' : 'رفض'} طلبك من قبل الممرضة",
      type: 'REQUEST',
      relatedRequest: request._id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// exports.recievedRequests = async (req, res) => {
//   try {
//     if (req.user.role !== 'patient') {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     const requests = await Request.find({ patient: req.user._id })
//       .populate('patient', 'firstName lastName personalPhoto')
//       .sort({ createdAt: -1 });
//     res.json({ data: requests });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// 😂😂😁😀

// For patients: show requests they've sent
// exports.sentNotifi = async (req, res) => {
//   try {
//     if (req.user.role !== 'patient') {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     const requests = await Request.find({ patient: req.user._id }).populate(
//       'nurse'
//     );
//     res.json({ data: requests });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // For nurses: show requests they've received
// exports.recievedRequests = async (req, res) => {
//   try {
//     if (req.user.role !== 'nurse') {
//       // <-- FIXED THIS LINE
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     const requests = await Request.find({ nurse: req.user._id }) // <-- FIXED THIS LINE
//       .populate('patient', 'firstName lastName personalPhoto')
//       .sort({ createdAt: -1 });
//     res.json({ data: requests });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// 😁😁😀😀

exports.sentNotifi = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const requests = await Request.find({ patient: req.user._id })
      .populate('nurse', 'firstName lastName personalPhoto')
      .sort({ createdAt: -1 });
    res.json({ data: requests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// For nurses: show requests they've received
exports.recievedRequests = async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'nurse') {
      // For nurses: show requests they've received
      requests = await Request.find({ nurse: req.user._id })
        .populate('patient', 'firstName lastName personalPhoto')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'patient') {
      // For patients: show requests they've received (if any logic for that)
      requests = await Request.find({ patient: req.user._id })
        .populate('nurse', 'firstName lastName personalPhoto')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ data: requests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// 😀😀😀

// exports.recievedRequestsPatients = async (req, res) => {
//   try {
//     if (req.user.role !== 'patient') {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     const requests = await Request.find({ patient: req.user._id })
//       .populate('patient', 'firstName lastName personalPhoto')
//       .sort({ createdAt: -1 });
//     res.json({ data: requests });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.recievedRequestsNurses = async (req, res) => {
//   try {
//     if (req.user.role !== 'nurse') {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     const requests = await Request.find({ patient: req.user._id })
//       .populate('patient', 'firstName lastName personalPhoto')
//       .sort({ createdAt: -1 });
//     res.json({ data: requests });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

exports.getAllRequests = asyncHandler(async (req, res, next) => {
  const AllRequests = await Request.find();

  if (!AllRequests) {
    return next(new ApiError('No requests At that Time', 404));
  }
  res.json({ data: AllRequests });
});

// @creater Request

exports.createRequest = async (req, res) => {
  try {
    const { description, nurseId } = req.body;

    // إنشاء الطلب
    const request = await Request.create({
      patient: req.user._id,
      description,
      nurse: nurseId || null,
    });

    // إذا تم تحديد ممرض معين
    if (nurseId) {
      const nurse = await User.findById(nurseId);
      if (!nurse || nurse.role !== 'nurse') {
        return res.status(400).json({ error: 'Invalid nurse ID' });
      }

      // إرسال إشعار للممرض المحدد
      if (req.app.locals.activeNurses.has(nurseId)) {
        const ws = req.app.locals.activeNurses.get(nurseId);
        ws.send(
          JSON.stringify({
            type: 'NEW_REQUEST',
            data: {
              requestId: request._id,
              patientName: `${req.user.firstName} ${req.user.lastName}`,
              description: request.description,
              createdAt: request.createdAt,
            },
          })
        );
      }
    } else {
      // إرسال إشعار لجميع الممرضين (إذا لم يتم تحديد ممرض معين)
      req.app.locals.activeNurses.forEach((ws, id) => {
        ws.send(
          JSON.stringify({
            type: 'NEW_GENERAL_REQUEST',
            data: {
              requestId: request._id,
              patientName: `${req.user.firstName} ${req.user.lastName}`,
              description: request.description,
              createdAt: request.createdAt,
            },
          })
        );
      });
    }

    res.status(201).json(request);

    // After creating a request
    await Notification.create({
      user: nurseId, // the nurse who should receive the notification
      message: `طلب جديد من المريض ${req.user.firstName} ${req.user.lastName}`,
      type: 'REQUEST',
      relatedRequest: request._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

// exports.createRequest = asyncHandler(async (req, res, next) => {
//   // Get the logged-in user's ID (Patient)
//   const patientId = req.user._id;

//   // Get nurse and description from body
//   const { nurse, description } = req.body;

//   // Validate nurse ID
//   if (!mongoose.Types.ObjectId.isValid(nurse)) {
//     return next(new ApiError('Invalid nurse ID', 400));
//   }

//   // Create the request
//   const request = await Request.create({
//     patient: patientId,
//     nurse,
//     description,
//   });

//   // Send response
//   res.status(201).json({
//     status: 'success',
//     data: request,
//   });
// });

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
