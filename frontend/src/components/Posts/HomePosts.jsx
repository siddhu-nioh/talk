// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import './HomePosts.css'; // Import the CSS file
// // import TalkPosts from "./Posts";

// // function HomePosts() {
// //     const [isSettingsOpen, setIsSettingsOpen] = useState(false);
// //     const navigate = useNavigate();

// //     const toggleSettings = () => {
// //         setIsSettingsOpen(!isSettingsOpen);
// //     };

// //     const handleLogin = () => {
// //         navigate("/login");
// //     };

// //     return (
// //         <div>
// //             {/* Header */}
// //             <header className="header">
// //                 <div className="header-content">
// //                     <h1>Talk</h1>
// //                     <nav className="navbar">
// //                         <ul>
// //                             <li onClick={() => navigate("/talk/about-us")}>About Us</li>
// //                             <li onClick={() => navigate("/talk/contact-us")}>Contact Us</li>
// //                             <li onClick={() => navigate("/talk/privacy-policy")}>Privacy Policy</li>
// //                             <li onClick={() => navigate("/talk/terms-and-conditions")}>Terms & Conditions</li>
// //                         </ul>
// //                     </nav>
// //                     <button className="login-button" onClick={handleLogin}>
// //                         Login
// //                     </button>
// //                 </div>
// //             </header>

// //             {/* Main Content */}
// //             <div className="main-content">
// //                 <TalkPosts />
// //             </div>
// //         </div>
// //     );
// // }

// // export default HomePosts;import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import './HomePosts.css';
// import TalkPosts from "./Posts";
// import { 
//   FaHome, 
//   FaInfoCircle, 
//   FaEnvelope, 
//   FaShieldAlt, 
//   FaFileContract, 
//   FaSignInAlt, 
//   FaBars, 
//   FaTimes, 
//   FaMoon, 
//   FaSun, 
//   FaSearch, 
//   FaBell,
//   FaUserCircle
// } from "react-icons/fa";

// function HomePosts() {
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [searchActive, setSearchActive] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const navigate = useNavigate();
  
//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 20) {
//         setIsScrolled(true);
//       } else {
//         setIsScrolled(false);
//       }
//     };
    
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const toggleSettings = () => {
//     setIsSettingsOpen(!isSettingsOpen);
//   };

//   const toggleDarkMode = () => {
//     setIsDarkMode(!isDarkMode);
//     document.body.classList.toggle('light-mode');
//   };

//   const toggleSearch = () => {
//     setSearchActive(!searchActive);
//   };

//   const handleLogin = () => {
//     navigate("/login");
//   };

//   return (
//     <div className={`app-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
//       {/* Header */}
//       <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
//         <div className="mobile-header">
//           <div className="logo-container">
//             <h1 className="logo-text pulse-animation">Talk</h1>
//           </div>
          
//           <div className="header-actions">
//             <button className="action-button search-toggle glow-on-hover" onClick={toggleSearch}>
//               <FaSearch className="header-icon" />
//             </button>
            
//             <button className="action-button notification glow-on-hover">
//               <FaBell className="header-icon" />
//               <span className="notification-badge pulse">3</span>
//             </button>
            
//             <button className="action-button theme-toggle glow-on-hover" onClick={toggleDarkMode}>
//               {isDarkMode ? <FaSun className="header-icon" /> : <FaMoon className="header-icon" />}
//             </button>
            
//             <button className="menu-toggle glow-on-hover" onClick={toggleSettings}>
//               {isSettingsOpen ? <FaTimes className="header-icon" /> : <FaBars className="header-icon" />}
//             </button>
//           </div>
//         </div>
        
//         {/* Enhanced Search Bar */}
//         <div className={`search-container ${searchActive ? 'active' : ''}`}>
//           <input 
//             type="text" 
//             placeholder="Search for posts, people, or topics..." 
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="search-input"
//           />
//           <button className="search-close glow-on-hover" onClick={toggleSearch}>
//             <FaTimes className="search-icon" />
//           </button>
//         </div>
//       </header>

//       {/* Enhanced Side Menu with Dark Theme */}
//       <div className={`side-menu ultra-dark ${isSettingsOpen ? 'open' : ''}`}>
//         <div className="side-menu-header">
//           <h2>Menu</h2>
//           <button className="close-menu glow-on-hover" onClick={toggleSettings}>
//             <FaTimes className="side-icon" />
//           </button>
//         </div>
        
//         <div className="user-preview">
//           <div className="avatar-placeholder glow-effect">
//             <FaUserCircle className="avatar-icon" />
//             <span>Guest</span>
//           </div>
//           <button className="login-button-side neo-brutalism" onClick={handleLogin}>
//             <FaSignInAlt className="button-icon" /> Sign In
//           </button>
//         </div>
        
//         <nav className="side-nav">
//           <ul>
//             <li className="nav-item" onClick={() => navigate("/talk")}>
//               <FaHome className="nav-icon" />
//               <span>Home</span>
//               <div className="hover-glow"></div>
//             </li>
//             <li className="nav-item" onClick={() => navigate("/talk/about-us")}>
//               <FaInfoCircle className="nav-icon" />
//               <span>About Us</span>
//               <div className="hover-glow"></div>
//             </li>
//             <li className="nav-item" onClick={() => navigate("/talk/contact-us")}>
//               <FaEnvelope className="nav-icon" />
//               <span>Contact Us</span>
//               <div className="hover-glow"></div>
//             </li>
//             <li className="nav-item" onClick={() => navigate("/talk/privacy-policy")}>
//               <FaShieldAlt className="nav-icon" />
//               <span>Privacy Policy</span>
//               <div className="hover-glow"></div>
//             </li>
//             <li className="nav-item" onClick={() => navigate("/talk/terms-and-conditions")}>
//               <FaFileContract className="nav-icon" />
//               <span>Terms & Conditions</span>
//               <div className="hover-glow"></div>
//             </li>
//           </ul>
//         </nav>
        
//         <div className="menu-footer">
//           <p>© 2025 Talk Social Platform</p>
//           <div className="theme-switch-container">
//             <span>Theme:</span>
//             <button className="theme-switch glow-on-hover" onClick={toggleDarkMode}>
//               {isDarkMode ? <FaSun className="theme-icon" /> : <FaMoon className="theme-icon" />}
//               <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Improved Backdrop with Blur Effect */}
//       {isSettingsOpen && (
//         <div className="backdrop blur-effect" onClick={toggleSettings}></div>
//       )}

//       {/* Main Content */}
//       <div className="main-content">
//         <div className="content-container">
//           <TalkPosts />
//         </div>
//       </div>
      
//       {/* Enhanced Floating Action Button */}
//       <button className="floating-action-button super-glow">
//         <span className="plus-icon">+</span>
//         <div className="ripple"></div>
//         <div className="outer-glow"></div>
//       </button>
//     </div>
//   );
// }

// export default HomePosts;
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