const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  messages: {
    type: [messageSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
