import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Import the back arrow icon
import './AboutUs.css';

function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="about-us-container">
            {/* Back Button */}
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </button>

            <h1>About talk.org.in</h1>
            <p>Welcome to Talk.Rog.In, a vibrant social platform launched on October 2023. Our mission is to connect people in a dynamic and engaging environment.</p>
            <p>Join our community to share your thoughts, follow interesting topics, and connect with like-minded individuals.</p>
        </div>
    );
}

export default AboutUs;