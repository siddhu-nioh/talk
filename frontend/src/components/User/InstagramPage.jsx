import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaRegBookmark, FaArrowLeft } from 'react-icons/fa';
import './InstagramPage.css'; // We'll define this CSS file below

const InstagramPostPage = ({ posts, user, onClose, initialPostId }) => {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Find the index of the initially selected post
    if (initialPostId) {
      const index = posts.findIndex(post => post._id === initialPostId);
      if (index !== -1) {
        setCurrentPostIndex(index);
      }
    }
    // Initialize with any existing likes data
    const initialLikes = {};
    posts.forEach(post => {
      initialLikes[post._id] = false; // Default all to not liked
    });
    setLikedPosts(initialLikes);
  }, [posts, initialPostId]);

  const handleLike = (postId) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = (postId) => {
    if (newComment.trim()) {
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), { 
          id: Date.now(),
          username: user.username,
          text: newComment
        }]
      }));
      setNewComment('');
    }
  };

  // Add this function in your component
const handleDoubleTap = (postId) => {
    // Only trigger if not already liked
    if (!likedPosts[postId]) {
      handleLike(postId);
      
      // Trigger heart animation
      const heartElement = document.querySelector(`#heart-${postId} .heart-animation`);
      heartElement.classList.add('active');
      
      // Remove the class after animation completes
      setTimeout(() => {
        heartElement.classList.remove('active');
      }, 1000);
    }
  };
  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    }
  };

  const handlePrevPost = () => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
    }
  };

  const currentPost = posts[currentPostIndex];
  
  if (!currentPost) return null;

  return (
    <div className="instagram-post-page">
      <header className="post-page-header">
        <button className="back-button" onClick={onClose}>
          <FaArrowLeft />
        </button>
        <h1>Posts</h1>
      </header>
      
      <div className="post-page-content">
        <div className="post-container">
          <div className="post-header">
            <div className="post-user-info">
              <img src={user.profile} alt={user.username} className="user-pic" />
              <span className="username">{user.username}</span>
            </div>
          </div>
          
          <div className="post-media">
            {currentPost.image ? (
              <img 
              src={currentPost.image} 
              alt="Post" 
              className="post-image"
              onDoubleClick={() => handleDoubleTap(currentPost._id)}
            />
            
            // And for video:
           
            ) : currentPost.video ? (
                <video 
                controls 
                className="post-video"
                onDoubleClick={() => handleDoubleTap(currentPost._id)}
              >
                <source src={currentPost.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : null}
            
            {/* Post navigation buttons */}
            {currentPostIndex > 0 && (
              <button className="nav-btn prev-btn" onClick={handlePrevPost}>
                <span>‹</span>
              </button>
            )}
            {currentPostIndex < posts.length - 1 && (
              <button className="nav-btn next-btn" onClick={handleNextPost}>
                <span>›</span>
              </button>
            )}

            {/* Like animation overlay */}
            <div className="heart-animation-container" id={`heart-${currentPost._id}`}>
              <FaHeart className="heart-animation" />
            </div>
          </div>
          
          <div className="post-actions">
            <div className="post-action-buttons">
              <button 
                className={`action-btn ${likedPosts[currentPost._id] ? 'active' : ''}`} 
                onClick={() => handleLike(currentPost._id)}
              >
                {likedPosts[currentPost._id] ? <FaHeart /> : <FaRegHeart />}
              </button>
              {/* <button className="action-btn">
                <FaRegComment />
              </button>
              <button className="action-btn">
                <FaShare />
              </button>
              <button className="action-btn bookmark">
                <FaRegBookmark />
              </button> */}
            </div>
            
            <div className="post-likes">
              {(currentPost.likes || 0) + (likedPosts[currentPost._id] ? 1 : 0)} likes
            </div>
            
            <div className="post-caption">
              <span className="username">{user.username}</span> {currentPost.description || "No caption"}
            </div>
            
            <div className="post-date">
              {new Date(currentPost.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })}
            </div>
            
            {/* <div className="post-comments">
              {comments[currentPost._id]?.map(comment => (
                <div key={comment.id} className="comment">
                  <span className="username">{comment.username}</span> {comment.text}
                </div>
              ))}
            </div> */}
            
            {/* <div className="add-comment">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                value={newComment}
                onChange={handleCommentChange}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(currentPost._id)}
              />
              <button 
                className="post-btn"
                onClick={() => handleAddComment(currentPost._id)}
              >
                Post
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramPostPage;