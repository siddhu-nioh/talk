import { useEffect, useState, useRef } from "react";
import './Posts.css';
import AdComponent from './AdComponent'; // Import the AdComponent

function TalkPosts() {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref to store video elements
  const videoRefs = useRef([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${Backend_Url}/talk`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

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
    <div className="p-4 flex justify-center items-center posts">
      <div className="text-center">
        <AdComponent />
        {posts.map((post, index) => (
          <div key={post._id}>
            <div className="post-container m-4 p-4 border-none bg-gray-800 rounded-lg shadow-lg">
              <div className="post-header flex items-center mb-2">
                <img src={post.owner.profile || "default-profile.png"} alt={post.owner.username} className="post-avatar" />
                <p className="text-white ownername font-bold ml-2">{post.owner.username}</p>
              </div>

              {post.image ? (
                <img src={post.image} alt="Post" className="media-content" />
              ) : post.video ? (
                <video
                  ref={(el) => (videoRefs.current[index] = el)} // Attach ref to the video element
                  autoPlay
                  muted
                  playsInline
                  className="media-content"
                  onClick={togglePlayPause}
                >
                  <source src={post.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : null}

              {post.description && (
                <p className="text-white leading-6 mt-2 description">{post.description}</p>
              )}
            </div>

            {/* Display AdComponent after every 3 posts */}
            {(index + 1) % 1 === 0 && <AdComponent />}
          </div>
        ))}
        <AdComponent />
      </div>
    </div>
  );
}

export default TalkPosts;
