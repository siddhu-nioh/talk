import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Import the back arrow icon
import './PrivacyPolicy.css';

function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="privacy-policy-container">
            {/* Back Button */}
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </button>

            <h1>Privacy Policy</h1>
            <p>Your privacy is important to us. It is Talk.Rog.In's policy to respect your privacy regarding any information we may collect from you across our website.</p>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
        </div>
    );
}

export default PrivacyPolicy;