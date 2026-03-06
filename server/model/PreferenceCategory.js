const mongoose = require('mongoose');

const PreferenceCategorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PreferenceCategory', PreferenceCategorySchema);
