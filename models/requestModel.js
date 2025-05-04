const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (id) {
        const user = await mongoose.model('User').findById(id);
        return user && user.role === 'patient';
      },
      message: 'Patient ID must reference a valid patient user',
    },
  },
  nurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function (id) {
        if (!id) return true; // Nurse is optional
        const user = await mongoose.model('User').findById(id);
        return user && user.role === 'nurse';
      },
      message: 'Nurse ID must reference a valid nurse user',
    },
  },
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending',
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
RequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Request', RequestSchema);
