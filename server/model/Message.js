const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false }, // 👈 This is the key part!
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);