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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () {
      return this.role === 'nurse';
    },
  },
});

module.exports = mongoose.model('Department', DepartmentSchema);
