
// import { useEffect, useState, useRef, useCallback } from "react";
// import axios from "axios";
// import './Posts.css';
// import AdComponent from './AdComponent';
// import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';

// function TalkPosts() {
//   const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [expandedDescriptions, setExpandedDescriptions] = useState({});
//   const [commentInputs, setCommentInputs] = useState({});

//   // Refs for videos and intersection observer
//   const videoRefs = useRef({});
//   const observer = useRef();
//   const lastPostElementRef = useRef();

//   // Fetch initial posts
//   const fetchPosts = useCallback(async (pageNum) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${Backend_Url}/talk`, {
//         params: {
//           page: pageNum,
//           limit: 5 // Adjust the number of posts per load
//         }
//       });
      
//       const data = response.data;
      
//       if (pageNum === 1) {
//         setPosts(data.posts);
//       } else {
//         setPosts(prevPosts => [...prevPosts, ...data.posts]);
//       }
      
//       setHasMore(data.hasMore);
//       setPage(data.currentPage);
      
//     } catch (err) {
//       setError("Failed to fetch posts: " + (err.message || "Unknown error"));
//       console.error("Error fetching posts:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [Backend_Url]);

//   // Load initial posts
//   useEffect(() => {
//     fetchPosts(1);
//   }, [fetchPosts]);

//   // Setup intersection observer for infinite scrolling
//   useEffect(() => {
//     if (loading) return;
    
//     // Disconnect previous observer
//     if (observer.current) {
//       observer.current.disconnect();
//     }
    
//     observer.current = new IntersectionObserver(entries => {
//       if (entries[0].isIntersecting && hasMore) {
//         fetchPosts(page + 1);
//       }
//     }, {
//       rootMargin: '100px',
//     });
    
//     if (lastPostElementRef.current) {
//       observer.current.observe(lastPostElementRef.current);
//     }
    
//     return () => {
//       if (observer.current) {
//         observer.current.disconnect();
//       }
//     };
//   }, [loading, hasMore, page, fetchPosts]);

//   // Setup video autoplay/pause with Intersection Observer
//   useEffect(() => {
//     const videoObserver = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           const video = entry.target;
//           if (entry.isIntersecting) {
//             video.play().catch((error) => console.error("Autoplay failed:", error));
//           } else {
//             video.pause();
//           }
//         });
//       },
//       {
//         threshold: 0.5,
//       }
//     );

//     // Observe all video elements
//     Object.values(videoRefs.current).forEach((video) => {
//       if (video) videoObserver.observe(video);
//     });

//     return () => {
//       Object.values(videoRefs.current).forEach((video) => {
//         if (video) videoObserver.unobserve(video);
//       });
//     };
//   }, [posts]);

//   // Toggle video play/pause on click
//   const togglePlayPause = (event) => {
//     const video = event.currentTarget;
//     if (video.paused) {
//       video.muted = false;
//       video.play().catch((error) => console.error("Play failed:", error));
//     } else {
//       video.pause();
//     }
//   };

//   // Toggle description expansion
//   const toggleDescription = (postId) => {
//     setExpandedDescriptions(prev => ({
//       ...prev,
//       [postId]: !prev[postId]
//     }));
//   };

//   // Handle like action
//   const handleLike = async (postId) => {
//     try {
//       // Update UI optimistically
//       setPosts(prevPosts => 
//         prevPosts.map(post => {
//           if (post._id === postId) {
//             const userLiked = post.liked || false;
//             return {
//               ...post,
//               liked: !userLiked,
//               likes: userLiked 
//                 ? (post.likes || []).filter(id => id !== "currentUserId")
//                 : [...(post.likes || []), "currentUserId"]
//             };
//           }
//           return post;
//         })
//       );
      
//       // Make API call (would need authentication)
//       // const response = await axios.post(`${Backend_Url}/talk/${postId}/like`);
//       // Actual implementation would update based on response
      
//     } catch (error) {
//       console.error("Error liking post:", error);
//       // Revert optimistic update if needed
//     }
//   };

//   // Handle comment input change
//   const handleCommentChange = (postId, value) => {
//     setCommentInputs(prev => ({
//       ...prev,
//       [postId]: value
//     }));
//   };

//   // Handle comment submission
//   const handleCommentSubmit = async (postId) => {
//     const commentText = commentInputs[postId];
//     if (!commentText?.trim()) return;
    
//     try {
//       // Add comment optimistically
//       const newComment = {
//         id: Date.now().toString(),
//         text: commentText,
//         authorUsername: "You", // Would be current user's name
//         createdAt: new Date(),
//       };
      
//       setPosts(prevPosts => 
//         prevPosts.map(post => {
//           if (post._id === postId) {
//             return {
//               ...post,
//               comments: [...(post.comments || []), newComment]
//             };
//           }
//           return post;
//         })
//       );
      
//       // Clear input
//       setCommentInputs(prev => ({
//         ...prev,
//         [postId]: ""
//       }));
      
//       // Make API call (would need authentication)
//       // const response = await axios.post(`${Backend_Url}/talk/${postId}/comment`, { text: commentText });
//       // Actual implementation would update based on response
      
//     } catch (error) {
//       console.error("Error adding comment:", error);
//       // Revert optimistic update if needed
//     }
//   };

//   // Truncate description for preview
//   const truncateDescription = (text, maxLength = 50) => {
//     if (!text) return "";
//     if (text.length <= maxLength) return text;
//     return text.substring(0, maxLength) + "...";
//   };

//   // Format date to relative time (e.g., "2 hours ago")
//   const formatRelativeTime = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);
    
//     if (diffInSeconds < 60) return "just now";
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
//     if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
//     return date.toLocaleDateString();
//   };

//   if (error) return <div className="text-center text-red-500">Error: {error}</div>;

//   return (
//     <div className="posts-container bg-black text-white min-h-screen">
//       <div className="max-w-md mx-auto">
//         {/* First ad at the top */}
//         <AdComponent />
        
//         {/* Posts */}
//         {posts.map((post, index) => {
//           const isLastPost = index === posts.length - 1;
//           const postId = post._id;
//           const isDescriptionExpanded = expandedDescriptions[postId] || false;
//           const isLiked = post.liked || false;
          
//           return (
//             <div 
//               key={postId} 
//               ref={isLastPost ? lastPostElementRef : undefined} 
//               className="post-item mb-4 border-b border-gray-800 pb-2"
//             >
//               {/* Post header */}
//               <div className="post-header flex items-center justify-between p-3">
//                 <div className="flex items-center">
//                   <div className="avatar-container h-8 w-8 rounded-full overflow-hidden border border-red-500">
//                     <img 
//                       src={post.owner.profile || "/default-avatar.png"} 
//                       alt={post.owner.username} 
//                       className="h-full w-full object-cover"
//                     />
//                   </div>
//                   <span className="font-semibold ml-2">{post.owner.username}</span>
//                 </div>
//                 <MoreHorizontal className="h-5 w-5 text-gray-400" />
//               </div>
              
//               {/* Post media */}
//               <div className="post-media relative">
//                 {post.image ? (
//                   <img 
//                     src={post.image} 
//                     alt="Post content" 
//                     className="w-full object-cover max-h-[500px]" 
//                     loading="lazy"
//                   />
//                 ) : post.video ? (
//                   <video
//                     ref={el => { videoRefs.current[postId] = el }}
//                     playsInline
//                     muted
//                     loop
//                     className="w-full max-h-[500px] object-cover"
//                     onClick={togglePlayPause}
//                     poster="/video-thumbnail.jpg"
//                   >
//                     <source src={post.video} type="video/mp4" />
//                     Your browser does not support videos.
//                   </video>
//                 ) : null}
//               </div>
              
//               {/* Post actions */}
//               <div className="post-actions flex justify-between p-3">
//                 <div className="flex space-x-4">
//                   <Heart 
//                     className={`h-6 w-6 cursor-pointer ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
//                     onClick={() => handleLike(postId)}
//                   />
//                   <MessageCircle className="h-6 w-6 cursor-pointer" />
//                   <Share2 className="h-6 w-6 cursor-pointer" />
//                 </div>
//                 <Bookmark className="h-6 w-6 cursor-pointer" />
//               </div>
              
//               {/* Likes count */}
//               <div className="px-3 py-1">
//                 <p className="font-bold">
//                   {post.likes?.length || 0} likes
//                 </p>
//               </div>
              
//               {/* Post description */}
//               {post.description && (
//                 <div className="px-3 py-1">
//                   <p>
//                     <span className="font-bold mr-1">{post.owner.username}</span>
//                     {isDescriptionExpanded 
//                       ? post.description 
//                       : truncateDescription(post.description, 60)}
//                     {post.description.length > 60 && (
//                       <span 
//                         className="text-gray-400 cursor-pointer ml-1"
//                         onClick={() => toggleDescription(postId)}
//                       >
//                         {isDescriptionExpanded ? "less" : "more"}
//                       </span>
//                     )}
//                   </p>
//                 </div>
//               )}
              
//               {/* Comments section */}
//               {post.comments?.length > 0 && (
//                 <div className="px-3 py-1">
//                   <p className="text-gray-400 mb-1">
//                     {post.comments.length > 2 
//                       ? `View all ${post.comments.length} comments` 
//                       : ""}
//                   </p>
//                   {(post.comments.slice(0, 2)).map((comment, i) => (
//                     <div key={i} className="mb-1">
//                       <span className="font-semibold mr-2">{comment.authorUsername}</span>
//                       {comment.text}
//                     </div>
//                   ))}
//                 </div>
//               )}
              
//               {/* Post date */}
//               <div className="px-3 py-1">
//                 <p className="text-xs text-gray-400">
//                   {formatRelativeTime(post.createdAt)}
//                 </p>
//               </div>
              
//               {/* Comment input */}
//               <div className="px-3 py-2 flex items-center border-t border-gray-800 mt-2">
//                 <input
//                   type="text"
//                   placeholder="Add a comment..."
//                   className="bg-transparent flex-grow outline-none"
//                   value={commentInputs[postId] || ""}
//                   onChange={(e) => handleCommentChange(postId, e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(postId)}
//                 />
//                 {commentInputs[postId]?.trim() && (
//                   <button 
//                     className="text-blue-500 font-semibold"
//                     onClick={() => handleCommentSubmit(postId)}
//                   >
//                     Post
//                   </button>
//                 )}
//               </div>
              
//               {/* Show an ad after every few posts */}
//               {(index + 1) % 4 === 0 && <AdComponent />}
//             </div>
//           );
//         })}
        
//         {/* Loading indicator */}
//         {loading && posts.length > 0 && (
//           <div className="text-center py-4">
//             <div className="spinner w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
//             <p className="mt-2">Loading more posts...</p>
//           </div>
//         )}
        
//         {/* No more posts indicator */}
//         {!loading && !hasMore && posts.length > 0 && (
//           <div className="text-center py-8 text-gray-400">
//             You've reached the end
//           </div>
//         )}
        
//         {/* Another ad at the bottom */}
//         <AdComponent />
//       </div>
//     </div>
//   );
// }

// export default TalkPosts;
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import './Posts.css';
import AdComponent from './AdComponent';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';

function TalkPosts() {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [visiblePosts, setVisiblePosts] = useState({});

  // Refs for videos and intersection observer
  const videoRefs = useRef({});
  const postRefs = useRef({});
  const observer = useRef();
  const lastPostElementRef = useRef();
  const postObserver = useRef();

  // Fetch initial posts
  const fetchPosts = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backend_Url}/talk`, {
        params: {
          page: pageNum,
          limit: 5 // Adjust the number of posts per load
        }
      });
      
      const data = response.data;
      
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...data.posts]);
      }
      
      setHasMore(data.hasMore);
      setPage(data.currentPage);
      
    } catch (err) {
      setError("Failed to fetch posts: " + (err.message || "Unknown error"));
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [Backend_Url]);

  // Load initial posts
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (loading) return;
    
    // Disconnect previous observer
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(page + 1);
      }
    }, {
      rootMargin: '200px',
    });
    
    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, page, fetchPosts]);

  // Setup post visibility observer for animations
  useEffect(() => {
    if (postObserver.current) {
      postObserver.current.disconnect();
    }

    postObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const postId = entry.target.dataset.postid;
          if (postId) {
            setVisiblePosts(prev => ({
              ...prev,
              [postId]: entry.isIntersecting
            }));
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '20px',
      }
    );

    // Observe all post elements
    Object.values(postRefs.current).forEach((postEl) => {
      if (postEl) postObserver.current.observe(postEl);
    });

    return () => {
      if (postObserver.current) {
        postObserver.current.disconnect();
      }
    };
  }, [posts]);

  // Setup video autoplay/pause with Intersection Observer
  useEffect(() => {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch((error) => console.error("Autoplay failed:", error));
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.6,
      }
    );

    // Observe all video elements
    Object.values(videoRefs.current).forEach((video) => {
      if (video) videoObserver.observe(video);
    });

    return () => {
      videoObserver.disconnect();
    };
  }, [posts]);

  // Toggle video play/pause on click
  const togglePlayPause = (event) => {
    const video = event.currentTarget;
    if (video.paused) {
      video.muted = false;
      video.play().catch((error) => console.error("Play failed:", error));
    } else {
      video.pause();
    }
  };

  // Toggle description expansion
  const toggleDescription = (postId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Handle like action
  const handleLike = async (postId) => {
    try {
      // Update UI optimistically
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const userLiked = post.liked || false;
            return {
              ...post,
              liked: !userLiked,
              likes: userLiked 
                ? (post.likes || []).filter(id => id !== "currentUserId")
                : [...(post.likes || []), "currentUserId"]
            };
          }
          return post;
        })
      );
      
      // Make API call (would need authentication)
      // const response = await axios.post(`${Backend_Url}/talk/${postId}/like`);
      // Actual implementation would update based on response
      
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert optimistic update if needed
    }
  };

  // Handle comment input change
  const handleCommentChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  // Handle comment submission
  const handleCommentSubmit = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;
    
    try {
      // Add comment optimistically
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        authorUsername: "You", // Would be current user's name
        createdAt: new Date(),
      };
      
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), newComment]
            };
          }
          return post;
        })
      );
      
      // Clear input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ""
      }));
      
      // Make API call (would need authentication)
      // const response = await axios.post(`${Backend_Url}/talk/${postId}/comment`, { text: commentText });
      // Actual implementation would update based on response
      
    } catch (error) {
      console.error("Error adding comment:", error);
      // Revert optimistic update if needed
    }
  };

  // Truncate description for preview
  const truncateDescription = (text, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="posts-container">
      <div className="posts-wrapper">
        {/* First ad at the top */}
        {/* <div className="ad-container">
          <AdComponent />
        </div> */}
        
        {/* Posts */}
        {posts.map((post, index) => {
          const isLastPost = index === posts.length - 1;
          const postId = post._id;
          const isDescriptionExpanded = expandedDescriptions[postId] || false;
          const isLiked = post.liked || false;
          const isVisible = visiblePosts[postId] || false;
          
          return (
            <div 
              key={postId} 
              ref={el => {
                postRefs.current[postId] = el;
                if (isLastPost) lastPostElementRef.current = el;
              }}
              data-postid={postId}
              className={`post-item-P ${isVisible ? 'post-visible' : ''}`}
            >
              {/* Post header */}
              <div className="post-header">
                <div className="user-info">
                  <div className="avatar-container">
                    <img 
                      src={post.owner.profile || "/default-avatar.png"} 
                      alt={post.owner.username} 
                      className="avatar-image"
                    />
                  </div>
                  <span className="username-P">{post.owner.username}</span>
                </div>
                {/* <button className="more-options">
                  <MoreHorizontal className="icon-more" />
                </button> */}
              </div>
              
              {/* Post media */}
              <div className="post-media-container">
                {post.image ? (
                  <div className="media-wrapper">
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="post-image" 
                      loading="lazy"
                    />
                  </div>
                ) : post.video ? (
                  <div className="media-wrapper">
                    <video
                      ref={el => { videoRefs.current[postId] = el }}
                      playsInline
                      muted
                      loop
                      className="post-video"
                      onClick={togglePlayPause}
                      poster="/video-thumbnail.jpg"
                    >
                      <source src={post.video} type="video/mp4" />
                      Your browser does not support videos.
                    </video>
                    <div className="play-overlay">
                      <div className="play-indicator"></div>
                    </div>
                  </div>
                ) : null}
              </div>
              
              {/* Post interaction bar */}
              <div className="interaction-bar">
                <div className="primary-actions">
                  <button 
                    className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(postId)}
                    aria-label="Like"
                  >
                    <Heart className={`action-icon ${isLiked ? 'filled' : ''}`} />
                  </button>
                  {/* <button className="action-btn comment-btn" aria-label="Comment">
                    <MessageCircle className="action-icon" />
                  </button>
                  <button className="action-btn share-btn" aria-label="Share">
                    <Share2 className="action-icon" />
                  </button> */}
                </div>
                {/* <button className="action-btn-1 save-btn" aria-label="Save">
                  <Bookmark className="action-icon" />
                </button> */}
              </div>
              
              {/* Likes count */}
              <div className="likes-count">
                <p className="bold-text">
                  {post.likes?.length || 0} likes
                </p>
              </div>
              
              {/* Post description */}
              {post.description && (
                <div className="post-description">
                  <p>
                    <span className="username-text">{post.owner.username}</span>
                    <span className={`description-text ${isDescriptionExpanded ? 'expanded' : ''}`}>
                      {isDescriptionExpanded 
                        ? post.description 
                        : truncateDescription(post.description, 60)}
                    </span>
                    {post.description.length > 60 && (
                      <button 
                        className="toggle-description"
                        onClick={() => toggleDescription(postId)}
                      >
                        {isDescriptionExpanded ? "less" : "more"}
                      </button>
                    )}
                  </p>
                </div>
              )}
              
              {/* Comments section */}
              {post.comments?.length > 0 && (
                <div className="comments-section">
                  {post.comments.length > 2 && (
                    <button className="view-all-comments">
                      View all {post.comments.length} comments
                    </button>
                  )}
                  <div className="comments-preview">
                    {(post.comments.slice(0, 2)).map((comment, i) => (
                      <div key={i} className="comment-item">
                        <span className="comment-username">{comment.authorUsername}</span>
                        <span className="comment-text">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Post date */}
              <div className="post-timestamp">
                <time>{formatRelativeTime(post.createdAt)}</time>
              </div>
              
              {/* Comment input */}
              {/* <div className="comment-input-container">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="comment-input-field"
                  value={commentInputs[postId] || ""}
                  onChange={(e) => handleCommentChange(postId, e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(postId)}
                />
                {commentInputs[postId]?.trim() && (
                  <button 
                    className="post-comment-btn"
                    onClick={() => handleCommentSubmit(postId)}
                  >
                    Post
                  </button>
                )}
              </div> */}
              
              {/* Show an ad after every few posts */}
              {/* {(index + 1) % 4 === 0 && (
                <div className="ad-container in-feed">
                  <AdComponent />
                </div>
              )} */}
            </div>
          );
        })}
        
        {/* Loading indicator */}
        {loading && posts.length > 0 && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading more posts...</p>
          </div>
        )}
        
        {/* No more posts indicator */}
        {!loading && !hasMore && posts.length > 0 && (
          <div className="end-of-feed">
            You've reached the end
          </div>
        )}
        
        {/* Another ad at the bottom */}
        {/* <div className="ad-container">
          <AdComponent />
        </div> */}
      </div>
    </div>
  );
}

export default TalkPosts;