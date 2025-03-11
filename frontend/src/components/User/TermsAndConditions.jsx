// import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Import the back arrow icon
import './TermsAndConditions.css'; // Import the CSS file

function TermsAndConditions() {
    const navigate = useNavigate();

    return (
        <div className="terms-and-conditions-container">
            {/* Back Button */}
            <button className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </button>

            <h1>Terms and Conditions</h1>
            <p>Welcome to our platform! By using our services, you agree to the following terms and conditions:</p>

            <h3>1. User Responsibilities</h3>
            <ul>
                <li>You are responsible for the content you post on the platform.</li>
                <li>You must not post any content that is illegal, harmful, defamatory, or violates the rights of others.</li>
                <li>You must not engage in any activity that disrupts or interferes with the platform's functionality.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            </ul>

            <h3>2. Content Guidelines</h3>
            <ul>
                <li>All content must adhere to our community guidelines.</li>
                <li>Content must not contain hate speech, harassment, or explicit material.</li>
                <li>You grant us a non-exclusive, royalty-free license to use, reproduce, and display your content on the platform.</li>
                <li>We reserve the right to remove any content that violates our guidelines.</li>
            </ul>

            <h3>3. Advertising and Monetization</h3>
            <ul>
                <li>Ads will be displayed on the platform as part of our monetization strategy.</li>
                <li>You may not block or interfere with the display of ads.</li>
                <li>We are not responsible for the content of third-party ads.</li>
                <li>By using the platform, you consent to the display of ads.</li>
            </ul>

            <h3>4. Privacy Policy</h3>
            <ul>
                <li>We collect and use your personal data in accordance with our Privacy Policy.</li>
                <li>Your data may be shared with third parties for advertising and analytics purposes.</li>
                <li>You have the right to access, update, or delete your personal data.</li>
            </ul>

            <h3>5. Intellectual Property</h3>
            <ul>
                <li>All intellectual property on the platform, including logos and trademarks, is owned by us.</li>
                <li>You may not use our intellectual property without prior written consent.</li>
                <li>You retain ownership of the content you post, but you grant us a license to use it.</li>
            </ul>

            <h3>6. Termination of Account</h3>
            <ul>
                <li>We reserve the right to suspend or terminate your account if you violate these terms.</li>
                <li>You may terminate your account at any time by contacting us.</li>
                <li>Upon termination, your content may be removed from the platform.</li>
            </ul>

            <h3>7. Limitation of Liability</h3>
            <ul>
                <li>We are not liable for any damages arising from your use of the platform.</li>
                <li>We do not guarantee the accuracy or reliability of any content on the platform.</li>
                <li>We are not responsible for any third-party links or services.</li>
            </ul>

            <h3>8. Changes to Terms</h3>
            <ul>
                <li>We may update these terms and conditions at any time.</li>
                <li>You will be notified of any significant changes.</li>
                <li>Continued use of the platform constitutes acceptance of the updated terms.</li>
            </ul>

            <h3>9. Governing Law</h3>
            <ul>
                <li>These terms are governed by the laws of [Your Country/State].</li>
                <li>Any disputes will be resolved in the courts of [Your Country/State].</li>
            </ul>

            <p>By accepting these terms, you agree to comply with all the above conditions. If you do not agree, please do not use our platform.</p>
        </div>
    );
}

export default TermsAndConditions;