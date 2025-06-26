// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// // import "./U ser.css";
// // import "./UserProfile.css";

// import {
//   FaEdit,
//   FaUsers,
//   FaShare,
//   FaEnvelope,
//   FaUserMinus,
//   FaUserPlus,
// } from "react-icons/fa";

// function UserProfile() {
//   const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//   const { id } = useParams();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentUserId, setCurrentUserId] = useState(null);

//   const getAuthToken = () => {
//     return localStorage.getItem("token");
//   };

//   const fetchCurrentUserId = async (token) => {
//     try {
//       const res = await fetch(`${Backend_Url}/user/me`, {
//         method: "GET",
//         credentials: "include",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       const data = await res.json();
//       console.log(data);
      
//       setCurrentUserId(data._id);
//     } catch (err) {
//       console.error("Failed to fetch current user ID:", err);
//     }
//   };

//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = getAuthToken();
//       if (!token) {
//         setError("You need to be logged in to view this profile");
//         setLoading(false);
//         return;
//       }

//       try {
//         await fetchCurrentUserId(token);

//         const authResponse = await fetch(`${Backend_Url}/user/${id}`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!authResponse.ok) {
//           throw new Error("Failed to fetch user data");
//         }

//         const userData = await authResponse.json();
//         setUser(userData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, [id]);

//   const handleFollow = async () => {
//     const token = getAuthToken();
//     if (!token) {
//       setError("You need to be logged in to follow users");
//       return;
//     }

//     try {
//       setUser((prev) => ({
//         ...prev,
//         followers: [...prev.followers, currentUserId],
//         isFollowing: true,
//       }));

//       const response = await fetch(`${Backend_Url}/user/follow/${id}`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to follow user");
//       }
//     } catch (error) {
//       console.error(error);
//       setUser((prev) => ({
//         ...prev,
//         followers: prev.followers.filter((f) => f !== currentUserId),
//         isFollowing: false,
//       }));
//     }
//   };

//   const handleUnfollow = async () => {
//     const token = getAuthToken();
//     if (!token) {
//       setError("You need to be logged in to unfollow users");
//       return;
//     }

//     try {
//       setUser((prev) => ({
//         ...prev,
//         followers: prev.followers.filter((f) => f !== currentUserId),
//         isFollowing: false,
//       }));

//       const response = await fetch(`${Backend_Url}/user/unfollow/${id}`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to unfollow user");
//       }
//     } catch (error) {
//       console.error(error);
//       setUser((prev) => ({
//         ...prev,
//         followers: [...prev.followers, currentUserId],
//         isFollowing: true,
//       }));
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;
//   if (!user) return <p>User not found</p>;

//   return (
//     // <div>hii</div>
    
//     <div className="profile-container-s">
//       <div className="profile-picture-container-s">
//         <img
//           src={user.profile || "default-profile.png"}
//           alt="Profile"
//           className="profile-picture"
//         />
//       </div>
//       <h2>{user.username || "Unknown User"}</h2>

//       <div className="stats">
//         <div>{user.posts?.length || 0} Posts</div>
//         <div>{user.followers?.length || 0} Followers</div>
//         <div>{user.following?.length || 0} Following</div>
//       </div>

//       <div className="action-buttons">
//         <div className="btn-actions">
//           <FaEdit />
//         </div>
//         <div className="btn-actions">
//           <FaShare />
//         </div>
//         <div className="btn-actions">
//           <FaEnvelope />
//         </div>
//         <button
//           className="btn-actionsa"
//           onClick={() => window.location.href = `/user/followers/${user._id}`}
//         >
//           <FaUsers />
//         </button>
//         {user.isFollowing ? (
//           <button className="btn-actionsa" onClick={handleUnfollow}>
//             <FaUserMinus />
//           </button>
//         ) : (
//           <button className="btn-actionsa" onClick={handleFollow}>
//             <FaUserPlus />
//           </button>
//         )}
//       </div>

//       <div className="user-posts">
//         <h3>User Posts</h3>
//         {user.posts && user.posts.length > 0 ? (
//           <div className="posts-container">
//             {user.posts.map((post, index) => (
//               <div key={index} className="post-card">
//                 {post.image ? (
//                   <img
//                     src={post.image}
//                     alt="Post"
//                     className="media-content"
//                   />
//                 ) : post.video ? (
//                   <video className="media-content" autoPlay loop muted>
//                     <source src={post.video} type="video/mp4" />
//                     Your browser does not support the video tag.
//                   </video>
//                 ) : (
//                   <p>No media</p>
//                 )}
//                 {post.description && (
//                   <p className="description">{post.description}</p>
//                 )}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>No posts available</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default UserProfile;

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   FiEdit2,
//   FiShare,
//   FiMail,
//   FiUserMinus,
//   FiUserPlus,
//   FiUsers,
//   FiGrid,
//   FiBookmark,
//   FiTag,
//   FiMoreHorizontal,
//   FiSettings,
//   FiHeart,
//   FiMessageCircle,
//   FiSend
// } from "react-icons/fi";
// import "./InstagramProfile.css";

// const InstagramProfile = () => {
//   const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [profileData, setProfileData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [currentUserData, setCurrentUserData] = useState(null);
//   const [activeTab, setActiveTab] = useState('posts');
//   const [isFollowingUser, setIsFollowingUser] = useState(false);

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

//   // Fetch profile data
//   const fetchProfileData = async () => {
//     try {
//       const response = await axios.get(`${Backend_Url}/user/${id}`, {
//         withCredentials: true
//       });
//       const userData = response.data;
//       setProfileData(userData);
      
//       // Check if current user is following this profile
//       const currentUser = await fetchCurrentUserData();
//       const isFollowing = userData.followers?.some(
//         follower => follower === currentUser._id
//       );
//       setIsFollowingUser(isFollowing);
      
//     } catch (error) {
//       setErrorMessage(error.response?.data?.message || "Failed to load profile");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const token = getAuthToken();
//     if (!token) {
//       setErrorMessage("Please log in to view profiles");
//       setIsLoading(false);
//       return;
//     }
//     fetchProfileData();
//   }, [id]);

//   // Handle follow/unfollow
//   const handleFollowToggle = async () => {
//     if (!currentUserData) return;

//     const endpoint = isFollowingUser ? 'unfollow' : 'follow';
    
//     try {
//       // Optimistic update
//       setIsFollowingUser(!isFollowingUser);
//       setProfileData(prev => ({
//         ...prev,
//         followers: isFollowingUser 
//           ? prev.followers.filter(f => f !== currentUserData._id)
//           : [...prev.followers, currentUserData._id]
//       }));

//       await axios.post(`${Backend_Url}/user/${endpoint}/${id}`, {}, {
//         withCredentials: true
//       });

//     } catch (error) {
//       // Revert on error
//       setIsFollowingUser(isFollowingUser);
//       setProfileData(prev => ({
//         ...prev,
//         followers: isFollowingUser 
//           ? [...prev.followers, currentUserData._id]
//           : prev.followers.filter(f => f !== currentUserData._id)
//       }));
//       console.error(`Failed to ${endpoint} user:`, error);
//     }
//   };

//   const navigateToFollowers = () => navigate(`/user/followers/${id}`);
//   const navigateToFollowing = () => navigate(`/user/following/${id}`);

//   if (isLoading) {
//     return (
//       <div className="instagram-loading">
//         <div className="loading-spinner"></div>
//         <p>Loading profile...</p>
//       </div>
//     );
//   }

//   if (errorMessage) {
//     return (
//       <div className="instagram-error">
//         <p>{errorMessage}</p>
//         <button onClick={() => navigate(-1)} className="error-back-btn">
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   if (!profileData) {
//     return (
//       <div className="instagram-error">
//         <p>Profile not found</p>
//         <button onClick={() => navigate(-1)} className="error-back-btn">
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   const isOwnProfile = currentUserData?._id === profileData._id;

//   return (
//     <div className="instagram-profile-wrapper">
//       {/* Profile Header */}
//       <div className="instagram-profile-header">
//         <div className="profile-avatar-section">
//           <div className="profile-avatar-container">
//             <img
//               src={profileData.profile || "/api/placeholder/150/150"}
//               alt={`${profileData.username}'s profile`}
//               className="profile-avatar-image"
//             />
//           </div>
//         </div>

//         <div className="profile-info-section">
//           <div className="profile-username-row">
//             <h1 className="profile-username">{profileData.username}</h1>
//             {isOwnProfile ? (
//               <>
          
//               </>
//             ) : (
//               <>
//                 <button 
//                   className={`profile-follow-btn ${isFollowingUser ? 'following' : ''}`}
//                   onClick={handleFollowToggle}
//                 >
//                   {isFollowingUser ? 'Following' : 'Follow'}
//                 </button>
//                 <button className="profile-message-btn">Message</button>
//                 <button className="profile-more-btn">
//                   <FiMoreHorizontal />
//                 </button>
//               </>
//             )}
//           </div>

//           <div className="profile-stats-row">
//             <div className="profile-stat">
//               <span className="stat-number">{profileData.posts?.length || 0}</span>
//               <span className="stat-label">posts</span>
//             </div>
//             <button className="profile-stat" onClick={navigateToFollowers}>
//               <span className="stat-number">{profileData.followers?.length || 0}</span>
//               <span className="stat-label">followers</span>
//             </button>
//             <button className="profile-stat" onClick={navigateToFollowing}>
//               <span className="stat-number">{profileData.following?.length || 0}</span>
//               <span className="stat-label">following</span>
//             </button>
//           </div>

          
//         </div>
//       </div>

//       {/* Quick Actions (Mobile) */}
//       <div className="instagram-quick-actions">
       
//         <button className="quick-action-btn" onClick={navigateToFollowers}>
//           <FiUsers />
//         </button>
//         {!isOwnProfile && (
//           <button className="quick-action-btn" onClick={handleFollowToggle}>
//             {isFollowingUser ? <FiUserMinus /> : <FiUserPlus />}
//           </button>
//         )}
//       </div>

     
//       <div className="instagram-content-tabs">
//         <button 
//           className={`content-tab ${activeTab === 'posts' ? 'active' : ''}`}
//           onClick={() => setActiveTab('posts')}
//         >
//           <FiGrid />
//           <span>POSTS</span>
//         </button>
        
//       </div>
      

//       {/* Posts Grid */}
//       <div className="instagram-posts-grid">
//         {profileData.posts && profileData.posts.length > 0 ? (
//           profileData.posts.map((post, index) => (
//             <div key={post._id || index} className="instagram-post-item">
//               <div className="post-media-container">
//                 {post.image ? (
//                   <img
//                     src={post.image}
//                     alt="Post content"
//                     className="post-media"
//                   />
//                 ) : post.video ? (
//                   <video className="post-media" muted>
//                     <source src={post.video} type="video/mp4" />
//                   </video>
//                 ) : (
//                   <div className="post-no-media">
//                     <FiGrid />
//                   </div>
//                 )}
//                 <div className="post-overlay">
//                   <div className="post-stats">
//                     <span className="post-stat">
//                       <FiHeart />
//                       {post.likes?.length || 0}
//                     </span>
//                     <span className="post-stat">
//                       <FiMessageCircle />
//                       {post.comments?.length || 0}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="instagram-no-posts">
//             <div className="no-posts-icon">
//               <FiGrid />
//             </div>
//             <h3>No Posts Yet</h3>
//             <p>When {isOwnProfile ? 'you share' : `${profileData.username} shares`} photos and videos, they will appear on {isOwnProfile ? 'your' : 'their'} profile.</p>
//             {isOwnProfile && (
//               <button className="share-first-photo-btn">Share your first photo</button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InstagramProfile;



import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiEdit2,
  FiShare,
  FiMail,
  FiUserMinus,
  FiUserPlus,
  FiUsers,
  FiGrid,
  FiBookmark,
  FiTag,
  FiMoreHorizontal,
  FiSettings,
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiCamera,
  FiPlay,
  FiVideo,
  FiImage,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiLink
} from "react-icons/fi";
import "./InstagramProfile.css";

const InstagramProfile = () => {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  
  // New state for post page functionality
  const [showPostPage, setShowPostPage] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);

  // Get authentication token
  const getAuthToken = () => localStorage.getItem("token");

  // Setup axios interceptor for auth
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Fetch current user data
  const fetchCurrentUserData = async () => {
    try {
      const response = await axios.get(`${Backend_Url}/user/me`, {
        withCredentials: true
      });
      setCurrentUserData(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      throw error;
    }
  };

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${Backend_Url}/user/${id}`, {
        withCredentials: true
      });
      const userData = response.data;
      setProfileData(userData);
      
      // Separate posts and reels
      const userPosts = userData.posts || [];
      const normalPosts = userPosts.filter(post => !post.isReel);
      const videoReels = userPosts.filter(post => post.isReel);
      
      setPosts(normalPosts);
      setReels(videoReels);
      
      // Check if current user is following this profile
      const currentUser = await fetchCurrentUserData();
      const isFollowing = userData.followers?.some(
        follower => follower === currentUser._id
      );
      setIsFollowingUser(isFollowing);
      
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setErrorMessage("Please log in to view profiles");
      setIsLoading(false);
      return;
    }
    fetchProfileData();
  }, [id]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUserData) return;

    const endpoint = isFollowingUser ? 'unfollow' : 'follow';
    
    try {
      // Optimistic update
      setIsFollowingUser(!isFollowingUser);
      setProfileData(prev => ({
        ...prev,
        followers: isFollowingUser 
          ? prev.followers.filter(f => f !== currentUserData._id)
          : [...prev.followers, currentUserData._id]
      }));

      await axios.post(`${Backend_Url}/user/${endpoint}/${id}`, {}, {
        withCredentials: true
      });

    } catch (error) {
      // Revert on error
      setIsFollowingUser(isFollowingUser);
      setProfileData(prev => ({
        ...prev,
        followers: isFollowingUser 
          ? [...prev.followers, currentUserData._id]
          : prev.followers.filter(f => f !== currentUserData._id)
      }));
      console.error(`Failed to ${endpoint} user:`, error);
    }
  };

  // Handle post click to show post page
  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setShowPostPage(true);
  };

  // Handle close post page
  const handleClosePostPage = () => {
    setShowPostPage(false);
    setSelectedPostId(null);
  };

  const navigateToFollowers = () => navigate(`/user/followers/${id}`);
  const navigateToFollowing = () => navigate(`/user/following/${id}`);

  if (isLoading) {
    return (
      <div className="instagram-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="instagram-error">
        <p>{errorMessage}</p>
        <button onClick={() => navigate(-1)} className="error-back-btn">
          Go Back
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="instagram-error">
        <p>Profile not found</p>
        <button onClick={() => navigate(-1)} className="error-back-btn">
          Go Back
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUserData?._id === profileData._id;

  return (
    <div className="instagram-profile-wrapper">
      {/* Animated Background */}
      <div className="profile-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Profile Header */}
      <div className="instagram-profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            <div className="avatar-ring">
              <div className="avatar-ring-inner">
                <img
                  src={profileData.profile || "/api/placeholder/150/150"}
                  alt={`${profileData.username}'s profile`}
                  className="profile-avatar-image"
                />
              </div>
            </div>
            <div className="avatar-status-dot"></div>
          </div>
        </div>

        <div className="profile-info-section">
          <div className="profile-username-row">
            <h1 className="profile-username">
              {profileData.username}
              <div className="username-verified">✓</div>
            </h1>
            {isOwnProfile ? (
              <div className="profile-actions">
                <button className="profile-edit-btn">
                  <FiEdit2 />
                  Edit Profile
                </button>
                <button className="profile-settings-btn">
                  <FiSettings />
                </button>
              </div>
            ) : (
              <div className="profile-actions">
                <button 
                  className={`profile-follow-btn ${isFollowingUser ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowingUser ? (
                    <>
                      <FiUserMinus />
                      Following
                    </>
                  ) : (
                    <>
                      <FiUserPlus />
                      Follow
                    </>
                  )}
                </button>
                <button className="profile-message-btn">
                  <FiSend />
                  Message
                </button>
                <button className="profile-more-btn">
                  <FiMoreHorizontal />
                </button>
              </div>
            )}
          </div>

          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="stat-number">{(posts.length + reels.length) || 0}</span>
              <span className="stat-label">posts</span>
              <div className="stat-glow"></div>
            </div>
            <button className="profile-stat" onClick={navigateToFollowers}>
              <span className="stat-number">{profileData.followers?.length || 0}</span>
              <span className="stat-label">followers</span>
              <div className="stat-glow"></div>
            </button>
            <button className="profile-stat" onClick={navigateToFollowing}>
              <span className="stat-number">{profileData.following?.length || 0}</span>
              <span className="stat-label">following</span>
              <div className="stat-glow"></div>
            </button>
          </div>

          {profileData.bio && (
            <div className="profile-bio">
              <p>{profileData.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="instagram-quick-actions">
        <button className="quick-action-btn">
          <div className="action-icon">
            <FiCamera />
          </div>
          <span>Stories</span>
        </button>
        <button className="quick-action-btn" onClick={navigateToFollowers}>
          <div className="action-icon">
            <FiUsers />
          </div>
          <span>Friends</span>
        </button>
        {!isOwnProfile && (
          <button className="quick-action-btn" onClick={handleFollowToggle}>
            <div className="action-icon">
              {isFollowingUser ? <FiUserMinus /> : <FiUserPlus />}
            </div>
            <span>{isFollowingUser ? 'Unfollow' : 'Follow'}</span>
          </button>
        )}
        <button className="quick-action-btn">
          <div className="action-icon">
            <FiShare />
          </div>
          <span>Share</span>
        </button>
      </div>

      {/* Content Tabs */}
      <div className="instagram-content-tabs">
        <button 
          className={`content-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FiGrid />
          <span>POSTS</span>
          <div className="tab-indicator"></div>
        </button>
        <button 
          className={`content-tab ${activeTab === 'reels' ? 'active' : ''}`}
          onClick={() => setActiveTab('reels')}
        >
          <FiVideo />
          <span>REELS</span>
          <div className="tab-indicator"></div>
        </button>
        <button 
          className={`content-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <FiBookmark />
          <span>SAVED</span>
          <div className="tab-indicator"></div>
        </button>
      </div>

      {/* Posts Grid */}
      <div className="instagram-posts-grid">
        {activeTab === 'posts' && posts.length > 0 ? (
          posts.map((post, index) => (
            <div 
              key={post._id || index} 
              className="instagram-post-item"
              onClick={() => handlePostClick(post._id)}
            >
              <div className="post-media-container">
                {post.image ? (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="post-media"
                    loading="lazy"
                  />
                ) : post.video ? (
                  <div className="post-video-container">
                    <video className="post-media" muted>
                      <source src={post.video} type="video/mp4" />
                    </video>
                    <div className="video-play-icon">
                      <FiPlay />
                    </div>
                  </div>
                ) : (
                  <div className="post-no-media">
                    <FiImage />
                  </div>
                )}
                <div className="post-overlay">
                  <div className="post-stats">
                    <span className="post-stat">
                      <FiHeart />
                      {post.likes?.length || 0}
                    </span>
                    <span className="post-stat">
                      <FiMessageCircle />
                      {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="post-type-indicator">
                  {post.video ? <FiVideo /> : <FiImage />}
                </div>
              </div>
            </div>
          ))
        ) : activeTab === 'reels' && reels.length > 0 ? (
          reels.map((reel, index) => (
            <div 
              key={reel._id || index} 
              className="instagram-post-item reel-item"
              onClick={() => handlePostClick(reel._id)}
            >
              <div className="post-media-container">
                <video className="post-media" muted>
                  <source src={reel.video} type="video/mp4" />
                </video>
                <div className="reel-play-icon">
                  <FiPlay />
                </div>
                <div className="post-overlay">
                  <div className="post-stats">
                    <span className="post-stat">
                      <FiHeart />
                      {reel.likes?.length || 0}
                    </span>
                    <span className="post-stat">
                      <FiMessageCircle />
                      {reel.comments?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="reel-indicator">REEL</div>
              </div>
            </div>
          ))
        ) : (
          <div className="instagram-no-posts">
            <div className="no-posts-animation">
              <div className="no-posts-icon">
                {activeTab === 'posts' ? <FiGrid /> : 
                 activeTab === 'reels' ? <FiVideo /> : <FiBookmark />}
              </div>
            </div>
            <h3>No {activeTab === 'posts' ? 'Posts' : activeTab === 'reels' ? 'Reels' : 'Saved Posts'} Yet</h3>
            <p>
              {activeTab === 'posts' 
                ? `When ${isOwnProfile ? 'you share' : `${profileData.username} shares`} photos and videos, they will appear here.`
                : activeTab === 'reels'
                ? `When ${isOwnProfile ? 'you create' : `${profileData.username} creates`} reels, they will appear here.`
                : 'Saved posts will appear here.'
              }
            </p>
            {isOwnProfile && activeTab === 'posts' && (
              <button className="share-first-photo-btn">
                <FiCamera />
                Share your first photo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post Page Modal */}
      {showPostPage && (
        <InstagramPostPage
          posts={activeTab === 'posts' ? posts : activeTab === 'reels' ? reels : []}
          user={profileData}
          onClose={handleClosePostPage}
          initialPostId={selectedPostId}
          currentUser={currentUserData}
        />
      )}
    </div>
  );
};

// InstagramPostPage Component (you'll need to create this)
const InstagramPostPage = ({ posts, user, onClose, initialPostId, currentUser }) => {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  useEffect(() => {
    if (initialPostId) {
      const index = posts.findIndex(post => post._id === initialPostId);
      if (index !== -1) {
        setCurrentPostIndex(index);
      }
    }
  }, [initialPostId, posts]);

  const currentPost = posts[currentPostIndex];

  const handleNextPost = () => {
    setCurrentPostIndex((prev) => (prev + 1) % posts.length);
  };

  const handlePrevPost = () => {
    setCurrentPostIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  if (!currentPost) return null;

  return (
    <div className="instagram-post-page-overlay">
      <div className="instagram-post-page">
        <div className="post-page-header">
          <button className="post-page-close" onClick={onClose}>
            <FiX />
          </button>
          <div className="post-page-user">
            <img src={user.profile || "/api/placeholder/40/40"} alt={user.username} />
            <span>{user.username}</span>
          </div>
          <div className="post-page-actions">
            <button><FiMoreHorizontal /></button>
          </div>
        </div>

        <div className="post-page-content">
          <div className="post-page-media">
            {currentPost.image ? (
              <img src={currentPost.image} alt="Post content" />
            ) : (
              <video controls>
                <source src={currentPost.video} type="video/mp4" />
              </video>
            )}
            
            {posts.length > 1 && (
              <>
                <button className="post-nav-btn prev" onClick={handlePrevPost}>
                  <FiChevronLeft />
                </button>
                <button className="post-nav-btn next" onClick={handleNextPost}>
                  <FiChevronRight />
                </button>
              </>
            )}
          </div>

          <div className="post-page-sidebar">
            <div className="post-actions">
              <button className="post-action-btn">
                <FiHeart />
              </button>
              <button className="post-action-btn">
                <FiMessageCircle />
              </button>
              <button className="post-action-btn">
                <FiSend />
              </button>
            </div>

            <div className="post-likes">
              <span>{currentPost.likes?.length || 0} likes</span>
            </div>

            <div className="post-caption">
              <strong>{user.username}</strong> {currentPost.caption}
            </div>

            <div className="post-comments">
              {currentPost.comments?.map((comment, index) => (
                <div key={index} className="post-comment">
                  <strong>{comment.username}</strong> {comment.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramProfile;