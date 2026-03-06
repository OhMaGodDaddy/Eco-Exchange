const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String },
  preferences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PreferenceCategory' }],
  preferenceSelectionCompleted: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  successfulTransactionPoints: { type: Number, default: 0 },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

module.exports = mongoose.model('User', UserSchema);