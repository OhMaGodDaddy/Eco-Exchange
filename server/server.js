const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport'); 
const session = require('express-session');

// Import the Passport Config we created
require('./config/passport'); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---

// 1. CORS: Must allow specific origins for Cookies/Login to work
app.use(cors({
    origin: [
        "http://localhost:5173",           // Your local frontend
        "https://eco-exchange-six.vercel.app" // REPLACE THIS with your actual Vercel link!
    ],
    credentials: true // This allows the session cookie to be sent back and forth
}));

// 2. Body Parsers (Increased limit for images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Session Setup (Must be before passport.session)
app.use(session({
    secret: 'eco-exchange-secret-key', // Change this to a random string
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // True if on Render (HTTPS)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for Cross-Site (Vercel -> Render)
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// 4. Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// --- DATABASE CONNECTION ---
// Note: It is safer to put the password in a .env file, but this works for now.
mongoose.connect("mongodb+srv://KyleCarag:KyleCarag101@cluster0.qynunmn.mongodb.net/eco-exchange?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- DATA MODELS ---

// (Your Existing Item Model)
const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
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
    createdAt: { type: Date, default: Date.now },
    
    // Optional: Link item to a user
    googleId: { type: String }, 
    userName: { type: String }
});

const Item = mongoose.model('Item', itemSchema);

// --- AUTH ROUTE VARIABLES ---
// Change this to your Vercel URL when deploying!
const CLIENT_URL = process.env.NODE_ENV === 'production' 
    ? "https://eco-exchange-six.vercel.app" 
    : "http://localhost:5173";

// --- API ROUTES ---

// A. AUTHENTICATION ROUTES

// 1. Trigger Google Login
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Google Callback (Where Google sends the user back)
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to the Frontend
        res.redirect(CLIENT_URL);
    }
);

// 3. Get Current User (Frontend calls this to see who is logged in)
app.get('/api/current_user', (req, res) => {
    res.send(req.user);
});

// 4. Logout
app.get('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(CLIENT_URL);
    });
});


// B. ITEM ROUTES

// 1. GET ALL ITEMS
app.get('/api/items', async (req, res) => {
    try {
        const { hub, category } = req.query;
        let query = { status: 'Available' };
        
        if (hub) query.hubLocation = hub;
        if (category) query.category = category;
        
        const items = await Item.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET SINGLE ITEM
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. CREATE ITEM (Updated to include User Info)
app.post('/api/items', async (req, res) => {
    try {
        // Add the logged-in user's ID to the item (if they are logged in)
        const itemData = {
            ...req.body,
            googleId: req.user ? req.user.googleId : undefined,
            userName: req.user ? req.user.displayName : undefined
        };

        const newItem = new Item(itemData);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. DELETE ITEM (Protected)
app.delete('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        
        // Check permissions: Must own the item OR be an admin
        if(req.user && (item.googleId === req.user.googleId || req.user.role === 'admin')) {
             await item.deleteOne();
             res.json({ message: 'Item deleted' });
        } else {
            res.status(403).json({ message: "Unauthorized" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. GET HUBS
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