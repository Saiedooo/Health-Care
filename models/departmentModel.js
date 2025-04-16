const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () {
      return this.role === 'nurse';
    },
  },

  specialties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
      // require: [true, 'Should inter some of specialities'],
    },
  ],
});

module.exports = mongoose.model('Department', DepartmentSchema);
