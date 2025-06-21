const express = require('express');
const router = express.Router();

const user = require('../models/userModel');
const Notification = require('../models/notificationModel');
const { protect } = require('../services/authServices');
// router.get('/notifications', protect, async (req, res) => {
//   try {
//     const notifications = await Notification.find({ user: req.user.id }).sort(
//       '-createdAt'
//     );
//     res.json({ notifications });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// router.put('/notifications/:id/read', protect, async (req, res) => {
//   try {
//     await Notification.findByIdAndUpdate(req.params.id, { read: true });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// Get all notifications for the logged-in user
// router.get('/notifications', protect, async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized: No user found' });
//     }
//     const notifications = await Notification.find({ user: req.user._id }).sort(
//       '-createdAt'
//     );
//     res.json({ notifications });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // Mark a notification as read
// router.put('/notifications/:id/read', protect, async (req, res) => {
//   try {
//     await Notification.findByIdAndUpdate(req.params.id, { read: true });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // (Optional) Create a test notification for the logged-in user
// router.post('/notifications/test', protect, async (req, res) => {
//   try {
//     const notif = await Notification.create({
//       user: req.user._id,
//       message: 'اختبار إشعار جديد',
//       type: 'SYSTEM',
//     });
//     res.json(notif);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// module.exports = router;

// -----------------------------------------------------

// Get all notifications for the logged-in user
router.get('/notifications', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    // FIX 1: Populate sender's data to fix 'undefined undefined' on the frontend.
    // This adds the sender's name and photo to each notification object.
    // It assumes your Notification schema has a field named 'sender' that references the 'User' model.
    // If your field is named differently (e.g., 'fromUser'), please change 'sender' below.
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'firstName lastName personalPhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// FIX 2: This route now matches the frontend's API call.
// It listens for a PATCH request to /notifications/:id to mark it as read.
// The previous route (PUT /notifications/:id/read) was causing the 404 error.
router.patch('/notifications/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id }, // Ensure user can only update their own notifications
      { read: true },
      { new: true } // Return the updated document
    );

    if (!notification) {
      return res
        .status(404)
        .json({ message: 'Notification not found or user not authorized.' });
    }

    res.status(200).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// (Optional) Create a test notification for the logged-in user
router.post('/notifications/test', protect, async (req, res) => {
  try {
    // A test notification needs a recipient and a sender
    const notif = await Notification.create({
      recipient: req.user._id,
      sender: req.user._id, // For a test, the sender can be the same user
      message: 'This is a test notification!',
      type: 'SYSTEM',
    });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// This old route is no longer needed and was causing the error.
// router.put('/notifications/:id/read', protect, ...);

module.exports = router;
