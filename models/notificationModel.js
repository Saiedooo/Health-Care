// models/Notification.js
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['REQUEST', 'SYSTEM'], required: true },
    relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
