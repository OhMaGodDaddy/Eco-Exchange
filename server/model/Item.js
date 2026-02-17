const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    hubLocation: { type: String, required: true },
    price: { type: Number, default: 0 },
    
    // 📸 The original single image (acts as the main thumbnail so old code doesn't break)
    image: { type: String, default: '' }, 
    
    // 📸 NEW: An array of strings to hold ALL images for the gallery
    images: { type: [String], default: [] }, 

    status: { type: String, default: 'Available' },
    userEmail: { type: String },
    userId: { type: String, required: true }, 
    
    // We keep these for backup/compatibility
    userName: { type: String },
    createdAt: { type: Date, default: Date.now },

    embedding: {
        type: [Number],
        required: false
    },

    lat: { type: Number, required: false },
    lng: { type: Number, required: false }
});

module.exports = mongoose.model('Item', itemSchema);