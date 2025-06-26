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
  FiSend
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
      {/* Profile Header */}
      <div className="instagram-profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            <img
              src={profileData.profile || "/api/placeholder/150/150"}
              alt={`${profileData.username}'s profile`}
              className="profile-avatar-image"
            />
          </div>
        </div>

        <div className="profile-info-section">
          <div className="profile-username-row">
            <h1 className="profile-username">{profileData.username}</h1>
            {isOwnProfile ? (
              <>
                {/* <button className="profile-edit-btn">Edit profile</button>
                <button className="profile-settings-btn">
                  <FiSettings />
                </button> */}
              </>
            ) : (
              <>
                <button 
                  className={`profile-follow-btn ${isFollowingUser ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowingUser ? 'Following' : 'Follow'}
                </button>
                <button className="profile-message-btn">Message</button>
                <button className="profile-more-btn">
                  <FiMoreHorizontal />
                </button>
              </>
            )}
          </div>

          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="stat-number">{profileData.posts?.length || 0}</span>
              <span className="stat-label">posts</span>
            </div>
            <button className="profile-stat" onClick={navigateToFollowers}>
              <span className="stat-number">{profileData.followers?.length || 0}</span>
              <span className="stat-label">followers</span>
            </button>
            <button className="profile-stat" onClick={navigateToFollowing}>
              <span className="stat-number">{profileData.following?.length || 0}</span>
              <span className="stat-label">following</span>
            </button>
          </div>

          {/* <div className="profile-bio-section">
            <div className="profile-display-name">{profileData.fullName || profileData.username}</div>
            {profileData.bio && <div className="profile-bio">{profileData.bio}</div>}
            {profileData.website && (
              <a href={profileData.website} className="profile-website" target="_blank" rel="noopener noreferrer">
                {profileData.website}
              </a>
            )}
          </div> */}
        </div>
      </div>

      {/* Quick Actions (Mobile) */}
      {/* <div className="instagram-quick-actions">
        <button className="quick-action-btn">
          <FiEdit2 />
        </button>
        <button className="quick-action-btn">
          <FiShare />
        </button>
        <button className="quick-action-btn">
          <FiMail />
        </button>
        <button className="quick-action-btn" onClick={navigateToFollowers}>
          <FiUsers />
        </button>
        {!isOwnProfile && (
          <button className="quick-action-btn" onClick={handleFollowToggle}>
            {isFollowingUser ? <FiUserMinus /> : <FiUserPlus />}
          </button>
        )}
      </div> */}

      {/* Highlights Section */}
      {/* <div className="instagram-highlights">
        <div className="highlight-item">
          <div className="highlight-circle">
            <span>+</span>
          </div>
          <span className="highlight-label">New</span>
        </div>
      </div> */}

      {/* Content Tabs */}
      <div className="instagram-content-tabs">
        <button 
          className={`content-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FiGrid />
          <span>POSTS</span>
        </button>
        {/* <button 
          className={`content-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <FiBookmark />
          <span>SAVED</span>
        </button>
        <button 
          className={`content-tab ${activeTab === 'tagged' ? 'active' : ''}`}
          onClick={() => setActiveTab('tagged')}
        >
          <FiTag />
          <span>TAGGED</span>
        </button> */}
      </div>
      

      {/* Posts Grid */}
      <div className="instagram-posts-grid">
        {profileData.posts && profileData.posts.length > 0 ? (
          profileData.posts.map((post, index) => (
            <div key={post._id || index} className="instagram-post-item">
              <div className="post-media-container">
                {post.image ? (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="post-media"
                  />
                ) : post.video ? (
                  <video className="post-media" muted>
                    <source src={post.video} type="video/mp4" />
                  </video>
                ) : (
                  <div className="post-no-media">
                    <FiGrid />
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
              </div>
            </div>
          ))
        ) : (
          <div className="instagram-no-posts">
            <div className="no-posts-icon">
              <FiGrid />
            </div>
            <h3>No Posts Yet</h3>
            <p>When {isOwnProfile ? 'you share' : `${profileData.username} shares`} photos and videos, they will appear on {isOwnProfile ? 'your' : 'their'} profile.</p>
            {isOwnProfile && (
              <button className="share-first-photo-btn">Share your first photo</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramProfile;