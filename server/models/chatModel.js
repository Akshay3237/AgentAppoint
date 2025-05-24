const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  response_prompt: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
