// import { useEffect, useState, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import './Followers.css';
// import { Link } from "react-router-dom";

// const Followers = () => {
//       const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//       const { id } = useParams();
//       const [followers, setFollowers] = useState([]);
//       const [loading, setLoading] = useState(true);
//       const [error, setError] = useState(null);
//       const token= localStorage.getItem("token");

//       const fetchFollowers = useCallback(async () => {
//             try {
//                   const response = await fetch(`${Backend_Url}/user/followers/${id}`, {
//                         method: "GET",
//                         credentials: "include",
//                         headers: {
//                               Authorization: `Bearer ${token}`,
//                               "Content-Type": "application/json",
//                         },
//                   });

//                   if (!response.ok) {
//                         throw new Error("Failed to fetch followers");
//                   }

//                   const data = await response.json();
//                   setFollowers(data.followers);
//             } catch (err) {
//                   setError(err.message);
//             } finally {
//                   setLoading(false);
//             }
//       }, [id]); // add 'id' as a dependency to ensure it updates if the id changes

//       useEffect(() => {
//             fetchFollowers();
//       }, [fetchFollowers]); // this ensures the useEffect runs when fetchFollowers changes

//       const handleRetry = () => {
//             setLoading(true);
//             setError(null);
//             fetchFollowers();
//       };

//       if (loading) return <p>Loading...</p>;
//       if (error) return (
//             <div>
//                   <p>Error: {error}</p>
//                   <button onClick={handleRetry}>Retry</button>
//             </div>
//       );
//       if (followers.length === 0) return <p>No followers yet.</p>;

//       return (
//             <div className="followers-container">
//                   <h2 className="followers-name">Followers</h2>
//                   <ul className="followers-list">
//                         {followers.map((follower, index) => (
//                               <li key={follower._id + index} className="follower-item">
//                                       <Link to={`/user/${follower._id}`}  style={{ textDecoration: 'none' }}>
//                                     <img src={follower.profile || "default-profile.png"} alt={follower.username} className="follower-avatar" />
//                                     <span className="followers-name">{follower.username}</span>
//                                     </Link>
//                               </li>
//                         ))}
//                   </ul>
//             </div>
//       );
// };

// export default Followers;
// import { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import { ArrowLeft, Users, UserCheck } from "lucide-react";

// const Followers = () => {
//   const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [followers, setFollowers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const token = localStorage.getItem("token");

//   const fetchFollowers = useCallback(async () => {
//     try {
//       const response = await fetch(`${Backend_Url}/user/followers/${id}`, {
//         method: "GET",
//         credentials: "include",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch followers");
//       }

//       const data = await response.json();
//       setFollowers(data.followers);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [id, Backend_Url, token]);

//   useEffect(() => {
//     fetchFollowers();
//   }, [fetchFollowers]);

//   const handleRetry = () => {
//     setLoading(true);
//     setError(null);
//     fetchFollowers();
//   };

//   const handleBack = () => {
//     navigate(-1);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-black flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-violet-300 text-lg font-medium">Loading followers...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-black flex items-center justify-center">
//         <div className="bg-black/60 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-8 text-center max-w-md mx-4">
//           <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Users className="w-8 h-8 text-violet-400" />
//           </div>
//           <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
//           <p className="text-violet-300 mb-6">{error}</p>
//           <button
//             onClick={handleRetry}
//             className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-black">
//       {/* Header */}
//       <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-violet-500/30">
//         <div className="max-w-4xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={handleBack}
//                 className="p-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 hover:text-violet-300 transition-all duration-300 group"
//               >
//                 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
//               </button>
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
//                   <Users className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
//                     Followers
//                   </h1>
//                   <p className="text-violet-300 text-sm">
//                     {followers.length} {followers.length === 1 ? 'follower' : 'followers'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="max-w-4xl mx-auto px-4 py-6">
//         {followers.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="w-24 h-24 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
//               <UserCheck className="w-12 h-12 text-violet-400" />
//             </div>
//             <h3 className="text-2xl font-bold text-white mb-2">No followers yet</h3>
//             <p className="text-violet-300">Start connecting with people to see your followers here!</p>
//           </div>
//         ) : (
//           <div className="grid gap-4">
//             {followers.map((follower, index) => (
//               <Link
//                 key={follower._id + index}
//                 to={`/user/${follower._id}`}
//                 className="group block"
//               >
//                 <div className="bg-black/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-4 hover:border-violet-500/40 hover:bg-black/60 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/20">
//                   <div className="flex items-center space-x-4">
//                     <div className="relative">
//                       <img
//                         src={follower.profile || "https://via.placeholder.com/60x60/8B5CF6/FFFFFF?text=" + (follower.username?.[0]?.toUpperCase() || "U")}
//                         alt={follower.username}
//                         className="w-14 h-14 rounded-xl object-cover border-2 border-violet-500/30 group-hover:border-violet-400/60 transition-all duration-300"
//                         onError={(e) => {
//                           e.target.src = "https://via.placeholder.com/60x60/8B5CF6/FFFFFF?text=" + (follower.username?.[0]?.toUpperCase() || "U");
//                         }}
//                       />
//                       <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full border-2 border-black flex items-center justify-center">
//                         <UserCheck className="w-2.5 h-2.5 text-white" />
//                       </div>
//                     </div>
                    
//                     <div className="flex-1">
//                       <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors duration-300">
//                         {follower.username}
//                       </h3>
//                       <p className="text-violet-400 text-sm">
//                         Following you
//                       </p>
//                     </div>

//                     <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                       <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
//                         <ArrowLeft className="w-4 h-4 text-violet-400 rotate-180" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Decorative elements */}
//       <div className="fixed top-20 left-10 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
//       <div className="fixed bottom-20 right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
//       <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
//     </div>
//   );
// };

// export default Followers;

// Followers.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, UserCheck } from "lucide-react";
import './Followers.css';

const Followers = () => {
  const Backend_Url = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchFollowers = useCallback(async () => {
    try {
      const response = await fetch(`${Backend_Url}/user/followers/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch followers");
      }

      const data = await response.json();
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
                    {followers.length} {followers.length === 1 ? 'follower' : 'followers'}
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
            <h3 className="empty-title">No followers yet</h3>
            <p className="empty-message">Start connecting with people to see your followers here!</p>
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

export default Followers;