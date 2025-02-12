import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./User.css";
import { FaEdit, FaUsers, FaShare, FaEnvelope, FaUserMinus, FaUserPlus } from "react-icons/fa";

function UserProfile() {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch logged-in user details
        const authResponse = await fetch(`${Backend_Url}/user/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!authResponse.ok) {
          throw new Error("Failed to fetch logged-in user");
        }

        const authData = await authResponse.json();
        setCurrentUserId(authData._id);

        // Fetch profile user details along with posts
        const response = await fetch(`${Backend_Url}/user/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        const isFollowing = data.followers.includes(authData._id);
        setUser({ ...data, isFollowing });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleFollow = async () => {
    if (user.isFollowing) return;

    try {
      setUser(prev => ({
        ...prev,
        followers: [...prev.followers, currentUserId],
        isFollowing: true,
      }));

      const response = await fetch(`${Backend_Url}/user/follow/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to follow user");
      }
    } catch (error) {
      console.error(error);
      setUser(prev => ({
        ...prev,
        followers: prev.followers.filter(f => f !== currentUserId),
        isFollowing: false,
      }));
    }
  };

  const handleUnfollow = async () => {
    try {
      setUser(prev => ({
        ...prev,
        followers: prev.followers.filter(f => f !== currentUserId),
        isFollowing: false,
      }));

      const response = await fetch(`${Backend_Url}/user/unfollow/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to unfollow user");
      }
    } catch (error) {
      console.error(error);
      setUser(prev => ({
        ...prev,
        followers: [...prev.followers, currentUserId],
        isFollowing: true,
      }));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="profile-container">
      <img src={user.profile || "default-profile.png"} alt="Profile" />
      <h2>{user.username || "Unknown User"}</h2>

      <div className="stats">
        <div>{(user.posts && user.posts.length) || 0} Posts</div>
        <div>{(user.followers && user.followers.length) || 0} Followers</div>
        <div>{(user.following && user.following.length) || 0} Following</div>
      </div>

      <div className="action-buttons">
        <div className="btn-actions"><FaEdit /></div>
        <div className="btn-actions"><FaShare /></div>
        <div className="btn-actions"><FaEnvelope /></div>
        <button className="btn-actionsa" onClick={() => window.location.href = `/user/followers/${user._id}`}>
          <FaUsers />
        </button>
        {user.isFollowing ? (
          <button className="btn-actionsa" onClick={handleUnfollow}>
            <FaUserMinus />
          </button>
        ) : (
          <button className="btn-actionsa" onClick={handleFollow}>
            <FaUserPlus />
          </button>
        )}
      </div>

      {/* Display User Posts */}
      <div className="user-posts">
        <h3>User Posts</h3>
        {user.posts && user.posts.length > 0 ? (
          <div className="posts-container">
            {user.posts.map((post, index) => (
              <div key={index} className="post-card">
                {post.image ? (
                  <img src={post.image} alt="Post" className="media-content" />
                ) : post.video ? (
                  <video className="media-content" autoPlay loop muted>
                    <source src={post.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : null}
                {post.caption && <p className="description">{post.description}</p>}
                {/* <span className="likes">Likes: {post.likes || 0}</span> */}
              </div>
            ))}
          </div>
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
