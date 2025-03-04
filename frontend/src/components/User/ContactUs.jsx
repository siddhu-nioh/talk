import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Import the back arrow icon
import './ContactUs.css';

function ContactUs() {
    const navigate = useNavigate();

    return (
        <div className="contact-us-container">
            {/* Back Button */}
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </button>

            <h1>Contact Us</h1>
            <p>Have questions? We’re here to help!</p>
            <div className="contact-info">
                <p>Email: sivapalurisiva@gmail.com</p>
                <p>Phone: +1 234 567 890</p>
                <p>Website: thetalk.org.in</p>
                For any queries or support:


            </div>
            <p>I have read and agree to the Terms, Privacy Policy, and Guidelines.
</p> 
        </div>
    );
}

export default ContactUs;