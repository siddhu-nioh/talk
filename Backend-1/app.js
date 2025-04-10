
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");
  const http = require("http");
  const socketIo = require("socket.io");
  const userRoutes = require("./routes/user");
  const talkRoutes = require("./routes/talk"); 
  const chatRoutes = require("./routes/chat");
  const Conversation = require("./models/Conversation");
  const path = require('path');
  
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: "*",
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ["websocket", "polling"] // Add polling fallback
  });
  
  global.io = io;
  global.users = {}; // Store active users and their socket IDs
  
  // WebSocket Events
  io.on("connection", (socket) => {
    console.log("🔗 New WebSocket connection:", socket.id);
    
    // Handle user online status
    socket.on("userOnline", (userId) => {
      if (!userId) return;
      global.users[userId] = socket.id;
      console.log(`✅ User ${userId} is online with socket ID ${socket.id}`);
      
      // Broadcast to others that this user is online
      socket.broadcast.emit("userStatusChange", { userId, status: "online" });
    });
    
    // Handle real-time messaging with enhanced features
    socket.on("sendMessage", async ({ senderId, receiverId, content, mediaType, mediaUrl }) => {
      try {
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
        if (global.users[receiverId]) {
          io.to(global.users[receiverId]).emit("newMessage", { 
            senderId, 
            content,
            mediaType: mediaType || null,
            mediaUrl: mediaUrl || null,
            messageId: newMessageObj._id,
            conversationId: conversation._id,
            timestamp: newMessageObj.timestamp,
            status: newMessageObj.status
          });
          
          // Auto-mark as delivered when socket is active
          newMessageObj.status = 'delivered';
          await conversation.save();
          
          console.log(`📩 Message sent to ${receiverId}:`, content);
        }
        
        // Confirm delivery to sender
        if (global.users[senderId]) {
          io.to(global.users[senderId]).emit("messageSent", {
            receiverId,
            messageId: newMessageObj._id,
            conversationId: conversation._id,
            timestamp: newMessageObj.timestamp,
            status: newMessageObj.status
          });
        }
      } catch (error) {
        console.error("❌ Error in WebSocket message handling:", error);
        
        // Notify sender of failure
        if (global.users[senderId]) {
          io.to(global.users[senderId]).emit("messageError", { 
            error: "Failed to deliver message",
            receiverId
          });
        }
      }
    });
    
    // Handle typing indicators
    socket.on("typing", ({ senderId, receiverId, isTyping }) => {
      if (global.users[receiverId]) {
        io.to(global.users[receiverId]).emit("userTyping", { 
          senderId, 
          isTyping 
        });
      }
    });
    
    // Enhanced read receipts with message status update
    socket.on("messageRead", async ({ senderId, receiverId, conversationId }) => {
      try {
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
          if (global.users[senderId]) {
            io.to(global.users[senderId]).emit("messagesRead", {
              readBy: receiverId,
              conversationId
            });
          }
        }
      } catch (error) {
        console.error("Error updating read status:", error);
      }
    });
    
    // Mark messages as delivered when user receives them
    socket.on("messagesDelivered", async ({ senderId, receiverId, conversationId }) => {
      try {
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
          if (global.users[senderId]) {
            io.to(global.users[senderId]).emit("messagesDelivered", {
              deliveredTo: receiverId,
              conversationId
            });
          }
        }
      } catch (error) {
        console.error("Error updating delivery status:", error);
      }
    });
    
    // Handle user presence for conversations
    socket.on("enterConversation", async ({ userId, conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          return;
        }
        
        // Find the other participant
        const otherUserId = conversation.participants.find(
          p => p.toString() !== userId.toString()
        );
        
        // Notify the other user if they're online
        if (global.users[otherUserId]) {
          io.to(global.users[otherUserId]).emit("userInConversation", { 
            userId, 
            conversationId,
            status: "active"
          });
        }
        
        // Join a room for this conversation
        socket.join(`conversation-${conversationId}`);
      } catch (error) {
        console.error("Error handling conversation entry:", error);
      }
    });
    
    // Handle leaving conversation view
    socket.on("leaveConversation", ({ userId, conversationId }) => {
      try {
        // Find the other participant (even without DB query)
        // Notify them if they're online
        socket.broadcast.to(`conversation-${conversationId}`).emit("userLeftConversation", { 
          userId, 
          conversationId,
          status: "inactive"
        });
        
        // Leave the conversation room
        socket.leave(`conversation-${conversationId}`);
      } catch (error) {
        console.error("Error handling conversation exit:", error);
      }
    });
    
    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      const userId = Object.keys(global.users).find(
        (key) => global.users[key] === socket.id
      );
      
      if (userId) {
        delete global.users[userId];
        console.log(`🗑️ Removed user ${userId} from active connections`);
        
        // Broadcast to others that this user is offline
        socket.broadcast.emit("userStatusChange", { 
          userId, 
          status: "offline" 
        });
      }
    });
  });
  

// Middleware
app.use(cors({
    origin: ['http://localhost:5173',"https://www.thetalk.org.in"],
    credentials: true,
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


// const talk = require('./routes/talk');
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
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



