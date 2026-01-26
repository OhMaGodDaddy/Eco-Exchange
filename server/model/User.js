const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  
  // --- NEW ADMIN FIELD ---
  role: { 
    type: String, 
    enum: ['user', 'admin'], // We limit the options to prevent typos
    default: 'user'          // specific users must be manually promoted to admin
  }
});

module.exports = mongoose.model('User', UserSchema);