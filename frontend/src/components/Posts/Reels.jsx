import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import './Reels.css';

function Reels() {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRefs = useRef([]);
  const { id } = useParams();

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
        threshold: 0.8, // Trigger when 80% of the video is visible
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
            autoPlay={index === 0} // Autoplay the first video
            muted={index !== 0} // Mute all videos except the first one
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