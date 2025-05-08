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
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort(
      '-createdAt'
    );
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark a notification as read
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// (Optional) Create a test notification for the logged-in user
router.post('/notifications/test', protect, async (req, res) => {
  try {
    const notif = await Notification.create({
      user: req.user.id,
      message: 'اختبار إشعار جديد',
      type: 'SYSTEM',
    });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
