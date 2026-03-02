require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// FOR TENSORFLOW.JS
const tf = require("@tensorflow/tfjs");
const use = require("@tensorflow-models/universal-sentence-encoder");

// IMPORT GOOGLE AI LIBRARY
const { GoogleGenAI } = require("@google/genai");

// IMPORT MODELS
const User = require("./model/User");
const Item = require("./model/Item");
const Message = require("./model/Message");

require("./config/passport");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB URI handling: prefer explicit env var; fall back to local DB in dev
const DEFAULT_LOCAL_MONGO = "mongodb://127.0.0.1:27017/eco-exchange";
const MONGO_URI = process.env.MONGO_URI || (process.env.NODE_ENV === "production" ? null : DEFAULT_LOCAL_MONGO);

function isValidMongoUri(uri) {
  return typeof uri === "string" && /^mongodb(\+srv)?:\/\//.test(uri);
}

if (!isValidMongoUri(MONGO_URI)) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      '❌ Invalid or missing MONGO_URI. Set `MONGO_URI` to a valid MongoDB connection string starting with "mongodb://" or "mongodb+srv://".'
    );
    process.exit(1);
  } else {
    console.warn(
      `⚠️ MONGO_URI missing or invalid. Falling back to local MongoDB: ${DEFAULT_LOCAL_MONGO}`
    );
  }
}

/**
 * ✅ Conversation key includes BOTH users + itemId
 * - If itemId is missing, treat it as "general"
 */
function makeConversationKey(userAId, userBId, itemId) {
  const [a, b] = [String(userAId), String(userBId)].sort();
  const it = itemId ? String(itemId) : "general";
  return `${a}_${b}_${it}`;
}

/**
 * ✅ Use your existing Message schema `timestamp`
 * fallback to _id timestamp just in case
 */
function getMsgTime(msg) {
  return msg.timestamp || (msg._id ? msg._id.getTimestamp() : new Date(0));
}

app.set("trust proxy", 1);

// --- MIDDLEWARE ---
const ALLOWED_ORIGIN = "https://eco-exchange-six.vercel.app";

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "eco-exchange-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MONGO_URI
      ? MongoStore.create({
          mongoUrl: MONGO_URI,
          ttl: 24 * 60 * 60,
        })
      : undefined,
    cookie: {
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// --- DATABASE ---
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log("✅ MongoDB Connected Successfully");
      try {
        // Ensure indexes to avoid large in-memory sorts on `createdAt`
        await Item.collection.createIndex({ createdAt: -1 });
        await Item.collection.createIndex({ status: 1 });
        await Item.collection.createIndex({ hubLocation: 1 });
        await Item.collection.createIndex({ category: 1 });
        console.log("✅ Ensured indexes on items collection");
      } catch (ixErr) {
        console.warn("⚠️ Failed to create indexes on items collection:", ixErr && ixErr.message ? ixErr.message : ixErr);
      }
    })
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));
} else {
  console.warn("❌ Skipping MongoDB connection: MONGO_URI not set (production requires a valid MONGO_URI).");
}

// ============================================
// 🧠 TENSORFLOW SETUP & HELPER
// ============================================
let aiModel = null;

use
  .load()
  .then((model) => {
    aiModel = model;
    console.log("🧠 TensorFlow Universal Sentence Encoder (Pure JS) Loaded!");
  })
  .catch((err) => console.error("❌ Failed to load AI:", err));

function calculateCosineSimilarity(vecA, vecB) {
  let dotProduct = 0,
    normA = 0,
    normB = 0;
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
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(ALLOWED_ORIGIN);
  }
);

app.get("/api/current_user", (req, res) => {
  res.send(req.user);
});

app.get("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(ALLOWED_ORIGIN);
  });
});

// --- API ROUTES (Items) ---
app.get("/api/items", async (req, res) => {
  try {
    // Log incoming query for debugging on deployed environments
    console.log("/api/items called with query:", req.query);

    // Defensive parsing: coerce and validate query params
    const hub = req.query && typeof req.query.hub === "string" ? req.query.hub : undefined;
    let category = req.query && typeof req.query.category === "string" ? req.query.category : undefined;
    if (category && category.trim().length === 0) category = undefined;
    // normalize display labels like "All Items"
    if (category && category.toLowerCase().includes("all")) category = undefined;

    const rawPage = req.query && req.query.page !== undefined ? String(req.query.page) : "1";
    const pageNum = Number.parseInt(rawPage, 10);
    const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

    const query = { status: "Available" };
    if (hub) query.hubLocation = hub;
    if (category) query.category = category;

    const limit = 20;
    const skip = (page - 1) * limit;

    // Use aggregation with allowDiskUse to opt-in to external sorting when needed
    const match = {};
    if (hub) match.hubLocation = hub;
    if (category) match.category = category;
    // Primary: show only Available items
    match.status = "Available";

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $project: { embedding: 0 } },
      { $skip: skip },
      { $limit: limit },
    ];

    let items = await Item.aggregate(pipeline).allowDiskUse(true);

    // Compatibility fallback: old records may not have `status` set
    if ((!items || items.length === 0) && page === 1) {
      const fallbackMatch = {};
      if (hub) fallbackMatch.hubLocation = hub;
      if (category) fallbackMatch.category = category;

      const fallbackPipeline = [
        { $match: fallbackMatch },
        { $sort: { createdAt: -1 } },
        { $project: { embedding: 0 } },
        { $limit: limit },
      ];

      const fallback = await Item.aggregate(fallbackPipeline).allowDiskUse(true);
      return res.json(fallback);
    }

    res.json(items);
  } catch (err) {
    console.error("❌ CRASH IN GET /api/items:", err && err.stack ? err.stack : err);
    // Include original query in error response for remote debugging (non-sensitive)
    res.status(500).json({ error: err.message || "Server error", query: req.query });
  }
});

app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/items", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
  try {
    let itemEmbedding = [];

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
      embedding: itemEmbedding,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/items/:id/recommendations", async (req, res) => {
  try {
    const targetItem = await Item.findById(req.params.id);
    if (!targetItem || !targetItem.embedding || targetItem.embedding.length === 0) {
      return res.status(404).json({ message: "No AI data found for this item." });
    }

    const allItems = await Item.find({
      _id: { $ne: targetItem._id },
      status: "Available",
      embedding: { $exists: true, $not: { $size: 0 } },
    });

    const scoredItems = allItems.map((item) => {
      const score = calculateCosineSimilarity(targetItem.embedding, item.embedding);
      return { item, score };
    });

    scoredItems.sort((a, b) => b.score - a.score);
    const topRecommendations = scoredItems.slice(0, 4).map((data) => data.item);

    res.json(topRecommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MESSAGING ROUTES ---
app.get("/api/messages/unread", async (req, res) => {
  if (!req.isAuthenticated()) return res.json({ count: 0 });
  try {
    const count = await Message.countDocuments({
      receiverId: String(req.user._id),
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/messages/read/:senderId", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  try {
    await Message.updateMany(
      {
        senderId: String(req.params.senderId),
        receiverId: String(req.user._id),
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ CONVERSATIONS LIST
 * Groups by conversationKey (users + itemId)
 */
app.get("/api/messages/conversations", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Please log in" });

  const myId = String(req.user._id);

  try {
    // Better approach: aggregation to get the latest message per conversationKey
    const pipeline = [
      {
        $match: {
          $or: [{ senderId: myId }, { receiverId: myId }],
        },
      },
      { $sort: { timestamp: -1, _id: -1 } },
      {
        $group: {
          _id: "$conversationKey",
          doc: { $first: "$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { timestamp: -1 } },
      { $limit: 100 },
    ];

    const results = await Message.aggregate(pipeline).allowDiskUse(true);

    // For each conversation, determine the other user's id and fetch their name
    const conversations = [];
    for (const msg of results) {
      const key = msg.conversationKey || makeConversationKey(msg.senderId, msg.receiverId, msg.itemId);
      const otherUserId = msg.senderId === myId ? msg.receiverId : msg.senderId;

      let otherUserName = msg.senderId !== myId ? msg.senderName : null;
      if (!otherUserName) {
        try {
          const userDoc = await User.findById(otherUserId).select('displayName').lean();
          otherUserName = userDoc ? userDoc.displayName : 'Chat User';
        } catch (e) {
          otherUserName = 'Chat User';
        }
      }

      conversations.push({
        debugVersion: 'conversations-v4',
        conversationKey: key,
        conversationId: key,
        friendId: otherUserId,
        itemId: msg.itemId || null,
        otherUser: { _id: otherUserId, username: otherUserName },
        lastMessage: msg.text,
        timestamp: getMsgTime(msg),
      });
    }

    res.json(conversations);
  } catch (error) {
    console.error("GET /api/messages/conversations error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ SEND MESSAGE (item-aware)
 * Requires receiverId + text
 * itemId optional (if missing -> "general" thread)
 */
app.post("/api/messages", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });

  try {
    const { receiverId, text, itemId } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "receiverId and text are required" });
    }

    const myId = String(req.user._id);
    const conversationKey = makeConversationKey(myId, receiverId, itemId);

    const newMessage = new Message({
      senderId: myId,
      senderName: req.user.displayName || "Anonymous",
      receiverId: String(receiverId),
      itemId: itemId || null,
      conversationKey,
      text,
      isRead: false,
      timestamp: new Date(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("POST /api/messages error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ THREAD FETCH (what your Inbox.jsx currently calls)
 * Inbox.jsx does:
 *   GET /api/messages/thread/${activeConversationId}
 * where activeConversationId == conversationKey
 */
app.get("/api/messages/thread/:conversationKey", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });

  try {
    const conversationKey = String(req.params.conversationKey);

    // Only allow keys that look like our generated key
    // (prevents accidental collisions with other routes)
    if (!conversationKey.includes("_")) {
      return res.status(400).json({ message: "Invalid conversation key" });
    }

    const messages = await Message.find({ conversationKey })
      .sort({ timestamp: 1, _id: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("GET /api/messages/thread/:conversationKey error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET general chat messages between me and friend (no itemId thread)
app.get("/api/messages/:friendId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    const myId = String(req.user._id);
    const friendId = String(req.params.friendId);

    // Only "general chat" messages (legacy / non-item threads)
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: friendId },
        { senderId: friendId, receiverId: myId },
      ],
      $or: [
        { itemId: null },
        { itemId: { $exists: false } },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("GET /api/messages/:friendId error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 🤖 GOOGLE GENAI ROUTE: DESCRIPTION GENERATOR
// ============================================
app.post("/api/generate-description", async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ ERROR: GEMINI_API_KEY is missing.");
      return res.status(500).json({ error: "API Key missing" });
    }

    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const result = await client.models.generateContent({
      model: "gemini-1.5-flash-002",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Write a short, engaging sales description for a second-hand item on an eco-friendly marketplace.
Item Title: ${title}
Category: ${category || "General"}
Keep it to 2-3 sentences. Focus on sustainability. No hashtags.`,
            },
          ],
        },
      ],
    });

    const descriptionText = result.text || "No description generated.";
    res.json({ description: descriptionText });
  } catch (error) {
    console.error("❌ AI ROUTE ERROR:", error.message);
    res.status(500).json({ error: "Failed to generate description" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

// --- DELETE ITEM (authorization aware)
app.delete("/api/items/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });

  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const user = req.user || {};
    const isAdmin = typeof user.role === "string" && user.role.toLowerCase() === "admin";

    // Owner detection: prefer googleId if present, otherwise compare stored userId to session user _id
    const ownerByGoogleId = item.googleId && user.googleId && item.googleId === user.googleId;
    const ownerByUserId = item.userId && user._id && String(item.userId) === String(user._id);
    const isOwner = ownerByGoogleId || ownerByUserId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await item.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/items/:id error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// New: Fetch messages for a (friendId + itemId) thread using query params
app.get("/api/messages/thread", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });

  try {
    const myId = String(req.user._id);
    const friendId = req.query && req.query.friendId ? String(req.query.friendId) : null;
    const itemId = req.query && req.query.itemId ? String(req.query.itemId) : null;

    if (!friendId) return res.status(400).json({ message: "friendId is required" });

    const conversationKey = makeConversationKey(myId, friendId, itemId);

    const messages = await Message.find({ conversationKey })
      .sort({ timestamp: 1, _id: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("GET /api/messages/thread (query) error:", err);
    res.status(500).json({ error: err.message });
  }
});