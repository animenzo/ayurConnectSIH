// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: { type: String, required: true }, // The Patient ID
  senderRole: { type: String, required: true }, // 'Doctor' or 'Patient'
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now } // Used to sort messages by oldest to newest
});

module.exports = mongoose.model('Message', MessageSchema);