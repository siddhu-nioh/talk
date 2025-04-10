import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaImage, FaFile, FaCheck, FaCheckDouble } from "react-icons/fa";
import { io } from "socket.io-client";
import "./Notifications.css";

const Backend_Url = "http://localhost:8080"; //import.meta.env.VITE_API_BASE_URL;

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

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      {view === "conversations" ? (
        // Conversations View
        <div className="conversations-view">
          <h1>Messages</h1>
          
          {/* Search Bar */}
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for users..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {loadingUsers && <p className="loading">Searching...</p>}
          
          {/* Search results */}
          {searchTerm && users.length > 0 && (
            <div className="search-results">
              <h3>Search Results</h3>
              {users.map((user) => (
                <div
                  key={user._id}
                  className="user-item"
                  onClick={() => initializeChat(user)}
                >
                  <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  <div className="user-details">
                    <span className="username">{user.username}</span>
                    <span className="email">{user.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Conversations list */}
          <div className="conversations-list">
            <h3>Recent Conversations</h3>
            {loadingConversations ? (
              <p className="loading">Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <p className="no-data">No conversations yet. Search for a user to start chatting!</p>
            ) : (
              conversations.map((convo) => (
                <div 
                  key={convo.conversationId} 
                  className={`conversation-item ${convo.unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => openConversation(convo)}
                >
                  <div className="user-avatar">
                    {convo.otherUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <span className="username">{convo.otherUser.username}</span>
                      <span className="timestamp">{formatTime(convo.lastMessage?.timestamp)}</span>
                    </div>
                    <div className="conversation-preview">
                      <p className="preview-text">
                        {convo.lastMessage?.media ? (
                          <><FaFile /> Media attachment</>
                        ) : (
                          convo.lastMessage?.text || "No messages yet"
                        )}
                      </p>
                      {convo.unreadCount > 0 && (
                        <span className="unread-badge">{convo.unreadCount}</span>
                      )}
                    </div>
                  </div>
                  <div className="conversation-actions">
                    <button 
                      className="archive-btn" 
                      onClick={(e) => archiveConversation(convo.conversationId, e)}
                      title="Archive"
                    >
                      Archive
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={(e) => deleteConversation(convo.conversationId, e)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Chat View
        <div className="chat-view">
          {/* Chat Header */}
          <div className="chat-header">
            <button className="back-button" onClick={() => setView("conversations")}>
              <FaArrowLeft /> Back
            </button>
            {selectedUser && (
              <div className="selected-user">
                <div className="user-avatar">{selectedUser.username.charAt(0).toUpperCase()}</div>
                <h2>{selectedUser.username}</h2>
              </div>
            )}
          </div>
          
          {/* Messages Area */}
          <div className="messages-container" onClick={markMessagesAsRead}>
            {loadingMessages ? (
              <p className="loading">Loading messages...</p>
            ) : messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="messages">
                {messages.map((msg, index) => (
                  <div 
                    key={msg._id || index} 
                    className={`message-wrapper ${msg.sender === currentUser?._id ? 'outgoing' : 'incoming'}`}
                  >
                    <div className="message">
                      {msg.media && renderMedia(msg.media)}
                      <p className="message-text">{msg.text}</p>
                      <div className="message-meta">
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                        {msg.sender === currentUser?._id && renderMessageStatus(msg.status)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Media Preview */}
          {mediaPreview && (
            <div className="media-preview">
              {mediaPreview.type === 'image' ? (
                <img src={mediaPreview.url} alt="Preview" />
              ) : (
                <div className="file-preview">
                  <FaFile /> {mediaPreview.name}
                </div>
              )}
              <button onClick={() => {
                setMediaPreview(null);
                setMediaData(null);
              }}>Remove</button>
              {mediaUploading && <span className="uploading">Uploading...</span>}
            </div>
          )}
          
          {/* Message Input Area */}
          <div className="message-input-container">
            <button 
              className="attach-button" 
              onClick={() => fileInputRef.current.click()}
              title="Attach file"
            >
              <FaImage />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              style={{ display: 'none' }} 
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              disabled={mediaUploading}
            />
            <button 
              className="send-button" 
              onClick={sendMessage}
              disabled={(!newMessage.trim() && !mediaData) || mediaUploading}
            >
              Send
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}
    </div>
  );
}

export default Notifications;