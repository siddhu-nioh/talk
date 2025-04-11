
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './HomePosts.css'; // Import the CSS file
import TalkPosts from "./Posts";

function HomePosts() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <div>
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <h1>Talk</h1>
                    <nav className="navbar">
                        <ul>
                            <li onClick={() => navigate("/talk/about-us")}>About Us</li>
                            <li onClick={() => navigate("/talk/contact-us")}>Contact Us</li>
                            <li onClick={() => navigate("/talk/privacy-policy")}>Privacy Policy</li>
                            <li onClick={() => navigate("/talk/terms-and-conditions")}>Terms & Conditions</li>
                        </ul>
                    </nav>
                    <button className="login-button" onClick={handleLogin}>
                        Login
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="main-content">
                <TalkPosts />
            </div>
        </div>
    );
}

export default HomePosts;