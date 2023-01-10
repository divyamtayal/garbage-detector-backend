const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please provide description.']
  },
  createdAt: Date,
  supportCount: {
    type: Int16Array,
    default: 0
  },
  notSupportCount: {
    type: Int16Array,
    default: 0
  }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
