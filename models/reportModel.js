const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please provide description.']
  },
  createdAt: Date,
  supportCount: {
    type: Number,
    default: 0
  },
  notSupportCount: {
    type: Number,
    default: 0
  },
  location: {
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Please provide Latitude coordinates']
      },
      long: {
        type: Number,
        required: [true, 'Please provide Longitude coordinates']
      }
    },
    description: {
      type: String,
      required: [true, 'Please provide Location description']
    }
  },
  createdInfo: {
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    createdAt: Date
  },
  assignedInfo: {
    assignedTo: { type: mongoose.Schema.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    assignedAt: Date
  },
  reportResolved: {
    type: Boolean,
    default: false
  },
  images: [String]
});

reportSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'assignedInfo',
    populate: {
      path: 'assignedTo assignedBy',
      select: '-role -__v'
    }
  }).populate({
    path: 'createdInfo',
    populate: {
      path: 'createdBy',
      select: '-role -__v'
    }
  });
  next();
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
