// import { useState, useEffect } from "react";
// import "./User.css";
// import {
//     FaEdit, FaTrash, FaUsers, FaShare, FaEnvelope, FaSignOutAlt, FaCog, FaTimes,
//     FaInfoCircle,
//     FaShieldAlt
// } from "react-icons/fa";

// function Profile() {
//     const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(null);
//     const [posts, setPosts] = useState([]);
//     const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//     const [uploading, setUploading] = useState(false);
//     const [selectedPost, setSelectedPost] = useState(null);
//     const handlePostClick = (post) => {
//         setSelectedPost(post);
//     };
    
//     const handleClosePost = () => {
//         setSelectedPost(null);
//     };
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (selectedPost && !event.target.closest(".expanded-media")) {
//                 handleClosePost();
//             }
//         };
    
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [selectedPost]);
//     useEffect(() => {

//         fetchUserData();

//         const fetchUser = async () => {
//             try {
//                 const token = localStorage.getItem("token");
//                 if (!token) throw new Error("No token found");

//                 const response = await fetch(`${Backend_Url}/auth/check`, {
//                     method: "GET",
//                     headers: { Authorization: `Bearer ${token}` },
//                 });   

//                 if (!response.ok) throw new Error("Failed to fetch user data");

//                 const data = await response.json();
//                 setUser(data.user);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUser();

//     }, []);

//     const fetchUserData = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             if (!token) throw new Error("No token found");

//             const response = await fetch(`${Backend_Url}/auth/check`, {
//                 method: "GET",
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (!response.ok) throw new Error("Failed to fetch user data");

//             const data = await response.json();
//             setUser(data.user);
//             localStorage.setItem("user", JSON.stringify(data.user));
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (!user) return;
//         fetchUserPosts();
//     }, [user]);

//     const fetchUserPosts = async () => {
//         try {
//             const response = await fetch(`${Backend_Url}/talk`);
//             if (!response.ok) throw new Error("Failed to fetch posts");

//             const data = await response.json();
//             const userPosts = data.filter(post => post.owner._id === user._id);
//             setPosts(userPosts);
//         } catch (err) {
//             console.error("Error fetching posts:", err);
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         window.location.href = "/login";
//     };

//     const toggleSettings = () => {
//         setIsSettingsOpen(!isSettingsOpen);
//     };

//     const handleFileChange = async (event) => {
//         const file = event.target.files[0];
//         if (file) {
//             setUploading(true);
//             await uploadProfilePicture(file);
//             setUploading(false);
//         }
//     };

//     const uploadProfilePicture = async (file) => {
//         const token = localStorage.getItem("token");
//         const formData = new FormData();
//         formData.append("profilePicture", file);

//         try {
//             const response = await fetch(`${Backend_Url}/user/profile/picture`, {
//                 method: "POST",
//                 headers: { Authorization: `Bearer ${token}` },
//                 body: formData,
//             });

//             if (!response.ok) throw new Error("Failed to upload profile picture");

//             const data = await response.json();
//             setUser((prevUser) => ({ ...prevUser, profile: data.profilePicture }));
//             localStorage.setItem("user", JSON.stringify({ ...user, profile: data.profilePicture }));
//             await fetchUserData();
//         } catch (err) {
//             console.error("Upload failed:", err);
//         }
//     };

//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>Error: {error}</p>;

//     return (
//         <div className="profile-page">
//             {/* Header with Settings Icon */}
//             <header className="header">
//                 <div className="header-content">
//                     <h1>Profile</h1>
//                     <div className="settings-icon" onClick={toggleSettings}>
//                         {isSettingsOpen ? <FaTimes /> : <FaCog />}
//                     </div>
//                 </div>
//             </header>

//             {/* Right-Side Sidebar */}
//             <div className={`sidebar ${isSettingsOpen ? "open" : ""}`}>
//                 <div className="sidebar-content">
//                     <div className="settings-icon-2" onClick={toggleSettings}>
//                         {isSettingsOpen ? <FaTimes /> : <FaCog />}
//                     </div>
//                     <div className="sidebar-item" onClick={handleLogout}>
//                         <FaSignOutAlt /> Logout
//                     </div>
//                     <div className="sidebar-item" onClick={() =>  document.getElementById("fileInput").click()}>
//                         <FaEdit /> Edit Profile
//                     </div>
//                     <div className="sidebar-item" onClick={() => window.location.href = "/talk/notifications"}>
//                         <FaEnvelope /> Notifications
//                     </div>
//                     <div className="sidebar-item" onClick={() => window.location.href = "/talk/about-us"}>
//     <FaInfoCircle /> About Us
// </div>
// <div className="sidebar-item" onClick={() => window.location.href = "/talk/contact-us"}>
//     <FaEnvelope /> Contact Us
// </div>
// <div className="sidebar-item" onClick={() => window.location.href = "/talk/privacy-policy"}>
//     <FaShieldAlt /> Privacy Policy
// </div>
//                 </div>
//             </div>

//             {/* Profile Content */}
//             <div className="profile-container">
//                 <div className="profile-picture-container">
//                     <img src={user.profile || "default-profile.png"} alt="Profile" className="profile-picture" />

//                     <input
//                         type="file"
//                         id="fileInput"
//                         style={{ display: "none" }}
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         disabled={uploading}
//                     />
//                 </div>

//                 <h2>{user.username || "Unknown User"}</h2>

//                 <div className="stats">
//                     <div>{posts.length} Posts</div>
//                     <div>{(user.followers && user.followers.length) || 0} Followers</div>
//                     <div>{(user.following && user.following.length) || 0} Following</div>
//                 </div>

//                 <div className="action-buttons">
//                     <div 
//                         className="btn-actions" 
//                         onClick={() => !uploading && document.getElementById("fileInput").click()}
//                         style={{ opacity: uploading ? 0.5 : 1, cursor: uploading ? "not-allowed" : "pointer" }}
//                     >
//                         {uploading ? "Uploading..." : <FaEdit />}
//                     </div>

//                     <div className="btn-actions"><FaTrash /></div>
//                     <form action={`/user/followers/${user._id || "#"}`} method="GET">
//                         <button className="btn-actions" style={{ border: "none" }} type="submit">
//                             <FaUsers />
//                         </button>
//                     </form>
//                     <div className="btn-actions"><FaShare /></div>
//                     <div className="btn-actions"><FaEnvelope /></div>
//                 </div>

//                 {/* User Posts Section */}
//                 <div className="posts-container">
//                     {posts.length > 0 ? (
//                         posts.map((post) => (
//                             <div key={post._id} className="post-card"    onClick={() => handlePostClick(post)}>
//                                 {post.image ? (
//                                     <img src={post.image} alt="Post" className="media-content-1" />
//                                 ) : post.video ? (
//                                     <video controls className="media-content">
//                                         <source src={post.video} type="video/mp4" />
//                                         Your browser does not support the video tag.
//                                     </video>
//                                 ) : null}
//                             </div>
//                         ))
//                     ) : (
//                         <p>No posts available.</p>
//                     )}

//                 </div>
//                  {/* Expanded Media Section */}
//                  {selectedPost && (
//                     <div className="expanded-media-overlay">
//                         <div className="expanded-media">
//                             {selectedPost.image ? (
//                                 <img src={selectedPost.image} alt="Expanded Post" />
//                             ) : selectedPost.video ? (
//                                 <video controls autoPlay>
//                                     <source src={selectedPost.video} type="video/mp4" />
//                                     Your browser does not support the video tag.
//                                 </video>
//                             ) : null}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Profile;
import { useState, useEffect, useRef } from "react";
import "./User.css";
import {
    FaEdit, FaTrash, FaUsers, FaShare, FaEnvelope, FaSignOutAlt, FaCog, FaTimes,
    FaInfoCircle, FaShieldAlt, FaRegBookmark, FaRegHeart, FaHeart, FaPlay,
    FaEllipsisH, FaRegComment, FaBars, FaCamera
} from "react-icons/fa";
import { CgMediaLive } from "react-icons/cg";

import { useNavigate, useParams } from "react-router-dom";
import { RiLayoutGridFill, RiMovie2Fill, RiBookmarkFill } from "react-icons/ri";
// Add this import statement at the top of your Profile.js file
import InstagramPostPage from './InstagramPage'; // Adjust the path according to where you've saved the component
function Profile() {
    const Backend_Url = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reels, setReels] = useState([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [likedPosts, setLikedPosts] = useState({});
    const [showStoryModal, setShowStoryModal] = useState(false);
    const profileRef = useRef(null);
    const [showPostPage, setShowPostPage] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
   
    
    const handleClosePostPage = () => {
      setShowPostPage(false);
    };
    // Handle scrolling effects
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            if (scrollPosition > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Make sure to remove animated class that might be causing initial invisibility
    useEffect(() => {
        // Force profile container to be visible immediately rather than animated
        const profileContainer = document.querySelector('.profile-container');
        if (profileContainer) {
            profileContainer.classList.add('loaded');
        }
        
        // Fetch user data on component mount
        fetchUserData();
    }, []);
     
    const handlePostClick = (post) => {
        setSelectedPost(post);
        setSelectedPostId(post._id);
        setShowPostPage(true);
    };
    
    const handleClosePost = () => {
        setSelectedPost(null);
        document.body.style.overflow = 'auto';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectedPost && !event.target.closest(".expanded-media") && !event.target.closest(".post-actions-expanded")) {
                handleClosePost();
            }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedPost]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                // For development/testing - create dummy user when no token is available
                const dummyUser = {
                    _id: "dummy123",
                    username: "profile_user",
                    profile: "https://via.placeholder.com/150",
                    bio: "This is a test profile bio",
                    followers: [],
                    following: []
                };
                setUser(dummyUser);
                
                // Also set some dummy posts for testing display
                const dummyPosts = Array(6).fill().map((_, i) => ({
                    _id: `post${i}`,
                    image: `https://via.placeholder.com/300`,
                    description: `Test post ${i}`,
                    likes: Math.floor(Math.random() * 100),
                    comments: Math.floor(Math.random() * 20),
                    createdAt: new Date().toISOString(),
                    owner: dummyUser
                }));
                
                setPosts(dummyPosts);
                setReels([]);
                setLoading(false);
                return;
            }

            const response = await fetch(`${Backend_Url}/auth/check`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch user data");

            const data = await response.json();
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            // Immediately fetch posts once user data is available
            fetchUserPosts(data.user);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to load profile data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // const fetchUserPosts = async (userData) => {
    //     try {
    //         const currentUser = userData || user;
    //         if (!currentUser) return;
            
    //         const response = await fetch(`${Backend_Url}/talk`);
    //         if (!response.ok) throw new Error("Failed to fetch posts");

    //         const data = await response.json();
    //         const userPosts = data.filter(post => post.owner._id === currentUser._id);
            
    //         // Separate posts and reels
    //         const postsArray = userPosts.filter(post => post.image);
    //         const reelsArray = userPosts.filter(post => post.video);
            
    //         setPosts(postsArray);
    //         setReels(reelsArray);
    //     } catch (err) {
    //         console.error("Error fetching posts:", err);
    //         // If posts can't be fetched, don't block the whole UI
    //         // Just show empty states instead
    //     }
    // };
//     const fetchUserPosts = async (userData) => {
//     try {
//         const currentUser = userData || user;
//         if (!currentUser) return;

//         const response = await fetch(`${Backend_Url}/talk`);
//         if (!response.ok) throw new Error("Failed to fetch posts");

//         const data = await response.json();

//         // Check if the response is an array or has a 'posts' property
//         const allPosts = Array.isArray(data) ? data : (Array.isArray(data.posts) ? data.posts : []);

//         const userPosts = allPosts.filter(post => post.owner?._id === currentUser._id);

//         // Separate posts and reels
//         const postsArray = userPosts.filter(post => post.image);
//         const reelsArray = userPosts.filter(post => post.video);

//         setPosts(postsArray);
//         setReels(reelsArray);
//     } catch (err) {
//         console.error("Error fetching posts:", err);
//         setPosts([]);
//         setReels([]);
//     }
// };
const fetchUserPosts = async (userData) => {
    try {
        const currentUser = userData || user;
        if (!currentUser) return;

        const response = await fetch(`${Backend_Url}/talk/all`);
        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();

          console.log("Fetched Posts:", data);
        const allPosts = Array.isArray(data) ? data : (Array.isArray(data.posts) ? data.posts : []);
       const userPosts = allPosts.filter(post => 
    post.owner && String(post.owner._id) === String(currentUser._id)
);
        console.log("User Posts:", userPosts);
console.log("Current user ID:", currentUser._id);
console.log("All post owners:", allPosts.map(p => p.owner?._id));

        const postsArray = [];
        const reelsArray = [];

        userPosts.forEach(post => {
            if (post.image) postsArray.push(post);
            if (post.video) reelsArray.push(post);
        });

        console.log("Fetched Posts:", postsArray.length);
        console.log("Fetched Reels:", reelsArray.length);

        setPosts(postsArray);
        setReels(reelsArray);
    } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
        setReels([]);
    }
};



    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploading(true);
            await uploadProfilePicture(file);
            setUploading(false);
        }
    };

    const uploadProfilePicture = async (file) => {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("profile", file);

        try {
            const response = await fetch(`${Backend_Url}/user/profile/picture`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to upload profile picture");

            const data = await response.json();
            setUser((prevUser) => ({ ...prevUser, profile: data.profilePicture }));
            localStorage.setItem("user", JSON.stringify({ ...user, profile: data.profilePicture }));
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    const handleLike = (postId) => {
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const showAddStory = () => {
        setShowStoryModal(true);
    };

    const closeStoryModal = () => {
        setShowStoryModal(false);
    };
    // const navigate= useNavigate();
    const navigateToFollowers = () => navigate(`/user/followers/${id}`);
  const navigateToFollowing = () => navigate(`/user/following/${id}`);


    if (loading) return (
        <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
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

    if (!user) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p>User profile not found</p>
            <button onClick={() => window.location.href = "/login"} className="retry-button">
                Go to Login
            </button>
        </div>
    );

    return (
        <div className="profile-page">
            {/* Header with Settings Icon */}
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-content">
                    <h1>{user.username || "Profile"}</h1>
                    <div className="settings-icon" onClick={toggleSettings}>
                        {isSettingsOpen ? <FaTimes /> : <FaCog />}
                    </div>
                </div>
            </header>

            {/* Settings Sidebar */}
            <div className={`sidebar ${isSettingsOpen ? "open" : ""}`}>
                <div className="sidebar-content">
                    <div className="sidebar-header">
                        <h2>Settings</h2>
                        <div className="settings-icon-2" onClick={toggleSettings}>
                            <FaTimes />
                        </div>
                    </div>
                    
                    <div className="sidebar-items">
                        <div className="sidebar-item" onClick={() => document.getElementById("fileInput").click()}>
                            <FaEdit /> <span>Edit Profile</span>
                        </div>
                        <div className="sidebar-item" onClick={() => window.location.href = "/talk/notifications"}>
                            <FaEnvelope /> <span>Messages</span>
                        </div>
                        <div className="sidebar-item" onClick={() => window.location.href = "/talk/about-us"}>
                            <FaInfoCircle /> <span>About Us</span>
                        </div>
                        <div className="sidebar-item" onClick={() => window.location.href = "/talk/contact-us"}>
                            <FaEnvelope /> <span>Contact Us</span>
                        </div>
                        <div className="sidebar-item" onClick={() => window.location.href = "/talk/privacy-policy"}>
                            <FaShieldAlt /> <span>Privacy Policy</span>
                        </div>
                        <div className="sidebar-item logout" onClick={handleLogout}>
                            <FaSignOutAlt /> <span>Logout</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Content - Added inline style to ensure visibility */}
            <div 
                className="profile-container loaded" 
                ref={profileRef} 
                style={{
                    display: 'block',
                    opacity: 1,
                    transform: 'translateY(0)',
                    visibility: 'visible'
                }}
            >
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-picture-section">
                            <div 
                                className="profile-picture-container"
                                onClick={() => !uploading && document.getElementById("fileInput").click()}
                            >
                                <img src={user.profile || "https://via.placeholder.com/150"} alt="Profile" className="profile-picture" />
                                {!uploading && <div className="profile-picture-overlay">
                                    <FaCamera className="camera-icon" />
                                </div>}
                                {uploading && <div className="uploading-overlay">
                                    <div className="uploading-spinner"></div>
                                </div>}
                            </div>
                            
                            <div className="story-ring" onClick={() => document.getElementById("fileInput").click()}>
                               
                                <div className="add-story-button" onClick={() => document.getElementById("fileInput").click()}>+
                                    
                                </div>
                            </div>

                            <input
                                type="file"
                                id="fileInput"
                                style={{ display: "none" }}
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                        </div>

                        <div className="profile-info">
                            <div className="username-container">
                                <h2 className="username">{user.username || "Unknown User"}</h2>
                                <div className="verified-badge" title="Verified Account">✓</div>
                            </div>
                            
                            <div className="bio-section">
                                {user.bio || "No bio yet. Tap edit profile to add your bio."}
                            </div>

                            <div className="profile-actions">
                                <button className="edit-profile-btn" onClick={() => document.getElementById("fileInput").click()}>
                                    Edit Profile
                                </button>
                                {/* <button className="share-profile-btn">
                                    <FaShare />
                                </button> */}
                                <button className="more-options-btn" onClick={() => setShowProfileOptions(!showProfileOptions)}>
                                    <FaEllipsisH />
                                </button>
                                
                                {showProfileOptions && (
                                    <div className="profile-options-dropdown">
                                        {/* <div className="option-item">QR Code</div>
                                        <div className="option-item">Share Profile</div> */}
                                        <div className="option-item" onClick={handleLogout}>Logout</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="stats-container">
                        <div className="stat-item">
                            <div className="stat-count">{posts.length + reels.length}</div>
                            <div className="stat-label">Posts</div>
                        </div>
                        <div className="stat-item" onClick={navigateToFollowers}>
                            <div className="stat-count"  onClick={navigateToFollowers}>{(user.followers && user.followers.length) || 0}</div>
                            <div className="stat-label"  onClick={navigateToFollowers}>Followers</div>
                        </div>
                        <div className="stat-item" onClick={navigateToFollowing}>
                            <div className="stat-count" onClick={navigateToFollowing}>{(user.following && user.following.length) || 0}</div>
                            <div className="stat-label"  onClick={navigateToFollowing}>Following</div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="content-tabs">
                    <div 
                        className={`tab ${activeTab === 'posts' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('posts')}
                    >
                        <RiLayoutGridFill />
                    </div>
                    <div 
                        className={`tab ${activeTab === 'reels' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('reels')}
                    >
                        <RiMovie2Fill />
                    </div>
                    {/* <div 
                        className={`tab ${activeTab === 'saved' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('saved')}
                    >
                        <RiBookmarkFill />
                    </div>
                    <div 
                        className={`tab ${activeTab === 'tagged' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('tagged')}
                    >
                        <FaUsers />
                    </div> */}
                </div>

                {/* Content sections based on active tab */}
                <div className="content-section">
                    {activeTab === 'posts' && (
                        <div className="posts-grid">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <div key={post._id} className="post-item" onClick={() => handlePostClick(post)}>
                                        <img src={post.image} alt="Post" className="post-thumbnail" />
                                        <div className="post-overlay">
                                            <div className="post-stats">
                                                <span><FaHeart /> {post.likes || 0}</span>
                                                <span><FaRegComment /> {post.comments || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📷</div>
                                    <p>No posts yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reels' && (
                        <div className="reels-grid">
                            {reels.length > 0 ? (
                                reels.map((reel) => (
                                    <div key={reel._id} className="reel-item" onClick={() => handlePostClick(reel)}>
                                        <video className="reel-thumbnail">
                                            <source src={reel.video} type="video/mp4" />
                                        </video>
                                        <div className="reel-overlay">
                                            <div className="play-icon">
                                                <FaPlay />
                                            </div>
                                            <div className="reel-stats">
                                                <span><FaHeart /> {reel.likes || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">🎬</div>
                                    <p>No reels yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="saved-content empty-state">
                            <div className="empty-icon">🔖</div>
                            <p>No saved items</p>
                        </div>
                    )}

                    {activeTab === 'tagged' && (
                        <div className="tagged-content empty-state">
                            <div className="empty-icon">👤</div>
                            <p>No tagged posts</p>
                        </div>
                    )}
                </div>
                
                {showPostPage && (
  <InstagramPostPage
    posts={activeTab === 'posts' ? posts : activeTab === 'reels' ? reels : []}
    user={user}
    onClose={handleClosePostPage}
    initialPostId={selectedPostId}
  />
)}

                {/* Expanded Post View */}
                {/* {selectedPost && (
                    <div className="expanded-media-overlay">
                        <div className="post-header">
                            <div className="post-user-info">
                                <img src={user.profile} alt={user.username} className="user-pic" />
                                <span className="username">{user.username}</span>
                            </div>
                            <button className="close-post" onClick={handleClosePost}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="expanded-media">
                            {selectedPost.image ? (
                                <img src={selectedPost.image} alt="Expanded Post" />
                            ) : selectedPost.video ? (
                                <video controls autoPlay loop>
                                    <source src={selectedPost.video} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : null}
                        </div>
                        
                        <div className="post-actions-expanded">
                            <div className="post-action-buttons">
                                <button className={`action-btn ${likedPosts[selectedPost._id] ? 'active' : ''}`} onClick={() => handleLike(selectedPost._id)}>
                                    {likedPosts[selectedPost._id] ? <FaHeart /> : <FaRegHeart />}
                                </button>
                                <button className="action-btn">
                                    <FaRegComment />
                                </button>
                                <button className="action-btn">
                                    <FaShare />
                                </button>
                                <button className="action-btn bookmark">
                                    <FaRegBookmark />
                                </button>
                            </div>
                            
                            <div className="post-likes">
                                {selectedPost.likes || 0} likes
                            </div>
                            
                            <div className="post-caption">
                                <span className="username">{user.username}</span> {selectedPost.description || "No caption"}
                            </div>
                            
                            <div className="post-date">
                                {new Date(selectedPost.createdAt || Date.now()).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            
                            <div className="add-comment">
                                <input type="text" placeholder="Add a comment..." />
                                <button className="post-btn">Post</button>
                            </div>
                        </div>
                    </div>
                )}
                 */}
                {/* Story Modal */}
                {/* {showStoryModal && (
                    <div className="story-modal">
                        <div className="story-modal-content">
                            <button className="close-story" onClick={closeStoryModal}>
                                <FaTimes />
                            </button>
                            <div className="story-options">
                                <h3>Create</h3>
                                <div className="story-option">
                                    <div className="story-option-icon photo">
                                        <FaCamera />
                                    </div>
                                    <span>Photo</span>
                                </div>
                                <div className="story-option">
                                    <div className="story-option-icon video">
                                        <RiMovie2Fill />
                                    </div>
                                    <span>Video</span>
                                </div>
                                <div className="story-option">
                                    <div className="story-option-icon live">
                                        <CgMediaLive />
                                    </div>
                                    <span>Live</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>
            
            {/* Bottom Navigation */}
            <div className="bottom-navigation">
                <div className="nav-item">
                    <i className="nav-icon home"></i>
                </div>
                <div className="nav-item">
                    <i className="nav-icon search"></i>
                </div>
                <div className="nav-item">
                    <i className="nav-icon add"></i>
                </div>
                <div className="nav-item">
                    <i className="nav-icon reels"></i>
                </div>
                <div className="nav-item active">
                    <img 
                        src={user?.profile || "https://via.placeholder.com/30"} 
                        alt="Profile" 
                        className="nav-profile"
                    />
                </div>
            </div>
        </div>
    );
}

export default Profile;