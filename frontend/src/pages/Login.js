import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaLock, FaArrowLeft } from 'react-icons/fa';
import Alerts from '../utils/Alerts';

const Login = () => {
    const [view, setView] = useState('splash');
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading animation/text
    try {
        const response = await axios.post("http://localhost:5241/api/auth/login", credentials);
        
        // 1. Show Success Message
        Alerts.success("Success", "Login Successful! Opening Dashboard...");

        // 2. Set login state
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", response.data.username);

        // 3. Delay redirect so the user sees the success alert
        setTimeout(() => {
            window.location.href = "/dashboard"; // Redirect to dashboard after login
        }, 1500);
        
    } catch (err) {
        setLoading(false); // Stop loading if it fails
        const errorMsg = err.response?.data?.message || "Wrong username or Password!";
        Alerts.error("Login Failed", errorMsg);
    }
};

    return (
        <div className="video-container">
            {/* VIDEO BACKGROUND */}
            <video autoPlay loop muted playsInline className="full-screen-video clean-video">
                <source src="/assets/puma_intro.mp4" type="video/mp4" />
            </video>

            {/* --- DESKTOP VIEW UI --- */}
            {isDesktop && view === 'splash' && (
                <div className="desktop-fixed-layer">
                    <header className="puma-nav">
                        <img src="/assets/logo.png" alt="Puma" className="nav-logo" />
                        <h2 className="ms-3 text-white fw-bold mb-0">PUMA ENERGY</h2>
                    </header>
                    <div className="welcome-banner-fixed text-center">
                        <h1 className="text-white fw-light mb-0">Welcome to the</h1>
                        <h1 className="text-danger fw-bold display-4">DIGITAL SALES PORTAL</h1>
                    </div>
                </div>
                
            )}

            {/* --- VIEW 1: SPLASH (LARGE ADMIN HOTSPOT) --- */}
            {view === 'splash' && (
                <div className="touch-overlay">
                    <button
                        className={`admin-large-hotspot ${isDesktop ? 'desktop-btn-visible-red' : ''}`}
                        onClick={() => setView('login')}
                    >
                        {isDesktop ? "ACCESS SYSTEM" : ""}
                    </button>
                </div>
            )}

            {/* --- VIEW 2: LOGIN FORM (Logo Restored) --- */}
            {view === 'login' && (
                <div className="glass-modal">
                    <div className="login-card animate-in">
                        <div className="card-header-inline mb-4">
                            <button className="back-arrow-inline" onClick={() => setView('splash')}>
                                <FaArrowLeft />
                            </button>
                            <h4 className="header-title-inline">LOGIN PORTAL</h4>
                        </div>
                        <form onSubmit={handleLogin}>
                            <div className="glass-input">
                                <FaUser className="ms-2 text-white-50" />
                                <input type="text" placeholder="Username" required
                                    onChange={e => setCredentials({ ...credentials, username: e.target.value })} />
                            </div>
                            <div className="glass-input">
                                <FaLock className="ms-2 text-white-50" />
                                <input type="password" placeholder="Password" required
                                    onChange={e => setCredentials({ ...credentials, password: e.target.value })} />
                            </div>
                            <button type="submit" className="red-submit-btn">PROCEED</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .video-container {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    height: 100dvh; width: 100vw; overflow: hidden; background: #000;
                }

                .clean-video {
                    position: absolute; 
                    top: -35px; /* Pushes recorded bar up */
                    left: 0; width: 100%; height: calc(100% + 70px); 
                    object-fit: cover;
                }

                /* --- DESKTOP FIXED UI (No micro-second jump) --- */
                .desktop-fixed-layer { position: absolute; inset: 0; z-index: 5; }
                .puma-nav {
                    position: absolute; top: 0; width: 100%; padding: 25px 50px;
                    display: flex; align-items: center; background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(10px); z-index: 50;
                }
                .nav-logo { height: 45px; background: white; padding: 4px; border-radius: 6px; }
                
                .welcome-banner-fixed { 
                    position: absolute; 
                    top: 25%; /* Fixed position from top */
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                }

                /* --- HOTSPOT --- */
                .touch-overlay { position: absolute; inset: 0; z-index: 10; }
                .admin-large-hotspot {
                    position: absolute; left: 50%; transform: translateX(-50%);
                    bottom: 3%; width: 90%; height: 180px; 
                    background: transparent; border: none; outline: none;
                    cursor: pointer; -webkit-tap-highlight-color: transparent;
                }

                .desktop-btn-visible-red { 
                    height: 60px !important; bottom: 15% !important; width: 350px !important;
                    background: #e11d48 !important; color: white !important; 
                    font-weight: bold; border-radius: 12px !important; display: flex; align-items: center; justify-content: center;
                }

                /* --- LOGIN CARD & LOGO --- */
                .glass-modal {
                    position: absolute; inset: 0;
                    background: rgba(0,0,0,0.7); backdrop-filter: blur(15px);
                    display: flex; align-items: center; justify-content: center; z-index: 100;
                }
                .login-card {
                    background: rgba(255,255,255,0.1); padding: 30px 25px; border-radius: 25px;
                    width: 90%; max-width: 380px; border: 1px solid rgba(255,255,255,0.2);
                    position: relative;
                }
                .card-logo { height: 40px; background: white; padding: 4px; border-radius: 5px; }

                .glass-input {
                    background: rgba(255,255,255,0.1); border-radius: 12px;
                    display: flex; align-items: center; margin-bottom: 15px; padding: 12px;
                }
                .glass-input input { background: transparent; border: none; color: white; width: 100%; outline: none; margin-left: 10px; }
                .red-submit-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; background: #e11d48; color: white; font-weight: bold; cursor: pointer; }
                .back-arrow { background: none; border: none; color: white; margin-bottom: 10px; cursor: pointer; }

                .animate-in { animation: fadeIn 0.4s ease forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .card-header-inline {
    display: flex;
    align-items: center; /* Vertically centers arrow with text */
    justify-content: flex-start; /* Keeps them together on the left */
    gap: 10px; /* Space between arrow and text */
    width: 100%;
}

.back-arrow-inline {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    display: flex;
    align-items: center;
}

.header-title-inline {
    color: white;
    font-weight: bold;
    margin: 0;
    font-size: 1.25rem; /* Adjusted size to fit well */
    white-space: nowrap; /* Prevents text from breaking into two lines */
    padding-left: 65px;
}
            `}</style>
        </div>
    );
};

export default Login;