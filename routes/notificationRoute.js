const express = require('express');
const router = express.Router();

const user = require('../models/userModel');
const Notification = require('../models/notificationModel');
router.get('/notifications', protect, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user.id,
    read: false,
  }).sort('-createdAt');

  res.json(notifications);
});

router.put('/notifications/:id/read', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});
