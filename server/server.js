const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport'); 
const session = require('express-session');

// 1. IMPORT USER MODEL (Ensure the path is correct)
const User = require('./models/User'); 

// Import the Passport Config
require('./config/passport'); 

const app = express();
const PORT = process.env.PORT || 5000;

// 🚨 FIX 1: TRUST PROXY (MANDATORY for Render)
app.set('trust proxy', 1);

// --- MIDDLEWARE ---

const ALLOWED_ORIGIN = "https://eco-exchange-six.vercel.app"; 

app.use(cors({
    origin: [
        "http://localhost:5173", 
        ALLOWED_ORIGIN           
    ],
    credentials: true 
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'eco-exchange-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, 
        sameSite: 'none', 
        maxAge: 24 * 60 * 60 * 1000, 
        httpOnly: true 
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// 🛡️ ADMIN AUTH MIDDLEWARE
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: "Access Denied: Admins Only" });
};

// --- DATABASE CONNECTION ---
mongoose.connect("mongodb+srv://KyleCarag:KyleCarag101@cluster0.qynunmn.mongodb.net/eco-exchange?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- DATA MODELS ---
const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    hubLocation: { type: String, required: true },
    price: { type: Number, default: 0 },
    image: { type: String, default: '' }, 
    status: { type: String, default: 'Available' },
    createdAt: { type: Date, default: Date.now },
    googleId: { type: String }, 
    userName: { type: String }
});
const Item = mongoose.model('Item', itemSchema);

const CLIENT_URL = process.env.NODE_ENV === 'production' 
    ? ALLOWED_ORIGIN 
    : "http://localhost:5173";

// --- API ROUTES ---

// A. AUTHENTICATION ROUTES
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.redirect('/login/failed');
            }
            console.log("✅ Session saved. Redirecting to:", CLIENT_URL);
            res.redirect(CLIENT_URL);
        });
    }
);

app.get('/api/current_user', (req, res) => {
    res.send(req.user);
});

app.get('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(CLIENT_URL);
    });
});

// B. ITEM ROUTES 
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

app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/items', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    
    try {
        const itemData = {
            ...req.body,
            googleId: req.user.googleId,
            userName: req.user.displayName
        };
        const newItem = new Item(itemData);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🚨 UPDATED DELETE ROUTE: Handles both Owner and Admin
app.delete('/api/items/:id', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        const isOwner = item.googleId === req.user.googleId;
        const isSystemAdmin = req.user.role === 'admin';

        if (isOwner || isSystemAdmin) {
             await item.deleteOne();
             res.json({ message: 'Item deleted successfully' });
        } else {
            res.status(403).json({ message: "You do not have permission to delete this item" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// C. ADMIN ONLY ROUTES (Example)
app.get('/api/admin/stats', isAdmin, async (req, res) => {
    // Only admins can access this
    const totalItems = await Item.countDocuments();
    res.json({ totalItems });
});

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

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});