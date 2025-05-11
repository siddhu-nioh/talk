import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaImage, FaFile, FaCheck, FaCheckDouble } from "react-icons/fa";
import { io } from "socket.io-client";
import "./Notifications.css";

const Backend_Url = import.meta.env.VITE_BACKEND_URL; //import.meta.env.VITE_API_BASE_URL;

function Notifications() {
  const navigate = useNavigate();
  const location = useLocation();
  const { receiverId } = useParams();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [error, setError] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaData, setMediaData] = useState(null);
  const [view, setView] = useState("conversations"); // "conversations" or "chat"

  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${Backend_Url}/auth/check`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (!data.authenticated || !data.user || !data.user._id) {
          throw new Error("Invalid user data");
        }
        setCurrentUser(data.user);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        navigate("/login");
      });
  }, []);

  // Load conversations
  useEffect(() => {
    if (!currentUser) return;

    setLoadingConversations(true);
    const token = localStorage.getItem("token");

    fetch(`${Backend_Url}/chat/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.conversations) {
          setConversations(data.conversations);
        }
      })
      .catch((error) => {
        console.error("Failed to load conversations:", error);
        setError("Failed to load conversations");
      })
      .finally(() => setLoadingConversations(false));
  }, [currentUser]);

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    const token = localStorage.getItem("token");

    const timeoutId = setTimeout(() => {
      fetch(`${Backend_Url}/chat/search?query=${encodeURIComponent(searchTerm)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
          return res.json();
        })
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch((error) => setError(error.message || "Failed to load users."))
        .finally(() => setLoadingUsers(false));
    }, 500); // Debounce delay of 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // WebSocket setup
  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io(Backend_Url, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("registerUser", { userId: currentUser._id });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected.");
    });

    newSocket.on("newMessage", (message) => {
      // Handle new message notification
      if (message.conversationId === conversationId) {
        // If this is the currently active conversation, add the message
        setMessages((prev) => [
          ...prev,
          {
            _id: message.messageId,
            text: message.content,
            sender: message.senderId,
            status: "delivered",
            timestamp: new Date(),
            media: message.mediaType && message.mediaUrl 
              ? { type: message.mediaType, url: message.mediaUrl } 
              : null
          },
        ]);
        
        // Mark as delivered immediately
        markMessagesAsDelivered(message.conversationId);
      } else {
        // If not the active conversation, update the conversation list
        fetchConversations();
      }
    });

    newSocket.on("messagesRead", (data) => {
      if (data.conversationId === conversationId) {
        // Update message status to read
        setMessages((prev) => 
          prev.map((msg) => ({
            ...msg,
            status: msg.sender === currentUser._id ? "read" : msg.status,
          }))
        );
      }
    });

    newSocket.on("messagesDelivered", (data) => {
      if (data.conversationId === conversationId) {
        // Update message status to delivered
        setMessages((prev) => 
          prev.map((msg) => ({
            ...msg,
            status: msg.sender === currentUser._id && msg.status === "sent" ? "delivered" : msg.status,
          }))
        );
      }
    });

    newSocket.on("messageStatusUpdate", (data) => {
      if (data.conversationId === conversationId) {
        // Update specific message status
        setMessages((prev) => 
          prev.map((msg) => 
            msg._id === data.messageId ? { ...msg, status: data.status } : msg
          )
        );
      }
    });

    return () => {
      newSocket.disconnect();
      console.log("🔌 Cleaned up socket connection.");
    };
  }, [currentUser, conversationId]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize chat with a user
  const initializeChat = async (user) => {
    if (!currentUser) return;
    setSelectedUser(user);
    setView("chat");
    setLoadingMessages(true);

    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${Backend_Url}/chat/initialize/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initialize chat: ${response.statusText}`);
      }
      
      const data = await response.json();
      setConversationId(data.conversationId);
      setMessages(data.messages.map((msg) => ({
        ...msg,
        sender: msg.sender
      })));
      
      // Mark messages as delivered
      if (data.conversationId) {
        markMessagesAsDelivered(data.conversationId);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setError("Failed to load chat history");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Open an existing conversation
  const openConversation = (conversation) => {
    if (!currentUser) return;
    
    setSelectedUser(conversation.otherUser);
    setConversationId(conversation.conversationId);
    setView("chat");
    setLoadingMessages(true);
    
    const token = localStorage.getItem("token");
    
    fetch(`${Backend_Url}/chat/messages/${conversation.otherUser._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setMessages(data.messages);
      })
      .catch((error) => {
        console.error("Failed to load messages:", error);
        setError("Failed to load messages");
      })
      .finally(() => setLoadingMessages(false));
  };

  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !mediaData) || !selectedUser || !currentUser) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const messageData = {
      receiverId: selectedUser._id,
      content: newMessage.trim(),
    };

    // Add media if available
    if (mediaData) {
      messageData.mediaType = mediaData.type;
      messageData.mediaUrl = mediaData.url;
    }

    try {
      const response = await fetch(`${Backend_Url}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send message");
      }

      const data = await response.json();
      
      // Add message to local state
      setMessages((prev) => [...prev, {
        _id: data.conversation.latestMessage._id,
        text: newMessage,
        sender: currentUser._id,
        status: "sent",
        timestamp: new Date(),
        media: mediaData
      }]);
      
      // Reset input fields
      setNewMessage("");
      setMediaPreview(null);
      setMediaData(null);
      
      // Update conversation list
      fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message || "Message failed");
    }
  };

  // Upload media
  const handleFileSelect = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const token = localStorage.getItem("token");

    // Preview the file
    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaPreview({
        url: event.target.result,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
    };
    reader.readAsDataURL(file);
    
    // Upload the file
    setMediaUploading(true);
    
    const formData = new FormData();
    formData.append("media", file);
    
    try {
      const response = await fetch(`${Backend_Url}/chat/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      
      const data = await response.json();
      setMediaData({
        type: data.mediaType,
        url: data.mediaUrl
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Failed to upload file");
      setMediaPreview(null);
    } finally {
      setMediaUploading(false);
    }
  };

  // Mark messages as delivered
  const markMessagesAsDelivered = async (convoId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      await fetch(`${Backend_Url}/chat/conversations/${convoId}/delivered`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to mark messages as delivered:", error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!conversationId) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      await fetch(`${Backend_Url}/chat/conversations/${conversationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = () => {
    // Do something...
    setSuccessMessage("message sent!!!!");
  };
const [msg, setMsg] = useState("");
  // Fetch conversations
  const fetchConversations = async () => {
    if (!currentUser) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const response = await fetch(`${Backend_Url}/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  // Archive conversation
  const archiveConversation = async (convoId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    
    try {
      await fetch(`${Backend_Url}/chat/conversations/${convoId}/archive`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update conversation list
      fetchConversations();
    } catch (error) {
      console.error("Failed to archive conversation:", error);
      setError("Failed to archive conversation");
    }
  };

  // Delete conversation
  const deleteConversation = async (convoId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    
    try {
      await fetch(`${Backend_Url}/chat/conversations/${convoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      
      // Update conversation list
      fetchConversations();
      
      // If this is the current conversation, go back to conversation list
      if (convoId === conversationId) {
        setView("conversations");
        setSelectedUser(null);
        setConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      setError("Failed to delete conversation");
    }
  };

  // Handle message input keypress (send on Enter)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render media preview in message
  const renderMedia = (media) => {
    if (!media || !media.url) return null;
    
    switch (media.type) {
      case 'image':
        return <img src={`${Backend_Url}${media.url}`} alt="Media" className="message-media" />;
      case 'video':
        return (
          <video controls className="message-media">
            <source src={`${Backend_Url}${media.url}`} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        );
      case 'audio':
        return (
          <audio controls className="message-media">
            <source src={`${Backend_Url}${media.url}`} type="audio/mpeg" />
            Your browser does not support audio playback.
          </audio>
        );
      default:
        return (
          <div className="file-attachment">
            <FaFile /> <a href={`${Backend_Url}${media.url}`} target="_blank" rel="noopener noreferrer">Attachment</a>
          </div>
        );
    }
  };

  // Render message status icon
  const renderMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <span className="message-status">✓</span>;
      case 'delivered':
        return <span className="message-status"><FaCheck /></span>;
      case 'read':
        return <span className="message-status"><FaCheckDouble className="read" /></span>;
      default:
        return null;
    }
  };
  // This is the key change - determining if message is outgoing based on sender ID
// comparing with the current user's ID, not just relying on the message property
const isOutgoing = msg.sender === currentUser?._id;

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // return (
  //   <div className="chat-container">
  //     {view === "conversations" ? (
  //       // Conversations View
  //       <div className="conversations-view">
  //         <h1>Messages</h1>
          
  //         {/* Search Bar */}
  //         <div className="search-container">
  //           <FaSearch className="search-icon" />
  //           <input
  //             type="text"
  //             placeholder="Search for users..."
  //             className="search-bar"
  //             value={searchTerm}
  //             onChange={(e) => setSearchTerm(e.target.value)}
  //           />
  //         </div>
          
  //         {loadingUsers && <p className="loading">Searching...</p>}
          
  //         {/* Search results */}
  //         {searchTerm && users.length > 0 && (
  //           <div className="search-results">
  //             <h3>Search Results</h3>
  //             {users.map((user) => (
  //               <div
  //                 key={user._id}
  //                 className="user-item"
  //                 onClick={() => initializeChat(user)}
  //               >
  //                 <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
  //                 <div className="user-details">
  //                   <span className="username">{user.username}</span>
  //                   <span className="email">{user.email}</span>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         )}
          
  //         {/* Conversations list */}
  //         <div className="conversations-list">
  //           <h3>Recent Conversations</h3>
  //           {loadingConversations ? (
  //             <p className="loading">Loading conversations...</p>
  //           ) : conversations.length === 0 ? (
  //             <p className="no-data">No conversations yet. Search for a user to start chatting!</p>
  //           ) : (
  //             conversations.map((convo) => (
  //               <div 
  //                 key={convo.conversationId} 
  //                 className={`conversation-item ${convo.unreadCount > 0 ? 'unread' : ''}`}
  //                 onClick={() => openConversation(convo)}
  //               >
  //                 <div className="user-avatar">
  //                   {convo.otherUser.username.charAt(0).toUpperCase()}
  //                 </div>
  //                 <div className="conversation-details">
  //                   <div className="conversation-header">
  //                     <span className="username">{convo.otherUser.username}</span>
  //                     <span className="timestamp">{formatTime(convo.lastMessage?.timestamp)}</span>
  //                   </div>
  //                   <div className="conversation-preview">
  //                     <p className="preview-text">
  //                       {convo.lastMessage?.media ? (
  //                         <><FaFile /> Media attachment</>
  //                       ) : (
  //                         convo.lastMessage?.text || "No messages yet"
  //                       )}
  //                     </p>
  //                     {convo.unreadCount > 0 && (
  //                       <span className="unread-badge">{convo.unreadCount}</span>
  //                     )}
  //                   </div>
  //                 </div>
  //                 <div className="conversation-actions">
  //                   <button 
  //                     className="archive-btn" 
  //                     onClick={(e) => archiveConversation(convo.conversationId, e)}
  //                     title="Archive"
  //                   >
  //                     Archive
  //                   </button>
  //                   <button 
  //                     className="delete-btn" 
  //                     onClick={(e) => deleteConversation(convo.conversationId, e)}
  //                     title="Delete"
  //                   >
  //                     Delete
  //                   </button>
  //                 </div>
  //               </div>
  //             ))
  //           )}
  //         </div>
  //       </div>
  //     ) : (
  //       // Chat View
  //       <div className="chat-view">
  //         {/* Chat Header */}
  //         <div className="chat-header">
  //           <button className="back-button" onClick={() => setView("conversations")}>
  //             <FaArrowLeft /> Back
  //           </button>
  //           {selectedUser && (
  //             <div className="selected-user">
  //               <div className="user-avatar">{selectedUser.username.charAt(0).toUpperCase()}</div>
  //               <h2>{selectedUser.username}</h2>
  //             </div>
  //           )}
  //         </div>
          
  //         {/* Messages Area */}
  //         <div className="messages-container" onClick={markMessagesAsRead}>
  //           {loadingMessages ? (
  //             <p className="loading">Loading messages...</p>
  //           ) : messages.length === 0 ? (
  //             <div className="no-messages">
  //               <p>No messages yet. Start the conversation!</p>
  //             </div>
  //           ) : (
  //             <div className="messages">
  //               {messages.map((msg, index) => (
  //                 <div 
  //                   key={msg._id || index} 
  //                   className={`message-wrapper ${msg.sender === currentUser?._id ? 'outgoing' : 'incoming'}`}
  //                 >
  //                   <div className="message">
  //                     {msg.media && renderMedia(msg.media)}
  //                     <p className="message-text">{msg.text}</p>
  //                     <div className="message-meta">
  //                       <span className="message-time">{formatTime(msg.timestamp)}</span>
  //                       {msg.sender === currentUser?._id && renderMessageStatus(msg.status)}
  //                     </div>
  //                   </div>
  //                 </div>
  //               ))}
  //               <div ref={messagesEndRef} />
  //             </div>
  //           )}
  //         </div>
          
  //         {/* Media Preview */}
  //         {mediaPreview && (
  //           <div className="media-preview">
  //             {mediaPreview.type === 'image' ? (
  //               <img src={mediaPreview.url} alt="Preview" />
  //             ) : (
  //               <div className="file-preview">
  //                 <FaFile /> {mediaPreview.name}
  //               </div>
  //             )}
  //             <button onClick={() => {
  //               setMediaPreview(null);
  //               setMediaData(null);
  //             }}>Remove</button>
  //             {mediaUploading && <span className="uploading">Uploading...</span>}
  //           </div>
  //         )}
          
  //         {/* Message Input Area */}
  //         <div className="message-input-container">
  //           <button 
  //             className="attach-button" 
  //             onClick={() => fileInputRef.current.click()}
  //             title="Attach file"
  //           >
  //             <FaImage />
  //           </button>
  //           <input 
  //             type="file" 
  //             ref={fileInputRef} 
  //             onChange={handleFileSelect} 
  //             style={{ display: 'none' }} 
  //             accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
  //           />
  //           <textarea
  //             value={newMessage}
  //             onChange={(e) => setNewMessage(e.target.value)}
  //             onKeyPress={handleKeyPress}
  //             placeholder="Type a message..."
  //             rows={1}
  //             disabled={mediaUploading}
  //           />
  //           <button 
  //             className="send-button" 
  //             onClick={sendMessage}
  //             disabled={(!newMessage.trim() && !mediaData) || mediaUploading}
  //           >
  //             Send
  //           </button>
  //         </div>
  //       </div>
  //     )}
      
  //     {error && (
  //       <div className="error-toast">
  //         {error}
  //         <button onClick={() => setError("")}>×</button>
  //       </div>
  //     )}
  //   </div>
  // );
  return (
 
  <div className="instagram-chat-container" style={{
    backgroundColor: '#121212',
    color: '#fff',
    height: '90vh',
    width: '100%',
    maxWidth: '450px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  }}>
    {view === "conversations" ? (
      // Conversations View
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '15px',
          borderBottom: '1px solid #262626',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: 'bold',
            letterSpacing: '0.5px',
          }}>Messages</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ 
              fontSize: '20px', 
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V20M20 12H4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ 
              fontSize: '20px', 
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.18 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.18 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div style={{
          padding: '12px 15px',
          position: 'relative',
          borderBottom: '1px solid #262626',
          backgroundColor: '#1a1a1a',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#262626',
            borderRadius: '10px',
            padding: '8px 10px',
            position: 'relative',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ marginRight: '10px', opacity: 0.7 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                width: '100%',
                outline: 'none',
                fontSize: '14px',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a8a8a8',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Loading Indicator */}
        {loadingConversations && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '20px',
            alignItems: 'center',
          }}>
            <div style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              border: '3px solid rgba(79, 70, 229, 0.3)', 
              borderTop: '3px solid #4F46E5',
              animation: 'spin 1s linear infinite',
            }}></div>
            <style>
              {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
        )}
        
        {/* Search Results */}
        {searchTerm && users.length > 0 && (
          <div style={{
            padding: '5px 0',
            backgroundColor: '#121212',
            position: 'absolute',
            top: '115px',
            left: 0,
            right: 0,
            zIndex: 10,
            maxHeight: '50vh',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideDown 0.3s ease-out',
          }}>
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => initializeChat(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 15px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #262626',
                  transition: 'background-color 0.2s, transform 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#4F46E5',
                  background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '12px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 'bold',
                    marginBottom: '3px',
                    fontSize: '14px',
                  }}>
                    {user.username}
                  </div>
                  <div style={{ color: '#a8a8a8', fontSize: '13px' }}>
                    {user.email}
                  </div>
                </div>
              </div>
            ))}
            <style>
              {`@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}
            </style>
          </div>
        )}
        
        {/* Conversations List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0',
        }}>
          {loadingUsers && (
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
              color: '#a8a8a8',
              fontSize: '14px',
            }}>
              Searching users...
            </div>
          )}
          
          {!loadingConversations && conversations.length === 0 ? (
            <div style={{ 
              padding: '30px 20px',
              textAlign: 'center', 
              color: '#a8a8a8',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 120px)',
            }}>
              <div style={{ 
                marginBottom: '20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#262626',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.18 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.18 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#f1f1f1' 
              }}>
                No conversations yet
              </div>
              <div>
                Search for users to start chatting!
              </div>
              <button style={{
                background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                marginTop: '20px',
                cursor: 'pointer',
                transition: 'transform 0.2s, opacity 0.2s',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
              }}
              onClick={() => setSearchTerm('')}
              >
                Find Friends
              </button>
            </div>
          ) : (
            <div>
              {conversations.map((convo) => (
                <div 
                  key={convo.conversationId} 
                  onClick={() => openConversation(convo)}
                  style={{
                    display: 'flex',
                    padding: '15px',
                    borderBottom: '1px solid #262626',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: convo.unreadCount > 0 ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                    transform: 'translateX(0)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = convo.unreadCount > 0 ? 'rgba(79, 70, 229, 0.1)' : '#1a1a1a';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = convo.unreadCount > 0 ? 'rgba(79, 70, 229, 0.05)' : 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    position: 'relative',
                    marginRight: '12px',
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#4F46E5',
                      background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '20px',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                    }}>
                      {convo.otherUser.username.charAt(0).toUpperCase()}
                    </div>
                    {convo.otherUser.online && (
                      <div style={{
                        width: '14px',
                        height: '14px',
                        backgroundColor: '#00BA34',
                        borderRadius: '50%',
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        border: '2px solid #121212',
                        boxShadow: '0 0 0 2px rgba(0, 186, 52, 0.3)',
                      }}></div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}>
                      <span style={{
                        fontWeight: convo.unreadCount > 0 ? 'bold' : 'normal',
                        color: convo.unreadCount > 0 ? 'white' : '#f1f1f1',
                        fontSize: '15px',
                      }}>
                        {convo.otherUser.username}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: convo.unreadCount > 0 ? '#4F46E5' : '#a8a8a8',
                      }}>
                        {formatTime(convo.lastMessage?.timestamp)}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: convo.unreadCount > 0 ? '#f1f1f1' : '#a8a8a8',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        maxWidth: '85%',
                      }}>
                        {convo.lastMessage?.media ? (
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: '5px' }}>
                              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M7 10L12 15L17 10" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 15V3" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Sent a file
                          </span>
                        ) : (
                          convo.lastMessage?.text || "No messages yet"
                        )}
                      </p>
                      
                      {convo.unreadCount > 0 && (
                        <span style={{
                          background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          minWidth: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '0 5px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        }}>
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Swipe actions - hidden by default */}
                  <div style={{
                    position: 'absolute',
                    right: '-100px',
                    top: 0,
                    bottom: 0,
                    display: 'flex',
                    opacity: 0, // Hidden by default
                    transition: 'all 0.3s',
                  }}>
                    <button style={{
                      backgroundColor: '#7E22CE',
                      color: 'white',
                      border: 'none',
                      padding: '0 15px',
                      cursor: 'pointer',
                    }} onClick={(e) => archiveConversation(convo.conversationId, e)}>
                      Archive
                    </button>
                    <button style={{
                      backgroundColor: '#EF4444',
                      color: 'white',
                      border: 'none',
                      padding: '0 15px',
                      cursor: 'pointer',
                    }} onClick={(e) => deleteConversation(convo.conversationId, e)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ) : (
      // Chat View
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        animation: 'slideInRight 0.3s forwards',
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #262626',
          background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <button 
            onClick={() => setView("conversations")}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '5px',
              marginRight: '10px',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-3px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {selectedUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#4F46E5',
                background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontWeight: 'bold',
                marginRight: '12px',
                boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
              }}>
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: 'bold' 
                }}>
                  {selectedUser.username}
                </h2>
                <span style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'block',
                }}>
                  Active now
                </span>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '5px',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 5H21M3 12H21M3 19H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Messages Area */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 15px',
            display: 'flex',
            flexDirection: 'column',
            backgroundImage: 'linear-gradient(rgba(26, 26, 26, 0.7), rgba(18, 18, 18, 0.9))',
            backgroundSize: 'cover',
          }}
          onClick={markMessagesAsRead}
        >
          {loadingMessages ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                border: '3px solid rgba(79, 70, 229, 0.2)', 
                borderTop: '3px solid #4F46E5',
                animation: 'spin 1s linear infinite',
              }}></div>
              <div style={{ color: '#a8a8a8', fontSize: '14px' }}>
                Loading messages...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              textAlign: 'center',
              color: '#a8a8a8',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#262626',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.18 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.18 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ 
                margin: '0 0 10px', 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: '#f1f1f1', 
              }}>
                No messages yet
              </p>
              <p style={{ margin: 0, fontSize: '14px', maxWidth: '230px' }}>
                Start the conversation with {selectedUser?.username}!
              </p>
              <button style={{
                background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
                border: 'none',
                borderRadius: '20px',
                color: 'white',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                marginTop: '20px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
              }}
              onClick={() => document.querySelector('textarea').focus()}
              >
                Send a message
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ 
                textAlign: 'center', 
                margin: '10px 0', 
                fontSize: '12px', 
                color: '#a8a8a8' 
              }}>
                {new Date().toDateString()}
              </div>
              
              {messages.map((msg, index) => {
                // This is the key change - determining if message is outgoing based on sender ID
                // comparing with the current user's ID, not just relying on the message property
                const isOutgoing = msg.sender === currentUser?._id;
                
                return (
                  <div 
                    key={msg._id || index} 
                    style={{
                      alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      position: 'relative',
                      animation: isOutgoing 
                        ? 'slideInRight 0.3s ease-out forwards' 
                        : 'slideInLeft 0.3s ease-out forwards',
                      transform: isOutgoing ? 'translateX(20px)' : 'translateX(-20px)',
                      opacity: 0,
                    }}
                  >
                    <div style={{
                      backgroundColor: isOutgoing 
                        ? '#4F46E5' 
                        : '#262626',
                      borderRadius: '18px',
                      padding: msg.media ? '2px' : '10px 15px',
                      position: 'relative',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      border: isOutgoing ? 'none' : '1px solid #333',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                    }}
                    >
                      {msg.media && (
                        <div style={{
                          borderRadius: '18px',
                          overflow: 'hidden',
                          width: '200px',
                          maxWidth: '100%',
                        }}>
                          <img 
                            src={msg.media.url} 
                            alt="Media" 
                            style={{
                              width: '100%',
                              display: 'block',
                              transition: 'transform 0.3s',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.03)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          />
                        </div>
                      )}
                      
                      {msg.text && (
                        <p style={{
                          margin: msg.media ? '8px 12px' : 0,
                          fontSize: '14px',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                        }}>
                          {msg.text}
                        </p>
                      )}
                    </div>
                    
                    <div style={{
                      fontSize: '11px',
                      marginTop: '4px',
                      textAlign: isOutgoing ? 'right' : 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                      gap: '4px',
                      color: '#a8a8a8',
                      padding: '0 4px',
                    }}>
                      {formatTime(msg.timestamp)}
                      {isOutgoing && (
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {msg.status === 'sent' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13L9 17L19 7" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {msg.status === 'delivered' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13L9 17L19 7M7 13L11 17L21 7" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {msg.status === 'read' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13L9 17L19 7M7 13L11 17L21 7" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
              <style>
                {`
                  @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                  }
                  @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                  }
                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                  }
                `}
              </style>
            </div>
          )}
        </div>
        
        {/* Media Preview */}
        {mediaPreview && (
          <div style={{
            padding: '10px 15px',
            borderTop: '1px solid #262626',
            backgroundColor: '#1a1a1a',
            animation: 'slideUp 0.3s forwards',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              {mediaPreview.type === 'image' ? (
                <img 
                  src={mediaPreview.url} 
                  alt="Preview" 
                  style={{
                    height: '60px',
                    width: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ) : (
                <div style={{
                  backgroundColor: '#262626',
                  padding: '10px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: '14px' }}>{mediaPreview.name}</span>
                </div>
              )}
              
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                {mediaUploading && (
                  <span style={{ color: '#a8a8a8', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '14px', 
                      height: '14px', 
                      borderRadius: '50%', 
                      border: '2px solid rgba(79, 70, 229, 0.3)', 
                      borderTop: '2px solid #4F46E5',
                      animation: 'spin 1s linear infinite',
                      marginRight: '6px',
                    }}></div>
                    Uploading...
                  </span>
                )}
                
                <button 
                  onClick={() => {
                    setMediaPreview(null);
                    setMediaData(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Remove
                </button>
              </div>
            </div>
            <style>
              {`@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}
            </style>
          </div>
        )}
        
        {/* Message Input Area */}
        <div style={{
          padding: '12px 15px',
          borderTop: '1px solid #262626',
          backgroundColor: '#121212',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.5s',
        }}>
          <button 
            onClick={() => fileInputRef.current.click()}
            style={{
              background: 'none',
              border: 'none',
              color: '#4F46E5',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'transform 0.2s, background-color 0.2s',
            }}
            disabled={mediaUploading}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 16L8.586 11.414C8.96121 11.0391 9.46985 10.8284 10 10.8284C10.5302 10.8284 11.0388 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9612 12.0391 16.4698 11.8284 17 11.8284C17.5302 11.8284 18.0388 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            style={{ display: 'none' }} 
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          
          <div style={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#262626',
            borderRadius: '24px',
            padding: '8px 12px',
            transition: 'box-shadow 0.3s',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
          }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px rgba(79, 70, 229, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.2)'}
          >
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message..."
              style={{
                // width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                resize: 'none',
                outline: 'none',
                padding: '4px 0',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                height: '24px',
                maxHeight: '80px',
                overflow: 'auto',
              }}
              disabled={mediaUploading}
              onFocus={(e) => e.currentTarget.parentElement.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.3), inset 0 1px 3px rgba(0,0,0,0.2)'}
              onBlur={(e) => e.currentTarget.parentElement.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.2)'}
            />
          </div>
          
          {(newMessage.trim() || mediaData) && !mediaUploading ? (
            <button 
              onClick={sendMessage}
              style={{
                background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '20px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
              }}
            >
              Send
            </button>
          ) : (
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#4F46E5',
                cursor: 'pointer',
                padding: '8px',
                opacity: mediaUploading ? 0.5 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'transform 0.2s, background-color 0.2s',
                borderRadius: '50%',
              }}
              disabled={mediaUploading}
              onMouseOver={(e) => {
                if (!mediaUploading) {
                  e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 10C19 11.1 19.9 12 21 12V8C19.9 8 19 8.9 19 10ZM7 11H17V9H7V11ZM12 16C14.21 16 16 14.21 16 12H8C8 14.21 9.79 16 12 16ZM14 19H10C9.45 19 9 19.45 9 20H15C15 19.45 14.55 19 14 19ZM3 10C3 8.9 2.1 8 1 8V12C2.1 12 3 11.1 3 10Z" fill="#4F46E5"/>
                <path d="M18 6H17.08C16.45 4.19 14.86 2.86 12.93 2.23C12.6 1.3 11.76 0.64 10.75 0.64C9.61 0.64 8.69 1.47 8.55 2.55C6.41 3.29 4.67 4.89 4 6H3C1.34 6 0 7.34 0 9V11C0 12.66 1.34 14 3 14C3 17.31 5.69 20 9 20H15C18.31 20 21 17.31 21 14C22.66 14 24 12.66 24 11V9C24 7.34 22.66 6 21 6H18ZM16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12H16ZM7 11V9H17V11H7ZM14 19H10C9.45 19 9 19.45 9 20H15C15 19.45 14.55 19 14 19ZM21 12C19.9 12 19 11.1 19 10C19 8.9 19.9 8 21 8V12ZM3 12V8C1.9 8 1 8.9 1 10C1 11.1 1.9 12 3 12Z" fill="#4F46E5"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    )}
    
    {/* Error Toast */}
    {error && (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        zIndex: 100,
        animation: 'fadeIn 0.3s forwards',
        maxWidth: '90%',
      }}>
        <span style={{ marginRight: '15px', fontSize: '14px' }}>{error}</span>
        <button 
          onClick={() => setError("")}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 5px',
          }}
        >
          ×
        </button>
      </div>
    )}
    
    {/* Success Toast */}
    {successMessage && (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        zIndex: 100,
        animation: 'fadeIn 0.3s forwards',
        maxWidth: '90%',
      }}>
        <span style={{ marginRight: '15px', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {successMessage}
        </span>
        <button 
          onClick={() => setSuccessMessage("")}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 5px',
          }}
        >
          ×
        </button>
      </div>
    )}
  </div>
);
}

export default Notifications;
