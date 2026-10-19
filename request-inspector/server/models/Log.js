const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  method: { type: String, index: true },
  path: String,
  status: { type: Number, index: true },
  durationMs: Number,
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Log', logSchema);
