const mongoose = require('mongoose');

const specialtiesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Specialty name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Too short specialty name'],
    },
    description: {
      type: String,
      required: [true, 'Specialty description is required'],
    },
    proFileImg: {
      type: String,
    },
    departmentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Department',
      required: [true, 'Specialty must belong to a department'],
    },
  },
  { timestamps: true }
);

const Specialties = mongoose.model('Specialties', specialtiesSchema);

module.exports = Specialties;
