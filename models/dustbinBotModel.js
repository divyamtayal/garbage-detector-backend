const mongoose = require('mongoose');

const dustbinBotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name for dustbin bot']
  },
  description: {
    type: String,
    required: [true, 'Please provide description.']
  },
  createdAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  dustbinStatus: [
    {
      perFilled: {
        type: Number,
        required: [true, 'Please provide percentage filled of dustbin.']
      },
      checkedAt: { type: Date, default: Date.now }
    }
  ]
});

const dustbinBot = mongoose.model('Dustbin Bot', dustbinBotSchema);

module.exports = dustbinBot;
