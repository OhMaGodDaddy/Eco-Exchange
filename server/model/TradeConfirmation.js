const mongoose = require('mongoose');

const tradeConfirmationSchema = new mongoose.Schema(
  {
    conversationKey: { type: String, required: true, unique: true, index: true },
    itemId: { type: String, required: true },
    participantIds: { type: [String], required: true },
    confirmations: { type: [String], default: [] },
    status: { type: String, enum: ['pending', 'successful', 'cancelled', 'failed'], default: 'pending' },
    confirmedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TradeConfirmation', tradeConfirmationSchema);