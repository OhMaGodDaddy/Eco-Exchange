const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());


// Increase limit to 50mb to allow image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE CONNECTION ---
// (Your original connection string)
mongoose.connect("mongodb+srv://KyleCarag:KyleCarag101@cluster0.qynunmn.mongodb.net/eco-exchange?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- DATA MODEL (Updated) ---
const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    
    // Updated with specific lists to match your frontend dropdowns
    category: { 
        type: String, 
        required: true,
        enum: ['Electronics', 'Clothing', 'Books', 'Furniture', 'Sports', 'Decor', 'Kitchen', 'Other'] 
    },
    condition: { 
        type: String, 
        required: true,
        enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'] 
    },
    hubLocation: { type: String, required: true },
    
    price: { type: Number, default: 0 },
    image: { type: String, default: '' }, 
    status: { type: String, default: 'Available' },
    createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// --- API ROUTES ---

// 1. GET ALL ITEMS (With Filtering)
app.get('/api/items', async (req, res) => {
    try {
        const { hub, category } = req.query;
        let query = { status: 'Available' }; // Only show available items
        
        if (hub) query.hubLocation = hub;
        if (category) query.category = category;
        
        const items = await Item.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET SINGLE ITEM (New! For Item Detail Page)
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. CREATE ITEM
app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. GET HUBS (Optional Helper)
app.get('/api/hubs', (req, res) => {
    const hubs = [
        { id: 'science', name: 'Science Block', type: 'Campus' },
        { id: 'dorm-a', name: 'Student Dorm A', type: 'Housing' },
        { id: 'cafeteria', name: 'Main Cafeteria', type: 'Social' },
        { id: 'library', name: 'Central Library', type: 'Academic' },
        { id: 'tech-park', name: 'Tech Park Area', type: 'Public' }
    ];
    res.json(hubs);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});