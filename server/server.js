require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport'); 
const session = require('express-session');
const MongoStore = require('connect-mongo');

// 👇 UPDATED: Import for the new SDK
const { GoogleGenAI } = require("@google/genai");

// IMPORT MODELS
const User = require('./model/User'); 
const Item = require('./model/Item'); 
const Message = require('./model/Message');

require('./config/passport'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// --- MIDDLEWARE ---
const ALLOWED_ORIGIN = "https://eco-exchange-six.vercel.app";

app.use(cors({
    origin: ALLOWED_ORIGIN, 
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'eco-exchange-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://KyleCarag:KyleCarag101@cluster0.qynunmn.mongodb.net/eco-exchange?retryWrites=true&w=majority&appName=Cluster0",
        ttl: 24 * 60 * 60 
    }),
    cookie: {
        secure: true, 
        sameSite: 'none', 
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true 
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- DATABASE ---
mongoose.connect("mongodb+srv://KyleCarag:KyleCarag101@cluster0.qynunmn.mongodb.net/eco-exchange?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- API ROUTES (Auth, Items, Messages) ---
// (Note: I've kept your existing logic exactly as is)

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect(ALLOWED_ORIGIN); 
    }
);

app.get('/api/current_user', (req, res) => {
    res.send(req.user);
});

app.get('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(ALLOWED_ORIGIN);
    });
});

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
        const newItem = new Item({
            ...req.body,
            googleId: req.user.googleId,
            userName: req.user.displayName,
            userEmail: req.user.email
        });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- MESSAGING ROUTES ---

app.get('/api/messages/unread', async (req, res) => {
    if (!req.isAuthenticated()) return res.json({ count: 0 });
    try {
        const count = await Message.countDocuments({ receiverId: req.user._id, isRead: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/messages/read/:senderId', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
        await Message.updateMany(
            { senderId: req.params.senderId, receiverId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/messages/conversations', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Please log in' });
    const myId = req.user._id.toString();
    try {
        const allMessages = await Message.find({ $or: [{ senderId: myId }, { receiverId: myId }] }).sort({ _id: -1 });
        const conversationMap = new Map();
        allMessages.forEach(msg => {
            const otherUserId = msg.senderId === myId ? msg.receiverId : msg.senderId;
            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, {
                    conversationId: otherUserId,
                    otherUser: { _id: otherUserId, username: msg.senderId !== myId ? msg.senderName : "Chat User" },
                    lastMessage: msg.text,
                    timestamp: msg._id.getTimestamp(),
                    link: `/chat/${otherUserId}` 
                });
            }
        });
        res.json(Array.from(conversationMap.values()));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/messages', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    try {
        const newMessage = new Message({
            senderId: req.user._id,
            senderName: req.user.displayName || "Anonymous",
            receiverId: req.body.receiverId,
            text: req.body.text,
            isRead: false 
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/messages/:friendId', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    try {
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: req.params.friendId },
                { senderId: req.params.friendId, receiverId: myId }
            ]
        }).sort({ _id: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// 🤖 UPDATED AI ROUTE: USING NEW GOOGLE GENAI
// ============================================ 

app.post('/api/generate-description', async (req, res) => {
    try {
        const { title, category } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ ERROR: GEMINI_API_KEY is missing.");
            return res.status(500).json({ error: "API Key missing" });
        }

        // Initialize the NEW GenAI client
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        console.log(`🤖 AI is generating content for: ${title}`);

        // Using the 2.0-flash model for better reliability
        const result = await client.models.generateContent({
            model: 'gemini-1.5-flash-002', 
            contents: [{
                role: 'user',
                parts: [{
                    text: `Write a short, engaging sales description for a second-hand item on an eco-friendly marketplace.
                    Item Title: ${title}
                    Category: ${category || "General"}
                    Keep it to 2-3 sentences. Focus on sustainability. No hashtags.`
                }]
            }]
        });

        // The text is now available directly on the result object
        const descriptionText = result.text || "No description generated.";

        res.json({ description: descriptionText });

    } catch (error) {
        console.error("❌ AI ROUTE ERROR:", error.message);
        res.status(500).json({ error: "Failed to generate description" });
    }
});

// ============================================

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});