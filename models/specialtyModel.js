const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  personalPhoto: {
    type: String,
  },
});

const Specialty = mongoose.model('Specialty', specialtySchema);
module.exports = Specialty;
