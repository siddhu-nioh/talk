
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, UserCheck } from "lucide-react";
import './Followers.css';

const FOllowing = () => {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchFollowers = useCallback(async () => {
    try {
      const response = await fetch(`${Backend_Url}/user/following/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Fetching following from:", `${Backend_Url}/user/following/${id}`);
console.log("Response status:", response.status);
console.log("Response Data:",response)
      if (!response.ok) {
        throw new Error("Failed to fetch following");
      }

      const data = await response.json();
      console.log("Fetched following data:", data);
      setFollowers(data.followers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, Backend_Url, token]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchFollowers();
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading followers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">
            <Users size={32} />
          </div>
          <h3 className="error-title">Something went wrong</h3>
          <p className="error-message">{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="followers-page">
      {/* Header */}
      <div className="followers-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-left">
              <button onClick={handleBack} className="back-button">
                <ArrowLeft size={20} />
              </button>
              <div className="header-info">
                <div className="header-icon">
                  <Users size={20} />
                </div>
                <div className="header-text">
                  <h1 className="page-title">Followers</h1>
                  <p className="followers-count">
                    {followers.length} {followers.length === 1 ? 'following' : 'Following'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="followers-content">
        {followers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <UserCheck size={48} />
            </div>
            <h3 className="empty-title">No following yet</h3>
            <p className="empty-message">Start connecting with people to see who are you following  here!</p>
          </div>
        ) : (
          <div className="followers-grid">
            {followers.map((follower, index) => (
              <Link
                key={follower._id + index}
                to={`/user/${follower._id}`}
                className="follower-link"
              >
                <div className="follower-card">
                  <div className="follower-content">
                    <div className="follower-avatar-container">
                      <img
                        src={follower.profile || `https://ui-avatars.com/api/?name=${follower.username}&background=8B5CF6&color=fff&size=60`}
                        alt={follower.username}
                        className="follower-avatar"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${follower.username}&background=8B5CF6&color=fff&size=60`;
                        }}
                      />
                      <div className="follower-badge">
                        <UserCheck size={10} />
                      </div>
                    </div>
                    
                    <div className="follower-info">
                      <h3 className="follower-name">{follower.username}</h3>
                      <p className="follower-status">Following you</p>
                    </div>

                    <div className="follower-arrow">
                      <div className="arrow-container">
                        <ArrowLeft size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
      <div className="decoration decoration-3"></div>
    </div>
  );
};

export default FOllowing;