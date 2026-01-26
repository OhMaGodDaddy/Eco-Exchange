const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  
  // --- NEW FIELD ---
  role: { 
    type: String, 
    enum: ['user', 'admin'], // Can only be these two
    default: 'user'          // Everyone starts as a regular user
  }
});

module.exports = mongoose.model('User', UserSchema);