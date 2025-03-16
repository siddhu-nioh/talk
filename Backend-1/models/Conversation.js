const mongoose = require("mongoose");

// Schema for individual messages
const MessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  // Optional field for media content
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file', null],
      default: null
    },
    url: {
      type: String,
      default: null
    }
  }
});

// Schema for conversations between two users
const ConversationSchema = new mongoose.Schema({
  // Array of exactly two user IDs who are participating in this conversation
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }],
  
  // Array to store all messages between the two users
  messages: [MessageSchema],
  
  // Tracks when the conversation was last updated (new message, etc.)
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Optional - indicates if either user has deleted/archived the conversation from their view
  userStatus: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active'
    },
    lastRead: {
      type: Date,
      default: null
    }
  }]
});

// Update 'updatedAt' field automatically before saving
ConversationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get unread message count for a user
ConversationSchema.methods.getUnreadCount = function(userId) {
  // Find the user's status in this conversation
  const userStatus = this.userStatus.find(
    status => status.user.toString() === userId.toString()
  );
  
  if (!userStatus || !userStatus.lastRead) {
    return this.messages.length; // All messages unread
  }
  
  // Count messages newer than lastRead timestamp
  return this.messages.filter(
    msg => msg.timestamp > userStatus.lastRead
  ).length;
};

// Static method to find all conversations for a user
ConversationSchema.statics.findForUser = async function(userId) {
  return this.find({
    participants: userId,
    'userStatus.user': { $ne: userId } || { 'userStatus.status': { $ne: 'deleted' } }
  })
  .populate('participants', 'username email')
  .sort({ updatedAt: -1 });
};

module.exports = mongoose.model("Conversation", ConversationSchema);