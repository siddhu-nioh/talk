import { useState, useEffect } from "react";
import "./User.css";
import {
    FaEdit, FaTrash, FaUsers, FaShare, FaEnvelope, FaSignOutAlt, FaCog, FaTimes,
    FaInfoCircle,
    FaShieldAlt
} from "react-icons/fa";

function Profile() {
    const Backend_Url = import.meta.env.VITE_BACKEND_URL;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {

        fetchUserData();

        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token found");

                const response = await fetch(`${Backend_Url}/auth/check`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });   

                if (!response.ok) throw new Error("Failed to fetch user data");

                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const response = await fetch(`${Backend_Url}/auth/check`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch user data");

            const data = await response.json();
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchUserPosts();
    }, [user]);

    const fetchUserPosts = async () => {
        try {
            const response = await fetch(`${Backend_Url}/talk`);
            if (!response.ok) throw new Error("Failed to fetch posts");

            const data = await response.json();
            const userPosts = data.filter(post => post.owner._id === user._id);
            setPosts(userPosts);
        } catch (err) {
            console.error("Error fetching posts:", err);
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
        formData.append("profilePicture", file);

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
            await fetchUserData();
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="profile-page">
            {/* Header with Settings Icon */}
            <header className="header">
                <div className="header-content">
                    <h1>Profile</h1>
                    <div className="settings-icon" onClick={toggleSettings}>
                        {isSettingsOpen ? <FaTimes /> : <FaCog />}
                    </div>
                </div>
            </header>

            {/* Right-Side Sidebar */}
            <div className={`sidebar ${isSettingsOpen ? "open" : ""}`}>
                <div className="sidebar-content">
                    <div className="settings-icon-2" onClick={toggleSettings}>
                        {isSettingsOpen ? <FaTimes /> : <FaCog />}
                    </div>
                    <div className="sidebar-item" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </div>
                    <div className="sidebar-item" onClick={() =>  document.getElementById("fileInput").click()}>
                        <FaEdit /> Edit Profile
                    </div>
                    <div className="sidebar-item">
                        <FaEnvelope /> Notifications
                    </div>
                    <div className="sidebar-item" onClick={() => window.location.href = "/talk/about-us"}>
    <FaInfoCircle /> About Us
</div>
<div className="sidebar-item" onClick={() => window.location.href = "/talk/contact-us"}>
    <FaEnvelope /> Contact Us
</div>
<div className="sidebar-item" onClick={() => window.location.href = "/talk/privacy-policy"}>
    <FaShieldAlt /> Privacy Policy
</div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="profile-container">
                <div className="profile-picture-container">
                    <img src={user.profile || "default-profile.png"} alt="Profile" className="profile-picture" />

                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </div>

                <h2>{user.username || "Unknown User"}</h2>

                <div className="stats">
                    <div>{posts.length} Posts</div>
                    <div>{(user.followers && user.followers.length) || 0} Followers</div>
                    <div>{(user.following && user.following.length) || 0} Following</div>
                </div>

                <div className="action-buttons">
                    <div 
                        className="btn-actions" 
                        onClick={() => !uploading && document.getElementById("fileInput").click()}
                        style={{ opacity: uploading ? 0.5 : 1, cursor: uploading ? "not-allowed" : "pointer" }}
                    >
                        {uploading ? "Uploading..." : <FaEdit />}
                    </div>

                    <div className="btn-actions"><FaTrash /></div>
                    <form action={`/user/followers/${user._id || "#"}`} method="GET">
                        <button className="btn-actions" style={{ border: "none" }} type="submit">
                            <FaUsers />
                        </button>
                    </form>
                    <div className="btn-actions"><FaShare /></div>
                    <div className="btn-actions"><FaEnvelope /></div>
                </div>

                {/* User Posts Section */}
                <div className="posts-container">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post._id} className="post-card">
                                {post.image ? (
                                    <img src={post.image} alt="Post" className="media-content" />
                                ) : post.video ? (
                                    <video controls className="media-content">
                                        <source src={post.video} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : null}
                            </div>
                        ))
                    ) : (
                        <p>No posts available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
