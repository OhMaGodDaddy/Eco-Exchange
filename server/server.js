require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport'); 
const session = require('express-session');
const MongoStore = require('connect-mongo');

// FOR TENSORFLOW.JS 
const tf = require('@tensorflow/tfjs'); 
const use = require('@tensorflow-models/universal-sentence-encoder');

// IMPORT GOOGLE AI LIBRARY
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


// ============================================
// 🧠 TENSORFLOW SETUP & HELPER
// ============================================
let aiModel = null;

use.load().then(model => {
    aiModel = model;
    console.log("🧠 TensorFlow Universal Sentence Encoder (Pure JS) Loaded!");
}).catch(err => console.error("❌ Failed to load AI:", err));

// Calculate how similar two items are (Returns a score from -1 to 1)
function calculateCosineSimilarity(vecA, vecB) {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
// ============================================


// --- API ROUTES (Auth) ---
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

// --- API ROUTES (Items) ---
app.get('/api/items', async (req, res) => {
    try {
        const { hub, category } = req.query;
        let query = { status: 'Available' };
        if (hub) query.hubLocation = hub;
        if (category) query.category = category;
        const items = await Item.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error("❌ CRASH IN GET /api/items:", err); // <-- THIS UNLOCKS THE LOGS
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

// 👇 UPDATED: TensorFlow Math added to Item Creation
app.post('/api/items', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    try {
        let itemEmbedding = [];
        
        // Convert the title and category into math using TF model
        if (aiModel) {
            const textToAnalyze = `${req.body.title} ${req.body.category}`;
            const embeddings = await aiModel.embed([textToAnalyze]);
            itemEmbedding = embeddings.arraySync()[0]; 
        }

        const newItem = new Item({
            ...req.body,
            googleId: req.user.googleId,
            userName: req.user.displayName,
            userEmail: req.user.email,
            embedding: itemEmbedding // Save the array of numbers
        });
        
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 👇 NEW: Recommendation Engine Route
app.get('/api/items/:id/recommendations', async (req, res) => {
    try {
        const targetItem = await Item.findById(req.params.id);
        if (!targetItem || !targetItem.embedding || targetItem.embedding.length === 0) {
            return res.status(404).json({ message: "No AI data found for this item." });
        }

        // Find all other available items that have TF embeddings
        const allItems = await Item.find({ 
            _id: { $ne: targetItem._id }, 
            status: 'Available',
            embedding: { $exists: true, $not: { $size: 0 } }
        });

        // Calculate cosine similarity score for each item
        const scoredItems = allItems.map(item => {
            const score = calculateCosineSimilarity(targetItem.embedding, item.embedding);
            return { item, score };
        });

        // Sort by highest score and return top 4
        scoredItems.sort((a, b) => b.score - a.score);
        const topRecommendations = scoredItems.slice(0, 4).map(data => data.item);

        res.json(topRecommendations);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
// 🤖 GOOGLE GENAI ROUTE: DESCRIPTION GENERATOR
// ============================================ 
app.post('/api/generate-description', async (req, res) => {
    try {
        const { title, category } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ ERROR: GEMINI_API_KEY is missing.");
            return res.status(500).json({ error: "API Key missing" });
        }

        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        console.log(`🤖 AI is generating content for: ${title}`);

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