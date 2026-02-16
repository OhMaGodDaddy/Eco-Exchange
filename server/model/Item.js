const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    hubLocation: { type: String, required: true },
    price: { type: Number, default: 0 },
    image: { type: String, default: '' },
    status: { type: String, default: 'Available' },
    userEmail: { type: String },
    // 👇 THIS IS THE CRITICAL LINE THAT WAS MISSING!
    userId: { type: String, required: true }, 
    
    // We keep these for backup/compatibility
    userName: { type: String },
    createdAt: { type: Date, default: Date.now },



    embedding: {
        type: [Number], // This tells Mongo to expect an array of numbers
        required: false

    }
});

module.exports = mongoose.model('Item', itemSchema);