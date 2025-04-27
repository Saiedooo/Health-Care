const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'username required'],
    },
    lastName: {
      type: String,
      required: [true, 'last name Required'],
    },
    email: {
      type: String,
      required: [true, 'email required'],
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    phoneNumber: String, //phone
    personalPhoto: String, // proFileImg
    password: {
      type: String,
      required: [true, 'Password required'],
      minlength: [6, 'too Short password'],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

    role: {
      type: String,
      enum: ['patient', 'nurse', 'admin'],
      default: 'patient',
    },
    idPhoto: {
      // nationalId
      type: String,
      // required: function () {
      //   return this.role === 'patient' || this.role === 'nurse';
      // },
    },
    businessCardPhoto: {
      //nursingLicense
      type: String,
      // required: function () {
      //   return this.role === 'nurse';
      // },
    },
    departmentId: {
      //departmentId
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      // required: function () {
      //   return this.role === 'nurse';
      // },
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
    },

    isActive: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: [true, 'must be add your address'],
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  },

  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
