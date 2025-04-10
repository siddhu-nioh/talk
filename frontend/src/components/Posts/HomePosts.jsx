// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import './HomePosts.css'; // Import the CSS file
// import TalkPosts from "./Posts";

// function HomePosts() {
//     const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//     const navigate = useNavigate();

//     const toggleSettings = () => {
//         setIsSettingsOpen(!isSettingsOpen);
//     };

//     const handleLogin = () => {
//         navigate("/login");
//     };

//     return (
//         <div>
//             {/* Header */}
//             <header className="header">
//                 <div className="header-content">
//                     <h1>Talk</h1>
//                     <nav className="navbar">
//                         <ul>
//                             <li onClick={() => navigate("/talk/about-us")}>About Us</li>
//                             <li onClick={() => navigate("/talk/contact-us")}>Contact Us</li>
//                             <li onClick={() => navigate("/talk/privacy-policy")}>Privacy Policy</li>
//                             <li onClick={() => navigate("/talk/terms-and-conditions")}>Terms & Conditions</li>
//                         </ul>
//                     </nav>
//                     <button className="login-button" onClick={handleLogin}>
//                         Login
//                     </button>
//                 </div>
//             </header>

//             {/* Main Content */}
//             <div className="main-content">
//                 <TalkPosts />
//             </div>
//         </div>
//     );
// }

// export default HomePosts;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './HomePosts.css';
import TalkPosts from "./Posts";
import { 
  FaHome, 
  FaInfoCircle, 
  FaEnvelope, 
  FaShieldAlt, 
  FaFileContract, 
  FaSignInAlt, 
  FaBars, 
  FaTimes, 
  FaMoon, 
  FaSun, 
  FaSearch, 
  FaBell
} from "react-icons/fa";

function HomePosts() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // You would add actual theme switching logic here
    document.body.classList.toggle('light-mode');
  };

  const toggleSearch = () => {
    setSearchActive(!searchActive);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Mobile Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="mobile-header">
          <div className="logo-container">
            <h1 className="logo-text pulse-animation">Talk</h1>
          </div>
          
          <div className="header-actions">
            <button className="action-button search-toggle" onClick={toggleSearch}>
              <FaSearch className="icon-animation" />
            </button>
            
            <button className="action-button notification">
              <FaBell className="icon-animation" />
              <span className="notification-badge">3</span>
            </button>
            
            <button className="action-button theme-toggle" onClick={toggleDarkMode}>
              {isDarkMode ? <FaSun className="icon-animation" /> : <FaMoon className="icon-animation" />}
            </button>
            
            <button className="menu-toggle" onClick={toggleSettings}>
              {isSettingsOpen ? <FaTimes className="icon-animation" /> : <FaBars className="icon-animation" />}
            </button>
          </div>
        </div>
        
        {/* Search Bar - Expandable */}
        <div className={`search-container ${searchActive ? 'active' : ''}`}>
          <input 
            type="text" 
            placeholder="Search for posts, people, or topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-close" onClick={toggleSearch}>
            <FaTimes />
          </button>
        </div>
      </header>

      {/* Side Navigation Menu */}
      <div className={`side-menu ${isSettingsOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <h2>Menu</h2>
          <button className="close-menu" onClick={toggleSettings}>
            <FaTimes />
          </button>
        </div>
        
        <div className="user-preview">
          <div className="avatar-placeholder">
            <span>Guest</span>
          </div>
          <button className="login-button-side" onClick={handleLogin}>
            <FaSignInAlt /> Sign In
          </button>
        </div>
        
        <nav className="side-nav">
          <ul>
            <li onClick={() => navigate("/talk")}>
              <FaHome className="nav-icon" />
              <span>Home</span>
            </li>
            <li onClick={() => navigate("/talk/about-us")}>
              <FaInfoCircle className="nav-icon" />
              <span>About Us</span>
            </li>
            <li onClick={() => navigate("/talk/contact-us")}>
              <FaEnvelope className="nav-icon" />
              <span>Contact Us</span>
            </li>
            <li onClick={() => navigate("/talk/privacy-policy")}>
              <FaShieldAlt className="nav-icon" />
              <span>Privacy Policy</span>
            </li>
            <li onClick={() => navigate("/talk/terms-and-conditions")}>
              <FaFileContract className="nav-icon" />
              <span>Terms & Conditions</span>
            </li>
          </ul>
        </nav>
        
        <div className="menu-footer">
          <p>© 2025 Talk Social Platform</p>
          <div className="theme-switch-container">
            <span>Theme:</span>
            <button className="theme-switch" onClick={toggleDarkMode}>
              {isDarkMode ? <FaSun /> : <FaMoon />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isSettingsOpen && (
        <div className="backdrop" onClick={toggleSettings}></div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="content-container">
          <TalkPosts />
        </div>
      </div>
      
      {/* Quick Action Floating Button */}
      <button className="floating-action-button">
        <span className="plus-icon">+</span>
        <div className="ripple"></div>
      </button>
    </div>
  );
}

export default HomePosts;