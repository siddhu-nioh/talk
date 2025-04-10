import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Authmodals() {
    const Backend_Url = import.meta.env.VITE_BACKEND_URL;
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [isSignupOpen, setSignupOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const navigate = useNavigate();

    const loginFormRef = useRef(null);
    const signupFormRef = useRef(null);

    const handleClose = (event, modalsType) => {
        if (event.target.classList.contains("modals")) {
            if (modalsType === "login") setLoginOpen(false);
            if (modalsType === "signup") setSignupOpen(false);
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(loginFormRef.current);
        const data = {
            username: formData.get("username"),
            password: formData.get("password"),
        };

        try {
            const response = await fetch(`${Backend_Url}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Login response:", result);

                if (result.success) {
                    localStorage.setItem("token", result.token);
                    localStorage.setItem("user", JSON.stringify(result.user));
                    setLoginOpen(false);
                    alert("Login Successful");
                    navigate("/talk");
                } else {
                    setError("Invalid username or password.");
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Invalid username or password.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Something went wrong. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (event) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(signupFormRef.current);

        try {
            const response = await fetch(`${Backend_Url}/signup`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Signup response:", result);

                if (result.success) {
                    setSignupOpen(false);
                    alert("Signup successful!");
                    navigate("/login");
                } else {
                    setError("Signup failed. Try again.");
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Signup failed. Try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("Something went wrong. Try again later.");
        }
    };

    return (
        <div className="container text-center mt-5">
            <div className="mid">
                <h2 className="Head">Login Form</h2>
                <button
                    onClick={() => setLoginOpen(true)}
                    className="btn btn-primary"
                    style={{ width: "auto" }}
                >
                    Login
                </button>
            </div>

            {isLoginOpen && (
                <div id="id01" className={`modals ${isLoginOpen ? "show" : ""}`} onClick={(e) => handleClose(e, "login")}>
                    <form className="modals-content animate" ref={loginFormRef} onSubmit={handleLogin}>
                        <div className="imgcontainer">
                            <div className="icon-container">
                                <div className="microphone-icon">
                                    <div className="icon-text">T</div>
                                </div>
                            </div>
                        </div>

                        <div className="container">
                            {error && <p className="error-message">{error}</p>}
                            <label htmlFor="uname"><b>Username</b></label>
                            <input type="text" placeholder="Enter Username" name="username" required />

                            <label htmlFor="psw"><b>Password</b></label>
                            <input type="password" placeholder="Enter Password" name="password" required />

                            <button type="submit" disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </button>

                            <label>
                                <input type="checkbox" name="remember" /> Remember me
                            </label>
                        </div>

                        <div className="container" style={{ backgroundColor: "#f1f1f1" }}>
                            <button type="button" className="cancelbtn" onClick={() => setLoginOpen(false)}>
                                Cancel
                            </button>
                            <span className="psw">
                                Forgot <a href="#">password?</a>
                            </span>
                            <span className="psw">
                                No account?{" "}
                                <a href="#" onClick={() => { setLoginOpen(false); setSignupOpen(true); }}>
                                    Create an account
                                </a>
                            </span>
                        </div>
                    </form>
                </div>
            )}

            {isSignupOpen && (
                <div id="id02" className={`modals ${isSignupOpen ? "show" : ""}`} onClick={(e) => handleClose(e, "signup")}>
                    <form className="modals-content animate" ref={signupFormRef} onSubmit={handleSignup}>
                        <div className="imgcontainer">
                            <button type="button" className="close" onClick={() => setSignupOpen(false)}>
                                &times;
                            </button>
                        </div>

                        <div className="container">
                            {error && <p className="error-message">{error}</p>}
                            <label htmlFor="email"><b>Email</b></label>
                            <input type="text" placeholder="Enter Email" name="email" required />

                            <label htmlFor="uname"><b>Username</b></label>
                            <input type="text" placeholder="Enter Username" name="username" required />

                            <label htmlFor="profile"><b>Profile:</b></label>
                            <input type="file" className="pro" id="profile" name="profile" required />

                            <label htmlFor="psw"><b>Password</b></label>
                            <input type="password" placeholder="Enter Password" name="password" required />

                            <label>
                                <input
                                    type="checkbox"
                                    name="terms"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                I accept the <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>terms and conditions</a>.
                            </label>

                            <button type="submit" disabled={!termsAccepted}>
                                Create Account
                            </button>
                        </div>

                        <div className="container" style={{ backgroundColor: "#f1f1f1" }}>
                            <button type="button" className="cancelbtn" onClick={() => setSignupOpen(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showTermsModal && (
                <div className="terms-modal-overlay" onClick={() => setShowTermsModal(false)}>
                    <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="terms-modal-close" onClick={() => setShowTermsModal(false)}>
                            &times;
                        </button>
                        <h2>Terms and Conditions</h2>
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
                </div>
            )}
        </div>
    );
}