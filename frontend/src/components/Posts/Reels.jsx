// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import './Reels.css';

// function Reels() {
//   const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const videoRefs = useRef([]);
//   const { id } = useParams();

//   // Fetch posts with videos
//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const response = await fetch(`${Backend_Url}/talk`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch posts");
//         }
//         const data = await response.json();
//         setPosts(data.filter(post => post.video)); // Filter only posts with videos
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPosts();
//   }, [Backend_Url]);

//   // Intersection Observer to handle video play/pause
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           const video = entry.target;
//           if (entry.isIntersecting) {
//             // Play the video if it's in the viewport
//             video.play().catch((error) => console.error("Autoplay failed:", error));
//           } else {
//             // Pause the video if it's out of the viewport
//             video.pause();
//           }
//         });
//       },
//       {
//         threshold: 0.8, // Trigger when 80% of the video is visible
//       }
//     );

//     // Observe all video elements
//     videoRefs.current.forEach((video) => {
//       if (video) observer.observe(video);
//     });

//     // Cleanup the observer
//     return () => {
//       videoRefs.current.forEach((video) => {
//         if (video) observer.unobserve(video);
//       });
//     };
//   }, [posts]);

//   const togglePlayPause = (event) => {
//     const video = event.currentTarget;
//     if (video.paused) {
//       video.muted = false;
//       video.play().catch((error) => console.error("Play failed:", error));
//     } else {
//       video.pause();
//     }
//   };

//   if (loading) return <div className="text-center">Loading...</div>;
//   if (error) return <div className="text-center text-red-500">Error: {error}</div>;

//   return (
//     <div className="reels-container">
//       {posts.map((post, index) => (
//         <div key={post._id} className="reel">
//           <video
//             ref={(el) => (videoRefs.current[index] = el)} // Attach ref to the video element
//             autoPlay={index === 0} // Autoplay the first video
//             muted={index !== 0} // Mute all videos except the first one
//             playsInline
//             className="reel-video"
//             onClick={togglePlayPause}
//           >
//             <source src={post.video} type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//           <div className="reel-details">
//             <img
//               src={post.owner.profile || "default-profile.png"}
//               alt={post.owner.username}
//               className="reel-avatar"
//             />
//             <p className="reel-username">{post.owner.username}</p>
//             <p className="reel-description">{post.description}</p>
//           </div>
//           <div className="reel-actions">
//             <button className="reel-action-button">
//               <i className="fas fa-heart"></i> {/* Like icon */}
//               <span>{post.likes || 0}</span>
//             </button>
//             <button className="reel-action-button">
//               <i className="fas fa-comment"></i> {/* Comment icon */}
//               <span>{post.comments || 0}</span>
//             </button>
//             <button className="reel-action-button">
//               <i className="fas fa-share"></i> {/* Share icon */}
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default Reels;
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import './Reels.css';

function Reels() {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [showComments, setShowComments] = useState(null);
  const videoRefs = useRef([]);
  const reelsContainerRef = useRef(null);
  const { id } = useParams();

  // Sample comments data (would normally come from API)
  const dummyComments = {
    comment1: { username: "user123", text: "Amazing content! 🔥", timestamp: "2h ago" },
    comment2: { username: "creativesoul", text: "This is so inspiring!", timestamp: "5h ago" },
    comment3: { username: "digital_nomad", text: "Where was this filmed?", timestamp: "1d ago" },
    comment4: { username: "tech_enthusiast", text: "What equipment did you use?", timestamp: "2d ago" },
    comment5: { username: "travel_addict", text: "Added to my bucket list ✈️", timestamp: "3d ago" },
  };

  // Fetch posts with videos
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${Backend_Url}/talk`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        // Filter only posts with videos and add dummy engagement metrics
        const postsWithVideos = data
          .filter(post => post.video)
          .map(post => ({
            ...post,
            likes: post.likes || Math.floor(Math.random() * 10000),
            comments: post.comments || Math.floor(Math.random() * 500),
            shares: Math.floor(Math.random() * 300),
            savedBy: Math.floor(Math.random() * 200),
            description: post.description || "Check out this amazing content! #trending #viral #content #fyp Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl."
          }));
        setPosts(postsWithVideos);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [Backend_Url]);

  // Scroll snap and play/pause videos
  useEffect(() => {
    if (!reelsContainerRef.current || posts.length === 0) return;

    const handleScroll = () => {
      if (!reelsContainerRef.current) return;
      
      const containerHeight = reelsContainerRef.current.clientHeight;
      const scrollPosition = reelsContainerRef.current.scrollTop;
      const newIndex = Math.round(scrollPosition / containerHeight);
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    const container = reelsContainerRef.current;
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [posts.length, currentIndex]);

  // Control video playback based on current index
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      
      if (index === currentIndex) {
        video.currentTime = 0;
        video.play().catch(err => console.error("Autoplay failed:", err));
        video.muted = false;
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex]);

  // Handle tap to play/pause
  const togglePlayPause = (event, index) => {
    event.stopPropagation();
    const video = videoRefs.current[index];
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(err => console.error("Play failed:", err));
    } else {
      video.pause();
    }
  };

  // Handle double tap for like animation
  const handleDoubleTap = (event, postId) => {
    event.stopPropagation();
    
    if (!likedPosts[postId]) {
      const heart = document.createElement('div');
      heart.className = 'heart-animation';
      heart.style.left = `${event.clientX - 50}px`;
      heart.style.top = `${event.clientY - 50}px`;
      document.body.appendChild(heart);
      
      // Remove the heart element after animation completes
      setTimeout(() => {
        document.body.removeChild(heart);
      }, 1000);
      
      // Toggle like
      handleLike(postId);
    }
  };

  // Toggle description expand/collapse
  const toggleDescription = (postId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Toggle like
  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newState = { ...prev };
      newState[postId] = !prev[postId];
      
      // Update like count in posts
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                likes: newState[postId] 
                  ? post.likes + 1 
                  : post.likes - 1 
              } 
            : post
        )
      );
      
      return newState;
    });
  };

  // Toggle comments section
  const toggleComments = (postId) => {
    setShowComments(prev => prev === postId ? null : postId);
  };

  // Handle sharing
  const handleShare = () => {
    // Placeholder for share functionality
    alert("Share functionality would be implemented here");
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading reels...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p>Error: {error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Retry
      </button>
    </div>
  );

  return (
    <div className="reels-page">
      <div className="reels-container" ref={reelsContainerRef}>
        {posts.map((post, index) => (
          <div key={post._id} className="reel">
            <div 
              className="video-container"
              onClick={(e) => togglePlayPause(e, index)}
              onDoubleClick={(e) => handleDoubleTap(e, post._id)}
            >
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                loop
                playsInline
                className="reel-video"
              >
                <source src={post.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Pause/play indicator */}
              <div className={`video-status ${videoRefs.current[index]?.paused ? 'visible' : ''}`}>
                <div className="play-icon">▶</div>
              </div>
            </div>

            {/* User info and description */}
            <div className="reel-details">
              <div className="user-info">
                <img
                  src={post.owner.profile || "https://via.placeholder.com/40"}
                  alt={post.owner.username}
                  className="reel-avatar"
                />
                <p className="reel-username">{post.owner.username}</p>
                <button className="follow-button">Follow</button>
              </div>
              
              <div className="reel-description-container" onClick={() => toggleDescription(post._id)}>
                <p className={`reel-description ${expandedDescriptions[post._id] ? 'expanded' : ''}`}>
                  {post.description}
                </p>
                {!expandedDescriptions[post._id] && post.description.length > 50 && (
                  <span className="more-text">... more</span>
                )}
              </div>
              
              {/* Music info */}
              <div className="music-info">
                <div className="music-icon">♫</div>
                <p className="music-text">{post.owner.username} • Original Audio</p>
              </div>
            </div>

            {/* Interaction buttons */}
            <div className="reel-actions">
              <button 
                className={`reel-action-button ${likedPosts[post._id] ? 'liked' : ''}`}
                onClick={() => handleLike(post._id)}
              >
                <div className="action-icon heart-icon">
                  {likedPosts[post._id] ? '❤️' : '🤍'}
                </div>
                <span>{post.likes.toLocaleString()}</span>
              </button>
              
              <button 
                className="reel-action-button"
                onClick={() => toggleComments(post._id)}
              >
                <div className="action-icon">💬</div>
                <span>{post.comments.toLocaleString()}</span>
              </button>
              
              <button 
                className="reel-action-button"
                onClick={handleShare}
              >
                <div className="action-icon">↗️</div>
                <span>{post.shares.toLocaleString()}</span>
              </button>
              
              <button className="reel-action-button">
                <div className="action-icon">🔖</div>
                <span>{post.savedBy.toLocaleString()}</span>
              </button>
              
              <button className="reel-action-button more-options">
                <div className="action-icon">•••</div>
              </button>
            </div>
            
            {/* Comments section */}
            <div className={`comments-section ${showComments === post._id ? 'show' : ''}`}>
              <div className="comments-header">
                <h3>Comments</h3>
                <button className="close-comments" onClick={() => setShowComments(null)}>✕</button>
              </div>
              
              <div className="comments-list">
                {Object.values(dummyComments).map((comment, idx) => (
                  <div key={idx} className="comment">
                    <img 
                      src={`https://via.placeholder.com/30?text=${comment.username.charAt(0)}`} 
                      alt={comment.username} 
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <p className="comment-username">{comment.username}</p>
                      <p className="comment-text">{comment.text}</p>
                      <p className="comment-timestamp">{comment.timestamp}</p>
                    </div>
                    <button className="comment-like">🤍</button>
                  </div>
                ))}
              </div>
              
              <div className="add-comment">
                <img 
                  src="https://via.placeholder.com/30?text=ME" 
                  alt="Your profile" 
                  className="comment-avatar"
                />
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="comment-input"
                />
                <button className="post-comment-btn">Post</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reels;