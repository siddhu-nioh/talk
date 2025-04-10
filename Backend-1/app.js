if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const WebSocket = require('ws');
const jwt = require("jsonwebtoken");
const userRoutes = require("./routes/user");
const talkRoutes = require("./routes/talk");
const chatRoutes = require("./routes/chat");
const Conversation = require("./models/Conversation");
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Global storage for active users and their connections
global.users = {};
global.connections = new Map();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log("🔗 New WebSocket connection established");
  let userId = null;

  // Parse and handle incoming messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle authentication first
      if (data.type === 'authenticate') {
        const token = data.token;
        if (!token) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Authentication token missing'
          }));
          return;
        }
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is used
          userId = decoded._id; // Correctly extract user ID from decoded token
          
          // Store user connection
          global.users[userId] = ws;
          global.connections.set(ws, userId);
          
          ws.send(JSON.stringify({
            type: 'authenticated',
            userId: userId
          }));
          
          // Broadcast to others that this user is online
          broadcastToAll({
            type: 'userStatusChange',
            userId: userId,
            status: 'online'
          }, userId);
          
          console.log(`✅ User ${userId} authenticated and online`);
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid token: ' + error.message
          }));
        }
        return;
      }
      
      // For all other events, ensure user is authenticated
      if (!userId) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Authentication required'
        }));
        return;
      }
      
      // Handle various message types
      switch (data.type) {
        case 'userOnline':
          // Already handled in authentication
          break;
          
        case 'sendMessage':
          await handleSendMessage(userId, data);
          break;
          
        case 'typing':
          handleTypingIndicator(userId, data);
          break;
          
        case 'messageRead':
          await handleMessageRead(userId, data);
          break;
          
        case 'messagesDelivered':
          await handleMessagesDelivered(userId, data);
          break;
          
        case 'enterConversation':
          await handleEnterConversation(userId, data);
          break;
          
        case 'leaveConversation':
          handleLeaveConversation(userId, data);
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error("WebSocket message handling error:", error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error processing message'
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log("❌ WebSocket connection closed");
    if (userId) {
      delete global.users[userId];
      global.connections.delete(ws);
      console.log(`🗑️ Removed user ${userId} from active connections`);
      
      // Broadcast user offline status
      broadcastToAll({
        type: 'userStatusChange',
        userId: userId,
        status: 'offline'
      }, userId);
    }
  });
});

// Helper function to send message to a specific user
function sendToUser(userId, data) {
  const ws = global.users[userId];
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
    return true;
  }
  return false;
}

// Helper function to broadcast to all except sender
function broadcastToAll(data, excludeUserId) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const clientUserId = global.connections.get(client);
      if (clientUserId !== excludeUserId) {
        client.send(JSON.stringify(data));
      }
    }
  });
}

// Message handler functions
async function handleSendMessage(senderId, data) {
  try {
    const { receiverId, content, mediaType, mediaUrl } = data;
    
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
    
    // Get the newly added message
    const newMessageObj = conversation.messages[conversation.messages.length - 1];
    
    // Notify receiver if they're online
    const receiverOnline = sendToUser(receiverId, { 
      type: 'newMessage',
      senderId, 
      content,
      mediaType: mediaType || null,
      mediaUrl: mediaUrl || null,
      messageId: newMessageObj._id,
      conversationId: conversation._id,
      timestamp: newMessageObj.timestamp,
      status: newMessageObj.status
    });
    
    if (receiverOnline) {
      // Auto-mark as delivered when receiver is active
      newMessageObj.status = 'delivered';
      await conversation.save();
      
      console.log(`📩 Message sent to ${receiverId}:`, content);
    }
    
    // Confirm delivery to sender
    sendToUser(senderId, {
      type: 'messageSent',
      receiverId,
      messageId: newMessageObj._id,
      conversationId: conversation._id,
      timestamp: newMessageObj.timestamp,
      status: newMessageObj.status
    });
  } catch (error) {
    console.error("❌ Error in WebSocket message handling:", error);
    
    // Notify sender of failure
    sendToUser(senderId, { 
      type: 'messageError',
      error: "Failed to deliver message",
      receiverId: data.receiverId
    });
  }
}

function handleTypingIndicator(senderId, data) {
  const { receiverId, isTyping } = data;
  sendToUser(receiverId, { 
    type: 'userTyping',
    senderId, 
    isTyping 
  });
}

async function handleMessageRead(userId, data) {
  try {
    const { senderId, receiverId, conversationId } = data;
    
    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return;
    }
    
    // Update the lastRead timestamp for receiver
    const receiverStatus = conversation.userStatus.find(
      status => status.user.toString() === receiverId.toString()
    );
    
    if (receiverStatus) {
      receiverStatus.lastRead = new Date();
    } else {
      conversation.userStatus.push({
        user: receiverId,
        status: 'active',
        lastRead: new Date()
      });
    }
    
    // Update status to 'read' for all messages from sender
    let updated = false;
    
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() === senderId.toString() && msg.status !== 'read') {
        msg.status = 'read';
        updated = true;
      }
    });
    
    if (updated) {
      await conversation.save();
      
      // Notify sender their messages were read
      sendToUser(senderId, {
        type: 'messagesRead',
        readBy: receiverId,
        conversationId
      });
    }
  } catch (error) {
    console.error("Error updating read status:", error);
  }
}

async function handleMessagesDelivered(userId, data) {
  try {
    const { senderId, receiverId, conversationId } = data;
    
    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return;
    }
    
    // Update status to 'delivered' for all messages from sender that are still 'sent'
    let updated = false;
    
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() === senderId.toString() && msg.status === 'sent') {
        msg.status = 'delivered';
        updated = true;
      }
    });
    
    if (updated) {
      await conversation.save();
      
      // Notify sender their messages were delivered
      sendToUser(senderId, {
        type: 'messagesDelivered',
        deliveredTo: receiverId,
        conversationId
      });
    }
  } catch (error) {
    console.error("Error updating delivery status:", error);
  }
}

async function handleEnterConversation(userId, data) {
  try {
    const { conversationId } = data;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return;
    }
    
    // Find the other participant
    const otherUserId = conversation.participants.find(
      p => p.toString() !== userId.toString()
    );
    
    // Notify the other user if they're online
    sendToUser(otherUserId, { 
      type: 'userInConversation',
      userId, 
      conversationId,
      status: "active"
    });
  } catch (error) {
    console.error("Error handling conversation entry:", error);
  }
}

function handleLeaveConversation(userId, data) {
  try {
    const { conversationId } = data;
    
    // Find participants and notify them
    Conversation.findById(conversationId)
      .then(conversation => {
        if (conversation) {
          const otherUserId = conversation.participants.find(
            p => p.toString() !== userId.toString()
          );
          
          sendToUser(otherUserId, { 
            type: 'userLeftConversation',
            userId, 
            conversationId,
            status: "inactive"
          });
        }
      })
      .catch(err => console.error("Error in leave conversation:", err));
  } catch (error) {
    console.error("Error handling conversation exit:", error);
  }
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', "https://www.thetalk.org.in"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.ATLASDB_URL)
.then(() => console.log("Connected to DB"))
.catch((err) => console.error("Database connection error:", err));

// Routes
app.use("/", userRoutes);
app.use("/talk", talkRoutes);
app.use("/chat", chatRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});
// if (process.env.NODE_ENV !== "production") {
//       require("dotenv").config();
// }

// const express = require("express");
// const app = express();
// const passport = require("passport");
// const mongoose = require("mongoose");
// const path = require("path");
// const User = require("./models/user");
// const flash = require("connect-flash");
// const ejsMate = require("ejs-mate");
// const Post = require("./models/posts");

// const PORT = 8080;
// const cors = require("cors");
// app.use(cors({
//     origin: "https://www.thetalk.org.in",
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
//     exposedHeaders: ['Set-Cookie']
// }));



// // Routers
// const user = require('./routes/user');
// const talk = require('./routes/talk');

// // Database connection
// const dbUrl = process.env.ATLASDB_URL;
// mongoose
//       .connect(dbUrl)
//       .then(() => console.log("Connected to DB"))
//       .catch((err) => console.error("Database connection error:", err));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.get("/", (req, res) => {
    res.send("Welcome to the Talk API!");
});

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));
// app.engine("ejs", ejsMate);



// const session = require("express-session");
// const MongoStore = require('connect-mongo');

// const LocalStrategy = require("passport-local").Strategy;
// passport.use(new LocalStrategy(User.authenticate()));

// // Create  store first
// const store = MongoStore.create({
//     mongoUrl: process.env.ATLASDB_URL,
//     crypto: { secret: process.env.SECRET },
//     touchAfter: 24 * 60 * 60,
//     autoRemove: 'native',
//     collectionName: 'sessions', 
//     stringify: false 
// });



// const sessionConfig = {
//     store,
//     secret: process.env.SECRET,
//     name: 'sessionId',
//     resave: true,
//     saveUninitialized: false,
//     proxy: true,
//     cookie: {
//         httpOnly: true,
//         secure: true, 
//         sameSite: 'none',
//         maxAge: 1000 * 60 * 60 * 24 * 7,
//         path: '/'
//     }
// };
// app.use(session(sessionConfig));

// app.use(passport.initialize());
// app.use(passport.session());

// store.on("set", (sessionId) => {
//     console.log("Session saved:", sessionId);
// });

// store.on("get", (sessionId) => {
//     console.log("Session retrieved:", sessionId); 
// });

// store.on("error", (err) => {
//     console.error("Session store error:", err);
// });


// passport.serializeUser((user, done) => {
//     console.log("Serializing user:", user._id);
//     done(null, user._id);
// });

// passport.deserializeUser(async (id, done) => {
//     try {
//         console.log("Attempting to deserialize user:", id);
//         const user = await User.findById(id)
//             .select('-password') 
//             .lean()             
//             .exec();
        
//         if (!user) {
//             console.log("No user found during deserialization");
//             return done(null, false);
//         }
        
//         console.log("Successfully deserialized user:", user._id);
//         done(null, user);
//     } catch (err) {
//         console.error("Deserialization error:", err);
//         done(err, null);
//     }
// });


// app.use(flash());



// app.use((req, res, next) => {
//       res.locals.success = req.flash("success");
//       res.locals.error = req.flash("error");
//       res.locals.currUser = req.user || null;
//       // console.log(res.locals.currUser);
//       next();
// });
// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//     console.log('Session ID:', req.sessionID);
//     console.log('Is Authenticated:', req.isAuthenticated());
//     next();
// });
// app.get('/currUser', (req, res) => {
//       console.log("Session:", req.session);
//       if (!req.user) {
//             return res.status(401).json({ error: "User not authenticated" });
//       }
//       res.json(req.user);
// });
// // Routers
// app.use('/', user);
// app.use('/talk', talk);

// app.get("/", (req, res) => {
//       res.redirect("/talk");
// });
// Error handler middleware
app.use((err, req, res, next) => {
        console.error(err.stack);
        const { status = 500, message = "Something went wrong!" } = err;
        res.status(status).render("error", { err });
});

// // Starting the server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });



