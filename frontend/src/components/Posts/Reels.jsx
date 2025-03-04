import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './Reels.css';

function Reels() {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (posts.length > 0 && id) {
      const index = posts.findIndex(post => post._id === id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [id, posts]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => console.error("Autoplay failed:", error));
    }
  }, [currentIndex]);

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

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="reels-container" onWheel={handleScroll}>
      {posts.length > 0 && (
        <div className="reel">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="reel-video"
          >
            <source src={posts[currentIndex].video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="reel-details">
            <img src={posts[currentIndex].owner.profile || "default-profile.png"} alt={posts[currentIndex].owner.username} className="reel-avatar" />
            <p className="reel-username">{posts[currentIndex].owner.username}</p>
            <p className="reel-description">{posts[currentIndex].description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reels;