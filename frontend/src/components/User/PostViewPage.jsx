// import { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { FiArrowLeft, FiHeart } from "react-icons/fi";
// import "./PostViewPage.css"; 

// const PostsViewPage = () => {
//   const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//   const { id } = useParams(); // user id
//   const navigate = useNavigate();
//   const location = useLocation();
//    const [likedReels, setLikedReels] = useState({});
//   const [posts, setPosts] = useState([]);
//   const [currentPostIndex, setCurrentPostIndex] = useState(0);
//   const [profileData, setProfileData] = useState(null);
//   const [currentUserData, setCurrentUserData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const videoRefs = useRef([]);
//   const [reels, setReels] = useState([]);

//   // Get initial post index from URL params or state
//   useEffect(() => {
//     const searchParams = new URLSearchParams(location.search);
//     const postIndex = searchParams.get('index');
//     if (postIndex) {
//       setCurrentPostIndex(parseInt(postIndex));
//     }
//   }, [location]);

//   // Get authentication token
//   const getAuthToken = () => localStorage.getItem("token");

//   // Setup axios interceptor for auth
//   useEffect(() => {
//     const token = getAuthToken();
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     }
//   }, []);

//   // Fetch current user data
//   const fetchCurrentUserData = async () => {
//     try {
//       const response = await axios.get(`${Backend_Url}/user/me`, {
//         withCredentials: true
//       });
//       setCurrentUserData(response.data);
//       return response.data;
//     } catch (error) {
//       console.error("Failed to fetch current user:", error);
//       throw error;
//     }
//   };

//   // Fetch profile and posts data
//   const fetchData = async () => {
//     try {
//       const [profileResponse] = await Promise.all([
//         axios.get(`${Backend_Url}/user/${id}`, { withCredentials: true }),
//         fetchCurrentUserData()
//       ]);
      
//       setProfileData(profileResponse.data);
//       setPosts(profileResponse.data.posts || []);
//     } catch (error) {
//       console.error("Failed to fetch data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
// const handleDoubleTap = (event, reelId) => {
//     event.stopPropagation();
    
//     if (!likedReels[reelId]) {
//       const heart = document.createElement('div');
//       heart.className = 'heart-animation';
//       heart.style.left = `${event.clientX - 50}px`;
//       heart.style.top = `${event.clientY - 50}px`;
//       document.body.appendChild(heart);
      
//       // Remove the heart element after animation completes
//       setTimeout(() => {
//         document.body.removeChild(heart);
//       }, 1000);
      
     
//     }
//     handleLike(reelId);
//   };
//   const handleLike = (reelId) => {
//     setLikedReels(prev => {
//       const newState = { ...prev };
//       newState[reelId] = !prev[reelId];
      
//       // Update like count in reels
//       setReels(prevReels => 
//         prevReels.map(reel => 
//           reel._id === reelId 
//             ? { 
//                 ...reel, 
//                 likes: typeof reel.likes === 'number'
//                   ? (newState[reelId] ? reel.likes + 1 : reel.likes - 1)
//                   : (newState[reelId] 
//                     ? [...(reel.likes || []), "currentUserId"]
//                     : (reel.likes || []).filter(id => id !== "currentUserId"))
//               } 
//             : reel
//         )
//       );
      
//       return newState;
//     });
//   };
//   useEffect(() => {
//     const token = getAuthToken();
//     if (!token) {
//       navigate(-1);
//       return;
//     }
//     fetchData();
//   }, [id]);

//   // Handle video autoplay
//   useEffect(() => {
//     const currentVideo = videoRefs.current[currentPostIndex];
//     if (currentVideo) {
//       currentVideo.play().catch(console.error);
//     }

//     // Pause other videos
//     videoRefs.current.forEach((video, index) => {
//       if (index !== currentPostIndex && video) {
//         video.pause();
//       }
//     });
//   }, [currentPostIndex]);

//   // Handle like/unlike post
//   const handleLikePost = async (postId, postIndex) => {
//     if (!currentUserData) return;

//     const post = posts[postIndex];
//     const isLiked = post.likes?.includes(currentUserData._id);
    
//     // Optimistic update
//     setPosts(prevPosts => {
//       const newPosts = [...prevPosts];
//       if (isLiked) {
//         newPosts[postIndex].likes = post.likes.filter(id => id !== currentUserData._id);
//       } else {
//         newPosts[postIndex].likes = [...(post.likes || []), currentUserData._id];
//       }
//       return newPosts;
//     });

//     try {
//       const endpoint = isLiked ? 'unlike' : 'like';
//       await axios.post(`${Backend_Url}/post/${endpoint}/${postId}`, {}, {
//         withCredentials: true
//       });
//     } catch (error) {
//       // Revert on error
//       setPosts(prevPosts => {
//         const newPosts = [...prevPosts];
//         newPosts[postIndex] = post;
//         return newPosts;
//       });
//       console.error(`Failed to ${isLiked ? 'unlike' : 'like'} post:`, error);
//     }
//   };

//   // Handle double tap to like
//   const handleDoubleClick = (postId, postIndex) => {
//     const post = posts[postIndex];
//     const isLiked = post.likes?.includes(currentUserData._id);
    
//     if (!isLiked) {
//       handleLikePost(postId, postIndex);
//     }
//   };

//   // Handle scroll to next/previous post
//   const handleScroll = (e) => {
//     const scrollTop = e.target.scrollTop;
//     const windowHeight = window.innerHeight;
//     const newIndex = Math.round(scrollTop / windowHeight);
    
//     if (newIndex !== currentPostIndex && newIndex >= 0 && newIndex < posts.length) {
//       setCurrentPostIndex(newIndex);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="posts-view-loading">
//         <div className="loading-spinner"></div>
//       </div>
//     );
//   }

//   if (!posts.length) {
//     return (
//       <div className="posts-view-error">
//         <button onClick={() => navigate(-1)} className="back-button">
//           <FiArrowLeft />
//         </button>
//         <p>No posts found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="posts-view-container">
//       {/* Sticky Header */}
//       <div className="posts-view-header">
//         <button onClick={() => navigate(-1)} className="back-button-s">
//           <FiArrowLeft />
//         </button>
//         <div className="header-user-info">
//           <img
//             src={profileData?.profile || "/api/placeholder/32/32"}
//             alt={profileData?.username}
//             className="header-avatar"
//           />
//           <span className="header-username">{profileData?.username}</span>
//         </div>
//         <div className="header-post-indicator">
//           {currentPostIndex + 1} / {posts.length}
//         </div>
//       </div>

//       {/* Posts Container */}
//       <div className="posts-scroll-container" onScroll={handleScroll}>
//         {posts.map((post, index) => {
//           const isLiked = post.likes?.includes(currentUserData?._id);
          
//           return (
//             <div key={post._id} className="post-view-item" >
//               <div className="post-media-wrapper" 
//               onDoubleClick={(e) => handleDoubleTap(e, post._id)} >
//                 {post.image ? (
//                   <img
//                     src={post.image}
//                     alt="Post content"
//                     className="post-media-full"
//                     onDoubleClick={() => handleDoubleClick(post._id, index)} 
//                   />
//                 ) : post.video ? (
//                   <video
//                     ref={el => videoRefs.current[index] = el}
//                     className="post-media-full"
                    
//                     loop
//                     playsInline
//                     onDoubleClick={() => handleDoubleClick(post._id, index)} 
//                   >
//                     <source src={post.video} type="video/mp4" />
//                   </video>
//                 ) : (
//                   <div className="post-no-media-full">
//                     No media available
//                   </div>
//                 )}
                
//                 {/* Post Actions */}
//                 <div className="post-actions-overlay">
//                   <button
//                     className={`like-button-s ${isLiked ? 'liked' : ''}`}
//                     onClick={() => handleLikePost(post._id, index)}
//                   >
//                     <FiHeart className={isLiked ? 'filled' : ''} />
//                   </button>
//                   <span className="like-count">
//                     {post.likes?.length || 0}
//                   </span>
//                 </div>
//                 <div className="post-caption">
//                   {/* <span className="caption-username">{profileData?.username}</span> */}
//                   <span className="caption-text">{post.description}</span>
//                 </div>
//               </div>

//               {/* Post Caption */}
              
                

//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default PostsViewPage;
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiHeart, FiMoon, FiSun, FiShare2 } from "react-icons/fi";
import "./PostViewPage.css";

const PostViewPage = () => {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [heartVisible, setHeartVisible] = useState(null);
  const postRefs = useRef([]);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", theme === "dark");
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  useEffect(() => {
    const postIndex = new URLSearchParams(location.search).get("index");
    if (postIndex) setCurrentPostIndex(parseInt(postIndex));
  }, [location]);

  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const fetchCurrentUserData = async () => {
    const res = await axios.get(`${Backend_Url}/user/me`, { withCredentials: true });
    setCurrentUserData(res.data);
    return res.data;
  };

  const fetchData = async () => {
    try {
      const profileRes = await axios.get(`${Backend_Url}/user/${id}`, { withCredentials: true });
      await fetchCurrentUserData();
      setProfileData(profileRes.data);
      setPosts(profileRes.data.posts || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async (postId, postIndex) => {
    const post = posts[postIndex];
    const isLiked = post.likes?.includes(currentUserData._id);

    setPosts(prev => {
      const updated = [...prev];
      updated[postIndex].likes = isLiked
        ? post.likes.filter(id => id !== currentUserData._id)
        : [...(post.likes || []), currentUserData._id];
      return updated;
    });

    try {
      await axios.post(`${Backend_Url}/post/${isLiked ? "unlike" : "like"}/${postId}`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Like update failed:", error);
    }
  };

  const handleDoubleTap = (postId, index) => {
    if (!posts[index].likes?.includes(currentUserData?._id)) {
      handleLikePost(postId, index);
    }
    setHeartVisible(postId);
    setTimeout(() => setHeartVisible(null), 1000);
  };

  const handleShare = (post) => {
    const shareData = {
      title: "Check out this post",
      text: post.description || "Amazing post",
      url: post.image || post.video || window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log("Share failed:", err));
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + "\n" + shareData.url)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  const handleScroll = e => {
    const scrollTop = e.target.scrollTop;
    const newIndex = Math.round(scrollTop / window.innerHeight);
    if (newIndex !== currentPostIndex && newIndex >= 0 && newIndex < posts.length) {
      setCurrentPostIndex(newIndex);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) navigate(-1);
    fetchData();
  }, [id]);

  if (isLoading) return <div className="posts-view-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="posts-view-container">
      <div className="posts-view-header">
        <button onClick={() => navigate(-1)} className="back-button-s"><FiArrowLeft /></button>
        <div className="header-user-info">
          <img src={profileData?.profile} alt="" className="header-avatar" />
          <span className="header-username">{profileData?.username}</span>
        </div>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === "light" ? <FiMoon /> : <FiSun />}
        </button>
      </div>

      <div className="posts-scroll-container" onScroll={handleScroll}>
        {posts.map((post, index) => {
          const isLiked = post.likes?.includes(currentUserData?._id);
          return (
            <div key={post._id} ref={el => postRefs.current[index] = el} className="post-view-item">
              <div className="post-media-wrapper" onDoubleClick={() => handleDoubleTap(post._id, index)}>
                {/* Post Header */}
                <div className="post-item-header">
                  <img src={profileData?.profile} className="post-avatar" alt="avatar" />
                  <span className="post-username">{profileData?.username}</span>
                </div>

                {/* Post Media */}
                {post.image ? (
                  <img src={post.image} alt="Post" className="post-media-full" />
                ) : post.video ? (
                  <video className="post-media-full" playsInline loop autoPlay muted={false}>
                    <source src={post.video} type="video/mp4" />
                  </video>
                ) : (
                  <div className="post-no-media-full">No Media</div>
                )}

                {/* Heart Animation */}
                {heartVisible === post._id && (
                  <div className="heart-float-animation">
                    <FiHeart />
                  </div>
                )}

                {/* Footer */}
                <div className="post-footer">
                  <div className="footer-actions">
                    <button className={`like-button-s ${isLiked ? "liked" : ""}`} onClick={() => handleLikePost(post._id, index)}>
                      <FiHeart />
                    </button>
                    <div className="like-count">{post.likes?.length || 0} likes</div>
                    <button className="share-btn" onClick={() => handleShare(post)}>
                      <FiShare2 />
                    </button>
                  </div>

                  <div className="footer-caption">{post.description}</div>
                  <div className="footer-date">
                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div className="footer-divider"></div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: "80px" }}></div>
      </div>
    </div>
  );
};

export default PostViewPage;

// ✅ Updated PostsViewPage.jsx (Instagram-style structured layout with theme, scroll-snapping, like, spacing)



// import { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { FiArrowLeft, FiHeart, FiSun, FiMoon } from "react-icons/fi";
// import "./PostViewPage.css";

// const PostsViewPage = () => {
//   const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [theme, setTheme] = useState("light");
//   const [posts, setPosts] = useState([]);
//   const [currentPostIndex, setCurrentPostIndex] = useState(0);
//   const [profileData, setProfileData] = useState(null);
//   const [currentUserData, setCurrentUserData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const videoRefs = useRef([]);

//   useEffect(() => {
//     document.body.classList.toggle("dark-theme", theme === "dark");
//   }, [theme]);

//   useEffect(() => {
//     const postIndex = new URLSearchParams(location.search).get("index");
//     if (postIndex) setCurrentPostIndex(parseInt(postIndex));
//   }, [location]);

//   const getAuthToken = () => localStorage.getItem("token");

//   useEffect(() => {
//     const token = getAuthToken();
//     if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//   }, []);

//   const fetchCurrentUserData = async () => {
//     try {
//       const res = await axios.get(`${Backend_Url}/user/me`, { withCredentials: true });
//       setCurrentUserData(res.data);
//     } catch (err) {
//       console.error("User fetch failed", err);
//     }
//   };

//   const fetchData = async () => {
//     try {
//       const profileRes = await axios.get(`${Backend_Url}/user/${id}`, { withCredentials: true });
//       setProfileData(profileRes.data);
//       setPosts(profileRes.data.posts || []);
//     } catch (err) {
//       console.error("Profile fetch failed", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const token = getAuthToken();
//     if (!token) return navigate(-1);
//     fetchCurrentUserData();
//     fetchData();
//   }, [id]);

//   const handleLikePost = async (postId, postIndex) => {
//     if (!currentUserData) return;
//     const post = posts[postIndex];
//     const isLiked = post.likes?.includes(currentUserData._id);

//     setPosts(prev => {
//       const newPosts = [...prev];
//       newPosts[postIndex].likes = isLiked
//         ? post.likes.filter(id => id !== currentUserData._id)
//         : [...(post.likes || []), currentUserData._id];
//       return newPosts;
//     });

//     try {
//       const endpoint = isLiked ? "unlike" : "like";
//       await axios.post(`${Backend_Url}/post/${endpoint}/${postId}`, {}, { withCredentials: true });
//     } catch (err) {
//       console.error("Like update failed", err);
//     }
//   };

//   const handleScroll = (e) => {
//     const newIndex = Math.round(e.target.scrollTop / window.innerHeight);
//     if (newIndex !== currentPostIndex) setCurrentPostIndex(newIndex);
//   };

//   if (isLoading) return <div className="posts-view-loading"><div className="loading-spinner"></div></div>;
//   if (!posts.length) return (
//     <div className="posts-view-error">
//       <button onClick={() => navigate(-1)} className="back-button-s"><FiArrowLeft /></button>
//       <p>No posts found</p>
//     </div>
//   );

//   return (
//     <div className="posts-view-container">
//       <header className="posts-view-header">
//         <button className="back-button-s" onClick={() => navigate(-1)}><FiArrowLeft /></button>
//         <div className="header-user-info">
//           <img src={profileData?.profile} className="header-avatar" alt="avatar" />
//           <span className="header-username">{profileData?.username}</span>
//         </div>
//         <button className="theme-toggle" onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}>
//           {theme === 'light' ? <FiMoon /> : <FiSun />}
//         </button>
//       </header>

//       <div className="posts-scroll-container" onScroll={handleScroll}>
//         {posts.map((post, index) => {
//           const isLiked = post.likes?.includes(currentUserData?._id);
//           return (
//             <div key={post._id} className="post-view-item">
//               <div className="post-media-wrapper">
//                 {post.image ? (
//                   <img
//                     src={post.image}
//                     className="post-media-full"
//                     onDoubleClick={() => handleLikePost(post._id, index)}
//                   />
//                 ) : post.video ? (
//                   <video
//                     ref={el => videoRefs.current[index] = el}
//                     className="post-media-full"
//                     loop
//                     playsInline
//                     onDoubleClick={() => handleLikePost(post._id, index)}
//                   >
//                     <source src={post.video} type="video/mp4" />
//                   </video>
//                 ) : (
//                   <div className="post-no-media-full">No media</div>
//                 )}

//                 <div className="post-actions-overlay">
//                   <button className={`like-button-s ${isLiked ? "liked" : ""}`} onClick={() => handleLikePost(post._id, index)}>
//                     <FiHeart className={isLiked ? "filled" : ""} />
//                   </button>
//                   <span className="like-count">{post.likes?.length || 0}</span>
//                 </div>
//                 <div className="post-caption">
//                   <span className="caption-text">{post.description}</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//         <div style={{ height: "60px" }}></div> {/* Footer Spacer */}
//       </div>
//     </div>
//   );
// };

// export default PostsViewPage;
