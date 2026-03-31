const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    trim: true
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  referrer: {
    type: String,
    default: ''
  }
}, { timestamps: true });

visitSchema.index({ createdAt: -1 });
visitSchema.index({ page: 1, createdAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
