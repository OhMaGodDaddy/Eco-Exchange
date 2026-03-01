const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },

    receiverId: { type: String, required: true },

    // ✅ NEW: tie message to an item thread
    itemId: { type: String, required: true },

    // ✅ NEW: stable grouping key (same for both directions)
    conversationKey: { type: String, required: true, index: true },

    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true } // gives createdAt/updatedAt
);

// Useful indexes
messageSchema.index({ conversationKey: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);