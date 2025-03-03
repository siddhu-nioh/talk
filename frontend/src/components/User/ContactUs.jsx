import React from 'react';
import './ContactUs.css'; // Ensure you create this CSS file for styling

function ContactUs() {
    return (
        <div className="contact-us-container">
            <h1>Contact Us</h1>
            <p>Have questions? We’re here to help!</p>
            <div className="contact-info">
                <p>Email: support@talk.rog.in</p>
                <p>Phone: +1 234 567 890</p>
            </div>
        </div>
    );
}

export default ContactUs;