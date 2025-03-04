import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './Reels.css';

function Reels() {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch posts with videos
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${Backend_Url}/talk`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data.filter(post => post.video)); // Filter only posts with videos
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [Backend_Url]);

  // Update current index based on URL parameter
  useEffect(() => {
    if (posts.length > 0 && id) {
      const index = posts.findIndex(post => post._id === id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [id, posts]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = (event) => {
      if (event.deltaY > 0) {
        // Scroll down
        if (currentIndex < posts.length - 1) {
          navigate(`/reels/${posts[currentIndex + 1]._id}`);
          setCurrentIndex(currentIndex + 1);
        }
      } else {
        // Scroll up
        if (currentIndex > 0) {
          navigate(`/reels/${posts[currentIndex - 1]._id}`);
          setCurrentIndex(currentIndex - 1);
        }
      }
    };

    window.addEventListener('wheel', handleScroll);
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [currentIndex, posts, navigate]);

  // Intersection Observer to handle video play/pause
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            // Play the video if it's in the viewport
            video.play().catch((error) => console.error("Autoplay failed:", error));
          } else {
            // Pause the video if it's out of the viewport
            video.pause();
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the video is visible
      }
    );

    // Observe all video elements
    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    // Cleanup the observer
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [posts]);

  const togglePlayPause = (event) => {
    const video = event.currentTarget;
    if (video.paused) {
      video.muted = false;
      video.play().catch((error) => console.error("Play failed:", error));
    } else {
      video.pause();
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="reels-container">
      {posts.map((post, index) => (
        <div key={post._id} className="reel">
          <video
            ref={(el) => (videoRefs.current[index] = el)} // Attach ref to the video element
            autoPlay={index === currentIndex}
            muted={index !== currentIndex}
            playsInline
            className="reel-video"
            onClick={togglePlayPause}
          >
            <source src={post.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="reel-details">
            <img
              src={post.owner.profile || "default-profile.png"}
              alt={post.owner.username}
              className="reel-avatar"
            />
            <p className="reel-username">{post.owner.username}</p>
            <p className="reel-description">{post.description}</p>
          </div>
          <div className="reel-actions">
            <button className="reel-action-button">
              <i className="fas fa-heart"></i> {/* Like icon */}
              <span>{post.likes || 0}</span>
            </button>
            <button className="reel-action-button">
              <i className="fas fa-comment"></i> {/* Comment icon */}
              <span>{post.comments || 0}</span>
            </button>
            <button className="reel-action-button">
              <i className="fas fa-share"></i> {/* Share icon */}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Reels;