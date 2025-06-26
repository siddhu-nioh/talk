
// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import './Reels.css';

// function Reels() {
//   const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [expandedDescriptions, setExpandedDescriptions] = useState({});
//   const [likedPosts, setLikedPosts] = useState({});
//   const [showComments, setShowComments] = useState(null);
//   const videoRefs = useRef([]);
//   const reelsContainerRef = useRef(null);
//   const { id } = useParams();

//   // Sample comments data (would normally come from API)
//   const dummyComments = {
//     comment1: { username: "user123", text: "Amazing content! 🔥", timestamp: "2h ago" },
//     comment2: { username: "creativesoul", text: "This is so inspiring!", timestamp: "5h ago" },
//     comment3: { username: "digital_nomad", text: "Where was this filmed?", timestamp: "1d ago" },
//     comment4: { username: "tech_enthusiast", text: "What equipment did you use?", timestamp: "2d ago" },
//     comment5: { username: "travel_addict", text: "Added to my bucket list ✈️", timestamp: "3d ago" },
//   };

//   // Fetch posts with videos
//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const response = await fetch(`${Backend_Url}/talk`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch posts");
//         }
//         const data = await response.json();
//         // Filter only posts with videos and add dummy engagement metrics
//         const postsWithVideos = data
//           .filter(post => post.video)
//           .map(post => ({
//             ...post,
//             likes: post.likes || Math.floor(Math.random() * 10000),
//             comments: post.comments || Math.floor(Math.random() * 500),
//             shares: Math.floor(Math.random() * 300),
//             savedBy: Math.floor(Math.random() * 200),
//             description: post.description || "Check out this amazing content! #trending #viral #content #fyp Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl."
//           }));
//         setPosts(postsWithVideos);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPosts();
//   }, [Backend_Url]);

//   // Scroll snap and play/pause videos
//   useEffect(() => {
//     if (!reelsContainerRef.current || posts.length === 0) return;

//     const handleScroll = () => {
//       if (!reelsContainerRef.current) return;
      
//       const containerHeight = reelsContainerRef.current.clientHeight;
//       const scrollPosition = reelsContainerRef.current.scrollTop;
//       const newIndex = Math.round(scrollPosition / containerHeight);
      
//       if (newIndex !== currentIndex) {
//         setCurrentIndex(newIndex);
//       }
//     };

//     const container = reelsContainerRef.current;
//     container.addEventListener('scroll', handleScroll);
    
//     return () => {
//       if (container) {
//         container.removeEventListener('scroll', handleScroll);
//       }
//     };
//   }, [posts.length, currentIndex]);

//   // Control video playback based on current index
//   useEffect(() => {
//     videoRefs.current.forEach((video, index) => {
//       if (!video) return;
      
//       if (index === currentIndex) {
//         video.currentTime = 0;
//         video.play().catch(err => console.error("Autoplay failed:", err));
//         video.muted = false;
//       } else {
//         video.pause();
//         video.currentTime = 0;
//       }
//     });
//   }, [currentIndex]);

//   // Handle tap to play/pause
//   const togglePlayPause = (event, index) => {
//     event.stopPropagation();
//     const video = videoRefs.current[index];
//     if (!video) return;
    
//     if (video.paused) {
//       video.play().catch(err => console.error("Play failed:", err));
//     } else {
//       video.pause();
//     }
//   };

//   // Handle double tap for like animation
//   const handleDoubleTap = (event, postId) => {
//     event.stopPropagation();
    
//     if (!likedPosts[postId]) {
//       const heart = document.createElement('div');
//       heart.className = 'heart-animation';
//       heart.style.left = `${event.clientX - 50}px`;
//       heart.style.top = `${event.clientY - 50}px`;
//       document.body.appendChild(heart);
      
//       // Remove the heart element after animation completes
//       setTimeout(() => {
//         document.body.removeChild(heart);
//       }, 1000);
      
//       // Toggle like
//       handleLike(postId);
//     }
//   };

//   // Toggle description expand/collapse
//   const toggleDescription = (postId) => {
//     setExpandedDescriptions(prev => ({
//       ...prev,
//       [postId]: !prev[postId]
//     }));
//   };

//   // Toggle like
//   const handleLike = (postId) => {
//     setLikedPosts(prev => {
//       const newState = { ...prev };
//       newState[postId] = !prev[postId];
      
//       // Update like count in posts
//       setPosts(prevPosts => 
//         prevPosts.map(post => 
//           post._id === postId 
//             ? { 
//                 ...post, 
//                 likes: newState[postId] 
//                   ? post.likes + 1 
//                   : post.likes - 1 
//               } 
//             : post
//         )
//       );
      
//       return newState;
//     });
//   };

//   // Toggle comments section
//   const toggleComments = (postId) => {
//     setShowComments(prev => prev === postId ? null : postId);
//   };

//   // Handle sharing
//   const handleShare = () => {
//     // Placeholder for share functionality
//     alert("Share functionality would be implemented here");
//   };

//   if (loading) return (
//     <div className="loading-container">
//       <div className="loading-spinner"></div>
//       <p>Loading reels...</p>
//     </div>
//   );
  
//   if (error) return (
//     <div className="error-container">
//       <div className="error-icon">⚠️</div>
//       <p>Error: {error}</p>
//       <button onClick={() => window.location.reload()} className="retry-button">
//         Retry
//       </button>
//     </div>
//   );

//   return (
//     <div className="reels-page">
//       <div className="reels-container" ref={reelsContainerRef}>
//         {posts.map((post, index) => (
//           <div key={post._id} className="reel">
//             <div 
//               className="video-container"
//               onClick={(e) => togglePlayPause(e, index)}
//               onDoubleClick={(e) => handleDoubleTap(e, post._id)}
//             >
//               <video
//                 ref={(el) => (videoRefs.current[index] = el)}
//                 loop
//                 playsInline
//                 className="reel-video"
//               >
//                 <source src={post.video} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>
              
//               {/* Pause/play indicator */}
//               <div className={`video-status ${videoRefs.current[index]?.paused ? 'visible' : ''}`}>
//                 <div className="play-icon">▶</div>
//               </div>
//             </div>

//             {/* User info and description */}
//             <div className="reel-details">
//               <div className="user-info">
//                 <img
//                   src={post.owner.profile || "https://via.placeholder.com/40"}
//                   alt={post.owner.username}
//                   className="reel-avatar"
//                 />
//                 <p className="reel-username">{post.owner.username}</p>
//                 <button className="follow-button">Follow</button>
//               </div>
              
//               <div className="reel-description-container" onClick={() => toggleDescription(post._id)}>
//                 <p className={`reel-description ${expandedDescriptions[post._id] ? 'expanded' : ''}`}>
//                   {post.description}
//                 </p>
//                 {!expandedDescriptions[post._id] && post.description.length > 50 && (
//                   <span className="more-text">... more</span>
//                 )}
//               </div>
              
//               {/* Music info */}
//               <div className="music-info">
//                 <div className="music-icon">♫</div>
//                 <p className="music-text">{post.owner.username} • Original Audio</p>
//               </div>
//             </div>

//             {/* Interaction buttons */}
//             <div className="reel-actions">
//               <button 
//                 className={`reel-action-button ${likedPosts[post._id] ? 'liked' : ''}`}
//                 onClick={() => handleLike(post._id)}
//               >
//                 <div className="action-icon heart-icon">
//                   {likedPosts[post._id] ? '❤️' : '🤍'}
//                 </div>
//                 <span>{post.likes.toLocaleString()}</span>
//               </button>
              
//               <button 
//                 className="reel-action-button"
//                 onClick={() => toggleComments(post._id)}
//               >
//                 <div className="action-icon">💬</div>
//                 <span>{post.comments.toLocaleString()}</span>
//               </button>
              
//               <button 
//                 className="reel-action-button"
//                 onClick={handleShare}
//               >
//                 <div className="action-icon">↗️</div>
//                 <span>{post.shares.toLocaleString()}</span>
//               </button>
              
//               <button className="reel-action-button">
//                 <div className="action-icon">🔖</div>
//                 <span>{post.savedBy.toLocaleString()}</span>
//               </button>
              
//               <button className="reel-action-button more-options">
//                 <div className="action-icon">•••</div>
//               </button>
//             </div>
            
//             {/* Comments section */}
//             <div className={`comments-section ${showComments === post._id ? 'show' : ''}`}>
//               <div className="comments-header">
//                 <h3>Comments</h3>
//                 <button className="close-comments" onClick={() => setShowComments(null)}>✕</button>
//               </div>
              
//               <div className="comments-list">
//                 {Object.values(dummyComments).map((comment, idx) => (
//                   <div key={idx} className="comment">
//                     <img 
//                       src={`https://via.placeholder.com/30?text=${comment.username.charAt(0)}`} 
//                       alt={comment.username} 
//                       className="comment-avatar"
//                     />
//                     <div className="comment-content">
//                       <p className="comment-username">{comment.username}</p>
//                       <p className="comment-text">{comment.text}</p>
//                       <p className="comment-timestamp">{comment.timestamp}</p>
//                     </div>
//                     <button className="comment-like">🤍</button>
//                   </div>
//                 ))}
//               </div>
              
//               <div className="add-comment">
//                 <img 
//                   src="https://via.placeholder.com/30?text=ME" 
//                   alt="Your profile" 
//                   className="comment-avatar"
//                 />
//                 <input 
//                   type="text" 
//                   placeholder="Add a comment..." 
//                   className="comment-input"
//                 />
//                 <button className="post-comment-btn">Post</button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Reels;
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './Reels.css';
import { Link } from "react-router-dom";

function Reels() {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [likedReels, setLikedReels] = useState({});
  const [showComments, setShowComments] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const videoRefs = useRef({});
  const reelsContainerRef = useRef(null);
  const observer = useRef(null);
  const lastReelElementRef = useRef(null);
  
  const { id } = useParams();

  // Sample comments data (would normally come from API)
  const dummyComments = {
    comment1: { username: "user123", text: "Amazing content! 🔥", timestamp: "2h ago" },
    comment2: { username: "creativesoul", text: "This is so inspiring!", timestamp: "5h ago" },
    comment3: { username: "digital_nomad", text: "Where was this filmed?", timestamp: "1d ago" },
    comment4: { username: "tech_enthusiast", text: "What equipment did you use?", timestamp: "2d ago" },
    comment5: { username: "travel_addict", text: "Added to my bucket list ✈️", timestamp: "3d ago" },
  };

  // Fetch reels with pagination
  // const fetchReels = useCallback(async (pageNum) => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(`${Backend_Url}/talk`, {
  //       params: {
  //         page: pageNum,
  //         limit: 3 // Load fewer reels at a time
  //       }
  //     });
      
  //     const data = response.data;
      
  //     // Filter only posts with videos and add engagement metrics
  //     const reelsData = data.posts
  //       .filter(post => post.video)
  //       .map(post => ({
  //         ...post,
  //         likes: post.likes?.length || Math.floor(Math.random() * 10000),
  //         comments: post.comments?.length || Math.floor(Math.random() * 500),
  //         shares: Math.floor(Math.random() * 300),
  //         savedBy: Math.floor(Math.random() * 200)
  //       }));
      
  //     if (pageNum === 1) {
  //       setReels(reelsData);
  //     } else {
  //       setReels(prevReels => [...prevReels, ...reelsData]);
  //     }
      
  //     setHasMore(data.hasMore);
  //     setPage(data.currentPage);
  //     setIsInitialLoad(false);
  //     console.log("Reels fetched successfully:", reelsData);
      
  //   } catch (err) {
  //     setError("Failed to fetch reels: " + (err.message || "Unknown error"));
  //     console.error("Error fetching reels:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [Backend_Url]);

//   const fetchReels = useCallback(async (pageNum) => {
//   try {
//     setLoading(true);
//     const response = await axios.get(`${Backend_Url}/talk`, {
//       params: {
//         page: pageNum,
//         limit: 3
//       }
//     });

//     const data = response.data;
//     console.log("Fetched raw data:", data);

//     const allPosts = Array.isArray(data) ? data : (data.posts || []);
//     const reelsData = allPosts
//       .filter(post => post.video)
//       .map(post => ({
//         ...post,
//         likes: post.likes?.length || Math.floor(Math.random() * 10000),
//         comments: post.comments?.length || Math.floor(Math.random() * 500),
//         shares: Math.floor(Math.random() * 300),
//         savedBy: Math.floor(Math.random() * 200)
//       }));

//     if (pageNum === 1) {
//       setReels(reelsData);
//     } else {
//       setReels(prevReels => [...prevReels, ...reelsData]);
//     }

//     setHasMore(data.hasMore || reelsData.length > 0);
//     setPage(data.currentPage || pageNum);
//     setIsInitialLoad(false);
//     console.log("Reels fetched successfully:", reelsData);

//   } catch (err) {
//     setError("Failed to fetch reels: " + (err.message || "Unknown error"));
//     console.error("Error fetching reels:", err);
//   } finally {
//     setLoading(false);
//   }
// }, [Backend_Url]);
const fetchReels = useCallback(async () => {
  try {
    setLoading(true);
    let page = 1;
    const maxPages = 1000  ;
    let collectedVideos = [];

    while (collectedVideos.length < 3 && page <= maxPages) {
      const response = await axios.get(`${Backend_Url}/talk`, {
        params: { page, limit: 10000 }
      });

      const data = response.data;
      const posts = data.posts || [];

      const videoPosts = posts.filter(post => post.video);
      collectedVideos = [...collectedVideos, ...videoPosts];

      if (!data.hasMore) break; // No more pages to check
      page++;
    }

    const reelsData = collectedVideos.map(post => ({
      ...post,
      likes: post.likes?.length || Math.floor(Math.random() * 10000),
      comments: post.comments?.length || Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 300),
      savedBy: Math.floor(Math.random() * 200),
    }));

    setReels(reelsData);
    setPage(page);
    setHasMore(reelsData.length > 0);
    setIsInitialLoad(false);
    console.log("Reels fetched successfully:", reelsData);

  } catch (err) {
    console.error("Error fetching reels:", err);
    setError("Failed to fetch reels: " + (err.message || "Unknown error"));
  } finally {
    setLoading(false);
  }
}, [Backend_Url]);



  // Load initial reels
  useEffect(() => {
    fetchReels(1);
  }, [fetchReels]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (loading) return;
    
    // Disconnect previous observer
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchReels(page + 1);
      }
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });
    
    if (lastReelElementRef.current) {
      observer.current.observe(lastReelElementRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, page, fetchReels]);

  // Scroll snap and play/pause videos
  useEffect(() => {
    if (!reelsContainerRef.current || reels.length === 0) return;

    const handleScroll = () => {
      if (!reelsContainerRef.current) return;
      
      const containerHeight = reelsContainerRef.current.clientHeight;
      const scrollPosition = reelsContainerRef.current.scrollTop;
      const newIndex = Math.round(scrollPosition / containerHeight);
      
      if (newIndex >= 0 && newIndex < reels.length && newIndex !== currentIndex) {
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
  }, [reels.length, currentIndex]);

  // Control video playback based on current index
  useEffect(() => {
    // Get all video elements
    const videos = Object.values(videoRefs.current).filter(Boolean);
    
    videos.forEach((video, index) => {
      const videoId = video.dataset.reelId;
      const reelIndex = reels.findIndex(reel => reel._id === videoId);
      
      if (reelIndex === currentIndex) {
        video.currentTime = 0;
        video.play().catch(err => console.error("Autoplay failed:", err));
        video.muted = false;
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex, reels]);

  // Handle tap to play/pause
  const togglePlayPause = (event, reelId) => {
    event.stopPropagation();
    const video = videoRefs.current[reelId];
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(err => console.error("Play failed:", err));
    } else {
      video.pause();
    }
  };

  // Handle double tap for like animation
  const handleDoubleTap = (event, reelId) => {
    event.stopPropagation();
    
    if (!likedReels[reelId]) {
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
      handleLike(reelId);
    }
  };

  // Toggle description expand/collapse
  const toggleDescription = (reelId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [reelId]: !prev[reelId]
    }));
  };

  // Toggle like
  const handleLike = (reelId) => {
    setLikedReels(prev => {
      const newState = { ...prev };
      newState[reelId] = !prev[reelId];
      
      // Update like count in reels
      setReels(prevReels => 
        prevReels.map(reel => 
          reel._id === reelId 
            ? { 
                ...reel, 
                likes: typeof reel.likes === 'number'
                  ? (newState[reelId] ? reel.likes + 1 : reel.likes - 1)
                  : (newState[reelId] 
                    ? [...(reel.likes || []), "currentUserId"]
                    : (reel.likes || []).filter(id => id !== "currentUserId"))
              } 
            : reel
        )
      );
      
      return newState;
    });
  };

  // Toggle comments section
  const toggleComments = (reelId) => {
    setShowComments(prev => prev === reelId ? null : reelId);
  };

  // Handle sharing
  const handleShare = () => {
    // Placeholder for share functionality
    alert("Share functionality would be implemented here");
  };

  // Format numbers for display (e.g., 1,000 to 1K)
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    } else {
      return count.toString();
    }
  };

  if (isInitialLoad) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading reels...</p>
    </div>
  );
  
  if (error && reels.length === 0) return (
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
        {reels.map((reel, index) => {
          const isLastReel = index === reels.length - 1;
          const reelId = reel._id;
          const isDescriptionExpanded = expandedDescriptions[reelId] || false;
          const isLiked = likedReels[reelId] || false;
          
          return (
            <div 
              key={reelId} 
              ref={isLastReel ? lastReelElementRef : undefined}
              className="reel"
            >
              <div 
                className="video-container"
                onClick={(e) => togglePlayPause(e, reelId)}
                onDoubleClick={(e) => handleDoubleTap(e, reelId)}
              >
                <video
                  ref={(el) => { if (el) { videoRefs.current[reelId] = el; el.dataset.reelId = reelId; } }}
                  loop
                  playsInline
                  className="reel-video"
                >
                  <source src={reel.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Pause/play indicator - only visible when paused */}
                {/* {videoRefs.current[reelId]?.paused && (
                  <div className="video-status visible">
                    <div className="play-icon">▶</div>
                  </div>
                )} */}
              </div>

              {/* User info and description */}
              <div className="reel-details">
                <div className="user-info">
                  <img
                    src={reel.owner.profile || "https://via.placeholder.com/40"}
                    alt={reel.owner.username}
                    className="reel-avatar"
                  />
                  <p className="reel-username">{reel.owner.username}</p>
                  <Link to={`/user/${post.owner?._id}`} className="user-info" style={{ textDecoration: 'none' }}>
                                      <img
                                        src={post.owner?.profile || "/default-avatar.png"}
                                        alt={post.owner?.username || "User"}
                                         className="reel-avatar"
                                      />
                                    </Link>
                                    <Link to={`/user/${post.owner?._id}`} className="reel-username" style={{ textDecoration: 'none' }}>
                                      {post.owner?.username || "Unknown User"}
                                    </Link>
                  <button className="follow-button">Follow</button>
                </div>
                
                <div className="reel-description-container" onClick={() => toggleDescription(reelId)}>
                  <p className={`reel-description ${isDescriptionExpanded ? 'expanded' : ''}`}>
                    {reel.description}
                  </p>
                  {!isDescriptionExpanded && reel.description?.length > 50 && (
                    <span className="more-text">... more</span>
                  )}
                </div>
                
                {/* Music info */}
                <div className="music-info">
                  <div className="music-icon">♫</div>
                  <p className="music-text">{reel.owner.username} • Original Audio</p>
                </div>
              </div>

              {/* Interaction buttons */}
              <div className="reel-actions">
                <button 
                  className={`reel-action-button ${isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(reelId)}
                >
                  <div className="action-icon heart-icon">
                    {isLiked ? '❤️' : '🤍'}
                  </div>
                  <span>{formatCount(typeof reel.likes === 'number' ? reel.likes : reel.likes?.length || 0)}</span>
                </button>
                
                <button 
                  className="reel-action-button"
                  onClick={() => toggleComments(reelId)}
                >
                  {/* <div className="action-icon">💬</div>
                  <span>{formatCount(typeof reel.comments === 'number' ? reel.comments : reel.comments?.length || 0)}</span> */}
                </button>
                
                <button 
                  className="reel-action-button"
                  onClick={handleShare}
                >
                  {/* <div className="action-icon">↗️</div> */}
                  {/* <span>{formatCount(reel.shares || 0)}</span> */}
                </button>
                
                <button className="reel-action-button">
                  {/* <div className="action-icon">🔖</div> */}
                  {/* <span>{formatCount(reel.savedBy || 0)}</span> */}
                </button>
                
                <button className="reel-action-button more-options">
                  {/* <div className="action-icon">•••</div> */}
                </button>
              </div>
              
              {/* Comments section */}
              <div className={`comments-section ${showComments === reelId ? 'show' : ''}`}>
                <div className="comments-header">
                  <h3>Comments</h3>
                  <button className="close-comments" onClick={() => setShowComments(null)}>✕</button>
                </div>
                
                <div className="comments-list">
                  {reel.comments && Array.isArray(reel.comments) && reel.comments.length > 0 ? (
                    reel.comments.map((comment, idx) => (
                      <div key={idx} className="comment">
                        <img 
                          src={comment.authorProfile || `https://via.placeholder.com/30?text=${comment.authorUsername.charAt(0)}`} 
                          alt={comment.authorUsername} 
                          className="comment-avatar"
                        />
                        <div className="comment-content">
                          <p className="comment-username">{comment.authorUsername}</p>
                          <p className="comment-text">{comment.text}</p>
                          <p className="comment-timestamp">{new Date(comment.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button className="comment-like">🤍</button>
                      </div>
                    ))
                  ) : (
                    // If no comments from API, use dummy comments
                    Object.values(dummyComments).map((comment, idx) => (
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
                    ))
                  )}
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
          );
        })}
        
        {/* Loading indicator at bottom */}
        {loading && reels.length > 0 && (
          <div className="loading-more">
            <div className="loading-spinner"></div>
            <p>Loading more reels...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reels;