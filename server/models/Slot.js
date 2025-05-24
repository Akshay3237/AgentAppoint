const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  providerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be null for available slot
  },
  startingTime: {
    type: String,
    required: true
  },
  endingTime: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  purpose: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);
