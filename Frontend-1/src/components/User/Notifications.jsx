import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaImage, FaFile, FaCheck, FaCheckDouble } from "react-icons/fa";
import "./Notifications.css";

const Backend_Url = "http://localhost:8080"; //import.meta.env.VITE_API_BASE_URL;
const WebSocket_Url = `ws://localhost:8080?token=${localStorage.getItem("token")}`; // Add token to WebSocket URL

function Notifications() {
  const navigate = useNavigate();
  const { receiverId } = useParams();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);

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
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Check authentication and get current user
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
  }, [navigate]);

  // WebSocket setup
  useEffect(() => {
    if (!currentUser) return;

    // Close existing connection if it exists
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket(WebSocket_Url);
    wsRef.current = ws;

    // WebSocket event handlers
    ws.onopen = () => {
      console.log("WebSocket connection established");
      
      // Authenticate the WebSocket connection
      const token = localStorage.getItem("token");
      if (token) {
        ws.send(JSON.stringify({
          type: 'authenticate',
          token: token
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'authenticated':
            console.log(`✅ Authenticated as user: ${data.userId}`);
            break;
            
          case 'error':
            console.error("WebSocket error:", data.message);
            setError(data.message);
            break;
            
          case 'newMessage':
            handleNewMessage(data);
            break;
            
          case 'userTyping':
            if (data.senderId === selectedUser?._id) {
              setOtherUserTyping(data.isTyping);
            }
            break;
            
          case 'messageSent':
            // Update the status of the sent message
            if (conversationId === data.conversationId) {
              setMessages(prev => 
                prev.map(msg => 
                  msg._id === data.messageId 
                    ? { ...msg, status: data.status } 
                    : msg
                )
              );
            }
            break;
            
          case 'messagesRead':
            if (conversationId === data.conversationId) {
              setMessages(prev => 
                prev.map(msg => 
                  msg.sender === currentUser._id 
                    ? { ...msg, status: 'read' } 
                    : msg
                )
              );
            }
            break;
            
          case 'messagesDelivered':
            if (conversationId === data.conversationId) {
              setMessages(prev => 
                prev.map(msg => 
                  msg.sender === currentUser._id && msg.status === 'sent' 
                    ? { ...msg, status: 'delivered' } 
                    : msg
                )
              );
            }
            break;
            
          case 'userStatusChange':
            // Update user's online status in the UI if needed
            break;
            
          case 'userInConversation':
          case 'userLeftConversation':
            // Handle user presence in conversation
            break;
            
          default:
            console.log("Unhandled message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
    };

    // Clean up on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [currentUser]);

  // Handle receiving new messages
  const handleNewMessage = (data) => {
    // If this is the currently active conversation, add the message
    if (data.conversationId === conversationId) {
      setMessages((prev) => [
        ...prev,
        {
          _id: data.messageId,
          text: data.content,
          sender: data.senderId,
          status: "delivered",
          timestamp: data.timestamp || new Date(),
          media: data.mediaType && data.mediaUrl 
            ? { type: data.mediaType, url: data.mediaUrl } 
            : null
        },
      ]);
      
      // Mark as delivered immediately
      markMessagesAsDelivered(data.conversationId);
    } else {
      // If not the active conversation, update the conversation list
      fetchConversations();
    }
  };

  // Load conversations
  useEffect(() => {
    if (!currentUser) return;

    fetchConversations();
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

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle entering a conversation
  useEffect(() => {
    if (conversationId && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'enterConversation',
        conversationId: conversationId
      }));
      
      // Mark messages as read when entering a conversation
      markMessagesAsRead();
    }
    
    return () => {
      if (conversationId && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'leaveConversation',
          conversationId: conversationId
        }));
      }
    };
  }, [conversationId]);

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
    
    fetch(`${Backend_Url}/chat/messages/${conversation.otherUser._id}`, { // Ensure the URL matches the backend route
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
  const sendMessage = () => {
    if ((!newMessage.trim() && !mediaData) || !selectedUser || !currentUser) return;

    // Add temporary message to UI
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      text: newMessage.trim(),
      sender: currentUser._id,
      status: "sending",
      timestamp: new Date(),
      media: mediaData
    };
    
    setMessages(prev => [...prev, tempMessage]);

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'sendMessage',
        receiverId: selectedUser._id,
        content: newMessage.trim(),
        mediaType: mediaData?.type,
        mediaUrl: mediaData?.url
      }));
      
      // Reset input fields
      setNewMessage("");
      setMediaPreview(null);
      setMediaData(null);
    } else {
      // Handle case when WebSocket is not connected
      setError("Connection lost. Please refresh the page.");
      
      // Remove temporary message
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
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

  // Handle typing indicator
  const handleTyping = () => {
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Only send typing indicator if not already typing
    if (!isTyping && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        receiverId: selectedUser._id,
        isTyping: true
      }));
    }
    
    // Set timeout to clear typing state after 3 seconds
    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'typing',
          receiverId: selectedUser._id,
          isTyping: false
        }));
      }
    }, 3000);
    
    setTypingTimeout(timeout);
  };

  // Mark messages as delivered
  const markMessagesAsDelivered = (convoId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'messagesDelivered',
        senderId: selectedUser?._id,
        receiverId: currentUser._id,
        conversationId: convoId || conversationId
      }));
    }
  };

  // Mark messages as read
  const markMessagesAsRead = () => {
    if (!conversationId || !selectedUser || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'messageRead',
      senderId: selectedUser._id,
      receiverId: currentUser._id,
      conversationId: conversationId
    }));
  };

  // Fetch conversations
  const fetchConversations = async () => {
    if (!currentUser) return;
    
    setLoadingConversations(true);
    const token = localStorage.getItem("token");
    
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
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setError("Failed to load conversations");
    } finally {
      setLoadingConversations(false);
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
    } else {
      // Trigger typing indicator
      handleTyping();
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
      case 'sending':
        return <span className="message-status">⋯</span>;
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
                {otherUserTyping && (
                  <div className="typing-indicator">
                    <span>{selectedUser?.username} is typing...</span>
                  </div>
                )}
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