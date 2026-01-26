const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport'); 
const session = require('express-session');

// Import the Passport Config we created
require('./config/passport'); 

const app = express();
const PORT = process.env.PORT || 5000;

// 🚨 FIX 1: TRUST PROXY (MANDATORY for Render)
// Without this, Render blocks the secure cookie because it thinks it's HTTP, not HTTPS.
app.set('trust proxy', 1);

// --- MIDDLEWARE ---

// 🚨 FIX 2: VERIFY YOUR URL
const ALLOWED_ORIGIN = "https://eco-exchange-six.vercel.app"; 

// 1. CORS
app.use(cors({
    origin: [
        "http://localhost:5173", // Local
        ALLOWED_ORIGIN           // Live
    ],
    credentials: true // Crucial: allows the browser to send the cookie
}));

// 2. Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'eco-exchange-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        // 🚨 FIX 3: FORCE SECURE COOKIES
        // We hardcode these to ensure Chrome accepts the cookie from Render
        secure: true, 
        sameSite: 'none', 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true // Security best practice
    }
}));

// 4. Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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

// --- AUTH ROUTE VARIABLES ---
const CLIENT_URL = process.env.NODE_ENV === 'production' 
    ? ALLOWED_ORIGIN 
    : "http://localhost:5173";

// --- API ROUTES ---

// A. AUTHENTICATION ROUTES
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 🚨 FIX 4: SESSION SAVE (The "Race Condition" Fix)
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // We force the session to save to the database BEFORE redirecting.
        // This prevents the frontend from loading before the login is "official".
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
    // This logs on the server so you can debug in Render logs
    console.log("🔍 Checking user session:", req.user ? "Found User" : "No User");
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
    try {
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

app.delete('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
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