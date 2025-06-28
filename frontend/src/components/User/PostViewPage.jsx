import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import "./PostViewPage.css"; 

const PostsViewPage = () => {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams(); // user id
  const navigate = useNavigate();
  const location = useLocation();
  
  const [posts, setPosts] = useState([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRefs = useRef([]);

  // Get initial post index from URL params or state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const postIndex = searchParams.get('index');
    if (postIndex) {
      setCurrentPostIndex(parseInt(postIndex));
    }
  }, [location]);

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

  // Fetch profile and posts data
  const fetchData = async () => {
    try {
      const [profileResponse] = await Promise.all([
        axios.get(`${Backend_Url}/user/${id}`, { withCredentials: true }),
        fetchCurrentUserData()
      ]);
      
      setProfileData(profileResponse.data);
      setPosts(profileResponse.data.posts || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate(-1);
      return;
    }
    fetchData();
  }, [id]);

  // Handle video autoplay
  useEffect(() => {
    const currentVideo = videoRefs.current[currentPostIndex];
    if (currentVideo) {
      currentVideo.play().catch(console.error);
    }

    // Pause other videos
    videoRefs.current.forEach((video, index) => {
      if (index !== currentPostIndex && video) {
        video.pause();
      }
    });
  }, [currentPostIndex]);

  // Handle like/unlike post
  const handleLikePost = async (postId, postIndex) => {
    if (!currentUserData) return;

    const post = posts[postIndex];
    const isLiked = post.likes?.includes(currentUserData._id);
    
    // Optimistic update
    setPosts(prevPosts => {
      const newPosts = [...prevPosts];
      if (isLiked) {
        newPosts[postIndex].likes = post.likes.filter(id => id !== currentUserData._id);
      } else {
        newPosts[postIndex].likes = [...(post.likes || []), currentUserData._id];
      }
      return newPosts;
    });

    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      await axios.post(`${Backend_Url}/post/${endpoint}/${postId}`, {}, {
        withCredentials: true
      });
    } catch (error) {
      // Revert on error
      setPosts(prevPosts => {
        const newPosts = [...prevPosts];
        newPosts[postIndex] = post;
        return newPosts;
      });
      console.error(`Failed to ${isLiked ? 'unlike' : 'like'} post:`, error);
    }
  };

  // Handle double tap to like
  const handleDoubleClick = (postId, postIndex) => {
    const post = posts[postIndex];
    const isLiked = post.likes?.includes(currentUserData._id);
    
    if (!isLiked) {
      handleLikePost(postId, postIndex);
    }
  };

  // Handle scroll to next/previous post
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const windowHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / windowHeight);
    
    if (newIndex !== currentPostIndex && newIndex >= 0 && newIndex < posts.length) {
      setCurrentPostIndex(newIndex);
    }
  };

  if (isLoading) {
    return (
      <div className="posts-view-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="posts-view-error">
        <button onClick={() => navigate(-1)} className="back-button">
          <FiArrowLeft />
        </button>
        <p>No posts found</p>
      </div>
    );
  }

  return (
    <div className="posts-view-container">
      {/* Sticky Header */}
      <div className="posts-view-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FiArrowLeft />
        </button>
        <div className="header-user-info">
          <img
            src={profileData?.profile || "/api/placeholder/32/32"}
            alt={profileData?.username}
            className="header-avatar"
          />
          <span className="header-username">{profileData?.username}</span>
        </div>
        <div className="header-post-indicator">
          {currentPostIndex + 1} / {posts.length}
        </div>
      </div>

      {/* Posts Container */}
      <div className="posts-scroll-container" onScroll={handleScroll}>
        {posts.map((post, index) => {
          const isLiked = post.likes?.includes(currentUserData?._id);
          
          return (
            <div key={post._id} className="post-view-item">
              <div className="post-media-wrapper">
                {post.image ? (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="post-media-full"
                    onDoubleClick={() => handleDoubleClick(post._id, index)}
                  />
                ) : post.video ? (
                  <video
                    ref={el => videoRefs.current[index] = el}
                    className="post-media-full"
                    
                    loop
                    playsInline
                    onDoubleClick={() => handleDoubleClick(post._id, index)}
                  >
                    <source src={post.video} type="video/mp4" />
                  </video>
                ) : (
                  <div className="post-no-media-full">
                    No media available
                  </div>
                )}
                
                {/* Post Actions */}
                <div className="post-actions-overlay">
                  <button
                    className={`like-button ${isLiked ? 'liked' : ''}`}
                    onClick={() => handleLikePost(post._id, index)}
                  >
                    <FiHeart className={isLiked ? 'filled' : ''} />
                  </button>
                  <span className="like-count">
                    {post.likes?.length || 0}
                  </span>
                </div>
              </div>

              {/* Post Caption */}
              {post.caption && (
                <div className="post-caption">
                  <span className="caption-username">{profileData?.username}</span>
                  <span className="caption-text">{post.description}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostsViewPage;