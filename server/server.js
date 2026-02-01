const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport'); 
const session = require('express-session');
const Message = require('./model/Message'); // 👈 Add this line!

// 1. IMPORT MODELS (This is the Fix!)
const User = require('./model/User'); 
const Item = require('./model/Item'); // 👈 We now use the REAL Item file!

// Import the Passport Config
require('./config/passport'); 

const app = express();
const PORT = process.env.PORT || 5000;

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


// ❌ DELETED THE DUPLICATE ITEM SCHEMA HERE
// (We are using the one imported at the top now)


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
        // The frontend now sends 'userId', so we just pass req.body!
        const itemData = {
            ...req.body,
            // We add these just in case, but userId is the important one now
            googleId: req.user.googleId,
            userName: req.user.displayName,

            userEmail: req.user.email
        };
        const newItem = new Item(itemData);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        console.error("Error saving item:", err);
        res.status(400).json({ error: err.message });
    }
});

// 🚨 UPDATED DELETE ROUTE: Now checks userId instead of googleId
app.delete('/api/items/:id', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // 👇 UPDATED: Check if the item's userId matches the logged-in user's ID
        const isOwner = item.userId === req.user._id.toString();
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

// C. ADMIN ONLY ROUTES
app.get('/api/admin/stats', isAdmin, async (req, res) => {
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

// ===========================================
// 👇 UPDATED CHAT ROUTES (Paste this over the old ones)
// ===========================================

// 1. Send a Message
app.post('/api/messages', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });

    try {
        const { receiverId, text } = req.body;
        
        // Safety Check: Ensure we have valid data
        if (!receiverId || !text) {
            return res.status(400).json({ error: "Missing receiverId or text" });
        }

        const newMessage = new Message({
            senderId: req.user._id.toString(), // 👈 Explicit conversion to String
            senderName: req.user.displayName || "Anonymous",
            receiverId: receiverId.toString(),
            text: text
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        console.error("❌ Send Message Error:", err); // This prints to Render Logs
        res.status(500).json({ error: err.message });
    }
});

// 2. Get Messages between two users
app.get('/api/messages/:friendId', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });

    try {
        const myId = req.user._id.toString();
        const friendId = req.params.friendId;

        // Log who is talking (Check your Render logs to see this!)
        console.log(`💬 Fetching chat: ${req.user.displayName} (${myId}) <-> ${friendId}`);

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: friendId },
                { senderId: friendId, receiverId: myId }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (err) {
        console.error("❌ Fetch Messages Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});