const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Books', 'Furniture', 'Plants', 'Sports', 'Decor', 'Kitchen', 'Other']
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  price: {
    type: Number,
    default: 0
  },
  hubLocation: {
    type: String,
    required: true
  },
  image: {        // 👈 Changed from imageUrl to image to match your frontend
    type: String, 
    default: ''
  },
  userId: {       // 👈 NEW FIELD: This saves who posted the item!
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', ItemSchema);