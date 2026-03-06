const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterUserId: { type: String, required: true, index: true },
    reportedItemId: { type: String, default: null, index: true },
    reportedUserId: { type: String, default: null, index: true },
    reason: {
      type: String,
      enum: ['spam', 'fake listing', 'inappropriate content', 'harassment', 'suspicious behavior', 'other'],
      required: true,
    },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending', index: true },
  },
  { timestamps: true }
);

reportSchema.index({ reporterUserId: 1, reportedItemId: 1 }, { unique: true, partialFilterExpression: { reportedItemId: { $type: 'string' } } });

module.exports = mongoose.model('Report', reportSchema);