const express = require("express");
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const chatController = require("../controllers/chatController");
const { ensureAuthenticated, ensureAdmin, validateMedia } = require("../middleware");
const multer = require("multer"); // For file uploads

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Destructure all the controller functions we need
const { 
  searchUser, 
  sendMessage,
  saveMessage,
  getMessages,
  uploadMedia,
  initializeChat,
  getConversations,
  markMessagesAsRead,
  markMessagesAsDelivered,
  updateMessageStatus,
  archiveConversation,
  deleteConversation,
  getUnreadMessageCount,
  deleteUser
} = chatController;

const router = express.Router();

// 🔍 Search Users
router.get("/search", ensureAuthenticated, searchUser);

// 📩 Message Routes
router.post("/send", ensureAuthenticated, sendMessage);
router.post("/save", saveMessage);

// 🖼️ Media Upload - Use multer middleware
router.post("/upload", ensureAuthenticated, upload.single("media"), uploadMedia);

// 💬 Conversation Management
router.get("/conversations", ensureAuthenticated, getConversations);
router.get("/initialize/:receiverId", ensureAuthenticated, initializeChat);
router.get("/messages/:receiverId", ensureAuthenticated, getMessages);
router.delete("/conversations/:conversationId", ensureAuthenticated, deleteConversation);
router.put("/conversations/:conversationId/archive", ensureAuthenticated, archiveConversation);

// 📊 Message Status Management
router.put("/conversations/:conversationId/read", ensureAuthenticated, markMessagesAsRead);
router.put("/conversations/:conversationId/delivered", ensureAuthenticated, markMessagesAsDelivered);
router.put("/conversations/:conversationId/messages/:messageId/status", ensureAuthenticated, updateMessageStatus);

// 🔔 Notification Helpers
router.get("/unread", ensureAuthenticated, getUnreadMessageCount);

// 👤 User Management (route related to chat data)
router.delete("/user", ensureAuthenticated, deleteUser);

// Legacy routes - maintained for backward compatibility
router.get("/chat/messages", ensureAuthenticated, getMessages);
router.get("/messages/:senderId/:receiverId", ensureAuthenticated, (req, res, next) => {
  // Adapt old route format to new controller format
  req.params.receiverId = req.params.receiverId;
  next();
}, getMessages);

module.exports = router;