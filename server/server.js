const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport'); 
const session = require('express-session');
const MongoStore = require('connect-mongo');

// 👇 1. IMPORT GOOGLE AI LIBRARY
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. IMPORT MODELS
const User = require('./model/User'); 
const Item = require('./model/Item'); 
const Message = require('./model/Message');

require('./config/passport'); 

const app = express();
const PORT = process.env.PORT || 5000;

// ⚠️ CRITICAL: Must be "1" for Render/Vercel cookies to work
app.set('trust proxy', 1);

// --- MIDDLEWARE ---
// ⚠️ HARDCODED ORIGIN: To rule out any matching errors
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
        secure: true, // REQUIRED for Vercel (HTTPS)
        sameSite: 'none', // REQUIRED for Cross-Site (Vercel -> Render)
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

// --- API ROUTES ---

// 1. AUTH ROUTES
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        console.log("✅ Google Auth Success. Redirecting to Client...");
        res.redirect(ALLOWED_ORIGIN); // Redirect straight to Vercel
    }
);

app.get('/api/current_user', (req, res) => {
    console.log("🔍 Checking Session. User:", req.user ? req.user.displayName : "No User Found");
    res.send(req.user);
});

app.get('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(ALLOWED_ORIGIN);
    });
});

// 2. ITEM ROUTES 
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
            userName: req.user.displayName,
            userEmail: req.user.email
        };
        const newItem = new Item(itemData);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. MESSAGING ROUTES (Inbox & Chat)

app.get('/api/messages/unread', async (req, res) => {
    if (!req.isAuthenticated()) return res.json({ count: 0 });
    try {
        const myId = req.user._id.toString();
        const count = await Message.countDocuments({ 
            receiverId: myId, 
            isRead: false 
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/messages/read/:senderId', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
        const myId = req.user._id.toString();
        const otherId = req.params.senderId;
        await Message.updateMany(
            { senderId: otherId, receiverId: myId, isRead: false },
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
        const allMessages = await Message.find({
            $or: [{ senderId: myId }, { receiverId: myId }]
        }).sort({ _id: -1 });

        const conversationMap = new Map();
        allMessages.forEach(msg => {
            const otherUserId = msg.senderId === myId ? msg.receiverId : msg.senderId;
            let otherUserName = "Chat User"; 
            if (msg.senderId !== myId) otherUserName = msg.senderName; 

            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, {
                    conversationId: otherUserId,
                    otherUser: { _id: otherUserId, username: otherUserName },
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
        const { receiverId, text } = req.body;
        const newMessage = new Message({
            senderId: req.user._id.toString(),
            senderName: req.user.displayName || "Anonymous",
            receiverId: receiverId.toString(),
            text: text,
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
        const myId = req.user._id.toString();
        const friendId = req.params.friendId;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: friendId },
                { senderId: friendId, receiverId: myId }
            ]
        }).sort({ _id: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// 🤖 NEW AI ROUTE: GENERATE DESCRIPTION
// ============================================ 

// ⚠️ PASTE YOUR API KEY HERE
// Use the safe key from Render's Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-description', async (req, res) => {
    try {
        const { title, category } = req.body;
        
        // 1. Initialize Model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });        
        // 2. Create the Prompt
        const prompt = `Write a short, engaging, and professional sales description for a second-hand item being sold on an eco-friendly marketplace.
        
        Item Title: ${title}
        Category: ${category || "General"}
        
        The description should be 2-3 sentences long. Mention that it is a sustainable choice. Do not use hashtags.`;

        // 3. Generate Content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Send back to Frontend
        res.json({ description: text });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate description" });
    }
});

// ============================================


app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});