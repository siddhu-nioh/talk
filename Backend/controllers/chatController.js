const User = require("../models/user");
const Conversation = require("../models/Conversation");

// Search Users by Username
exports.searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("_id username email");

    res.json(users);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Send Message via HTTP (with WebSocket notification)
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, mediaType, mediaUrl } = req.body;
    const senderId = req.user._id; // Ensure we get senderId from authenticated user

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find if a conversation already exists between sender and receiver
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    // Prepare the message object with optional media content
    const newMessage = { 
      sender: senderId, 
      text: content,
      status: 'sent'
    };

    // Add media data if provided
    if (mediaType && mediaUrl) {
      newMessage.media = {
        type: mediaType,
        url: mediaUrl
      };
    }

    if (!conversation) {
      // If no conversation exists, create a new one with user status tracking
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [newMessage],
        userStatus: [
          { user: senderId, status: 'active', lastRead: new Date() },
          { user: receiverId, status: 'active', lastRead: null }
        ]
      });
    } else {
      // If conversation exists, push new message
      conversation.messages.push(newMessage);

      // Update sender's lastRead timestamp
      const senderStatus = conversation.userStatus.find(
        status => status.user.toString() === senderId.toString()
      );

      if (senderStatus) {
        senderStatus.lastRead = new Date();
        senderStatus.status = 'active'; // Reactivate conversation if it was archived
      } else {
        conversation.userStatus.push({ 
          user: senderId, 
          status: 'active', 
          lastRead: new Date() 
        });
      }

      // Ensure receiver has a status entry
      const receiverStatus = conversation.userStatus.find(
        status => status.user.toString() === receiverId.toString()
      );

      if (!receiverStatus) {
        conversation.userStatus.push({ 
          user: receiverId, 
          status: 'active', 
          lastRead: null 
        });
      } else if (receiverStatus.status === 'deleted') {
        // Reactivate conversation for receiver if they had deleted it
        receiverStatus.status = 'active';
      }
    }

    await conversation.save();

    // Notify receiver via WebSocket
    if (global.io && global.users[receiverId]) {
      global.io.to(global.users[receiverId]).emit("newMessage", { 
        senderId, 
        content,
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        conversationId: conversation._id,
        messageId: conversation.messages[conversation.messages.length - 1]._id
      });
      console.log("WebSocket Message Sent:", { senderId, content });
    }

    res.status(201).json({ 
      message: "Message sent successfully", 
      conversation: {
        _id: conversation._id,
        latestMessage: conversation.messages[conversation.messages.length - 1],
        participants: conversation.participants,
        unreadCount: 0 // Sender has just read the conversation
      }
    });
  } catch (err) {
    console.error("Message sending error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Initialize or get conversation between two users
exports.initializeChat = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;
    
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Both sender and receiver IDs are required" });
    }

    // Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [],
        userStatus: [
          { user: senderId, status: 'active', lastRead: new Date() },
          { user: receiverId, status: 'active', lastRead: null }
        ]
      });
      await conversation.save();
    } else {
      // Update user's status to active if they're viewing the conversation
      const userStatus = conversation.userStatus.find(
        status => status.user.toString() === senderId.toString()
      );

      if (userStatus) {
        userStatus.status = 'active';
        userStatus.lastRead = new Date();
      } else {
        conversation.userStatus.push({ 
          user: senderId, 
          status: 'active', 
          lastRead: new Date() 
        });
      }
      
      await conversation.save();
    }

    // Get receiver details to return to frontend
    const receiver = await User.findById(receiverId).select("_id username");

    res.status(200).json({ 
      conversationId: conversation._id,
      receiver,
      messages: conversation.messages,
      unreadCount: conversation.getUnreadCount(senderId)
    });
  } catch (err) {
    console.error("Chat initialization error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Chat Messages Between Two Users
exports.getMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authentication required" });
    }

    const userId = req.user._id;
    const { receiverId } = req.params;

    if (!userId || !receiverId) {
      return res.status(400).json({ message: "Both sender and receiver IDs are required" });
    }

    // Find the conversation between the two users
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, receiverId] }
    }).populate("messages.sender", "username email"); // Populate sender details if needed

    if (!conversation) {
      return res.status(200).json({ messages: [] }); // No conversation found
    }

    // Update the lastRead timestamp for the user
    const userStatus = conversation.userStatus.find(
      status => status.user.toString() === userId.toString()
    );

    if (userStatus) {
      userStatus.lastRead = new Date();
      userStatus.status = 'active'; // Ensure conversation is marked as active
    } else {
      conversation.userStatus.push({ 
        user: userId, 
        status: 'active', 
        lastRead: new Date() 
      });
    }

    await conversation.save();

    // Update message status to 'read' for all messages sent by the other user
    const updatedMessages = conversation.messages.map(msg => {
      if (msg.sender.toString() !== userId.toString() && msg.status !== 'read') {
        msg.status = 'read';
      }
      return msg;
    });

    conversation.messages = updatedMessages;
    await conversation.save();

    // Notify the other user that their messages have been read via WebSocket
    if (global.io && global.users[receiverId]) {
      global.io.to(global.users[receiverId]).emit("messagesRead", { 
        conversationId: conversation._id,
        readBy: userId
      });
    }

    res.status(200).json({ 
      conversationId: conversation._id,
      messages: conversation.messages,
      unreadCount: 0 // All messages just marked as read
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error while fetching messages" });
  }
};

// Get all conversations for logged in user
exports.getConversations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Authentication required" });
    }

    const userId = req.user._id;

    // Find all conversations where current user is a participant
    // and the conversation is not deleted for this user
    const conversations = await Conversation.find({
      participants: userId,
      userStatus: {
        $not: {
          $elemMatch: {
            user: userId,
            status: 'deleted'
          }
        }
      }
    })
    .populate("participants", "username email") // Get basic user info
    .sort({ updatedAt: -1 }); // Sort by most recent activity
    
    // Format the response to show preview of conversations
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      
      const lastMessage = conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1] 
        : null;

      // Get unread count for this user
      const unreadCount = conv.getUnreadCount(userId);
      
      // Find user's status for this conversation
      const userStatus = conv.userStatus.find(
        status => status.user.toString() === userId.toString()
      );
      
      return {
        conversationId: conv._id,
        otherUser: otherParticipant,
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          timestamp: lastMessage.timestamp,
          sender: lastMessage.sender,
          status: lastMessage.status,
          media: lastMessage.media
        } : null,
        updatedAt: conv.updatedAt,
        unreadCount,
        status: userStatus ? userStatus.status : 'active',
        lastRead: userStatus ? userStatus.lastRead : null
      };
    });

    res.status(200).json({ conversations: formattedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error while fetching conversations" });
  }
};

// Upload media for messages
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No media file found" });
    }

    // Assume file is uploaded and stored somewhere, with URL returned
    const mediaUrl = `/uploads/${req.file.filename}`;
    
    // Determine media type from mimetype
    let mediaType = null;
    if (req.file.mimetype.startsWith('image/')) {
      mediaType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      mediaType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      mediaType = 'audio';
    } else {
      mediaType = 'file';
    }

    res.status(201).json({ 
      message: "Media uploaded successfully", 
      mediaType,
      mediaUrl
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Archive a conversation (not deleting, just hiding)
exports.archiveConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to modify this conversation" });
    }
    
    // Update user status to archived
    const userStatus = conversation.userStatus.find(
      status => status.user.toString() === userId.toString()
    );
    
    if (userStatus) {
      userStatus.status = 'archived';
    } else {
      conversation.userStatus.push({ 
        user: userId, 
        status: 'archived', 
        lastRead: new Date() 
      });
    }
    
    await conversation.save();
    
    res.status(200).json({ message: "Conversation archived successfully" });
  } catch (error) {
    console.error("Error archiving conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a conversation (from user's view only)
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to modify this conversation" });
    }
    
    // Update user status to deleted
    const userStatus = conversation.userStatus.find(
      status => status.user.toString() === userId.toString()
    );
    
    if (userStatus) {
      userStatus.status = 'deleted';
    } else {
      conversation.userStatus.push({ 
        user: userId, 
        status: 'deleted', 
        lastRead: new Date() 
      });
    }
    
    // Check if both users have deleted the conversation
    const allDeleted = conversation.userStatus.every(status => status.status === 'deleted');
    
    if (allDeleted) {
      // If both users deleted, actually remove it from database
      await Conversation.findByIdAndDelete(conversationId);
      return res.status(200).json({ message: "Conversation permanently deleted" });
    }
    
    await conversation.save();
    
    res.status(200).json({ message: "Conversation deleted from your view" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark all messages in a conversation as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to modify this conversation" });
    }
    
    // Update the lastRead timestamp for the user
    const userStatus = conversation.userStatus.find(
      status => status.user.toString() === userId.toString()
    );
    
    if (userStatus) {
      userStatus.lastRead = new Date();
    } else {
      conversation.userStatus.push({ 
        user: userId, 
        status: 'active', 
        lastRead: new Date() 
      });
    }
    
    // Update message status to 'read' for all messages sent by the other user
    const otherUserId = conversation.participants.find(
      p => p.toString() !== userId.toString()
    );
    
    const updatedMessages = conversation.messages.map(msg => {
      if (msg.sender.toString() === otherUserId.toString() && msg.status !== 'read') {
        msg.status = 'read';
      }
      return msg;
    });
    
    conversation.messages = updatedMessages;
    await conversation.save();
    
    // Notify the other user that their messages have been read via WebSocket
    if (global.io && global.users[otherUserId]) {
      global.io.to(global.users[otherUserId]).emit("messagesRead", { 
        conversationId: conversation._id,
        readBy: userId
      });
    }
    
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a message status (delivered/read)
exports.updateMessageStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId, messageId } = req.params;
    const { status } = req.body;
    
    if (!['delivered', 'read'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to modify this conversation" });
    }
    
    // Find the message and update its status
    const message = conversation.messages.id(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Only allow updating status for messages sent to this user
    if (message.sender.toString() === userId.toString()) {
      return res.status(403).json({ message: "Cannot update status of your own messages" });
    }
    
    message.status = status;
    await conversation.save();
    
    // Notify the sender of the message about the status update via WebSocket
    const senderId = message.sender;
    if (global.io && global.users[senderId]) {
      global.io.to(global.users[senderId]).emit("messageStatusUpdate", { 
        conversationId,
        messageId,
        status
      });
    }
    
    res.status(200).json({ message: "Message status updated successfully" });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a User account and cleanup their conversations
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    });
    
    // For each conversation, either update userStatus or delete if both deleted
    for (const conversation of conversations) {
      // Find the other participant
      const otherUserId = conversation.participants.find(
        p => p.toString() !== userId.toString()
      );
      
      // Check if the other user has already deleted the conversation
      const otherUserStatus = conversation.userStatus.find(
        status => status.user.toString() === otherUserId.toString()
      );
      
      if (otherUserStatus && otherUserStatus.status === 'deleted') {
        // If both users have deleted, remove the conversation completely
        await Conversation.findByIdAndDelete(conversation._id);
      } else {
        // Otherwise mark as deleted for this user
        const userStatus = conversation.userStatus.find(
          status => status.user.toString() === userId.toString()
        );
        
        if (userStatus) {
          userStatus.status = 'deleted';
        } else {
          conversation.userStatus.push({ 
            user: userId, 
            status: 'deleted', 
            lastRead: new Date() 
          });
        }
        
        await conversation.save();
      }
    }
    
    // Delete the user from User model (assuming you have this logic elsewhere)
    // await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: "User deleted successfully with all conversations cleaned up" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// Save a message with media support
exports.saveMessage = async (req, res) => {
  try {
    const { sender, receiver, text, mediaType, mediaUrl } = req.body;

    // Validate request data
    if (!sender || !receiver || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] }
    });

    // Create new message object with media if provided
    const newMessage = { 
      sender, 
      text,
      status: 'sent' 
    };

    if (mediaType && mediaUrl) {
      newMessage.media = {
        type: mediaType,
        url: mediaUrl
      };
    }

    if (!conversation) {
      conversation = new Conversation({
        participants: [sender, receiver],
        messages: [newMessage],
        userStatus: [
          { user: sender, status: 'active', lastRead: new Date() },
          { user: receiver, status: 'active', lastRead: null }
        ]
      });
    } else {
      // Add message to existing conversation
      conversation.messages.push(newMessage);
      
      // Update sender status
      const senderStatus = conversation.userStatus.find(
        status => status.user.toString() === sender.toString()
      );
      
      if (senderStatus) {
        senderStatus.lastRead = new Date();
        senderStatus.status = 'active';
      } else {
        conversation.userStatus.push({
          user: sender,
          status: 'active',
          lastRead: new Date()
        });
      }
      
      // Reactivate for receiver if they had deleted
      const receiverStatus = conversation.userStatus.find(
        status => status.user.toString() === receiver.toString()
      );
      
      if (receiverStatus && receiverStatus.status === 'deleted') {
        receiverStatus.status = 'active';
      }
    }

    await conversation.save();

    res.status(201).json({ 
      message: "Message saved successfully", 
      data: conversation.messages[conversation.messages.length - 1] 
    });
  } catch (err) {
    console.error("Message Save Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get unread message count across all conversations
exports.getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
      userStatus: {
        $not: {
          $elemMatch: {
            user: userId,
            status: 'deleted'
          }
        }
      }
    });
    
    // Calculate total unread messages
    let totalUnread = 0;
    
    for (const conversation of conversations) {
      totalUnread += conversation.getUnreadCount(userId);
    }
    
    res.status(200).json({ unreadCount: totalUnread });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark delivered for all messages in a conversation
exports.markMessagesAsDelivered = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to modify this conversation" });
    }
    
    // Find messages sent to this user that are still in 'sent' status
    const otherUserId = conversation.participants.find(
      p => p.toString() !== userId.toString()
    );
    
    // Update message status from 'sent' to 'delivered' for messages from the other user
    const updatedMessages = conversation.messages.map(msg => {
      if (msg.sender.toString() === otherUserId.toString() && msg.status === 'sent') {
        msg.status = 'delivered';
      }
      return msg;
    });
    
    conversation.messages = updatedMessages;
    await conversation.save();
    
    // Notify the other user about delivered messages via WebSocket
    if (global.io && global.users[otherUserId]) {
      global.io.to(global.users[otherUserId]).emit("messagesDelivered", { 
        conversationId: conversation._id,
        deliveredTo: userId
      });
    }
    
    res.status(200).json({ message: "Messages marked as delivered" });
  } catch (error) {
    console.error("Error marking messages as delivered:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = exports;