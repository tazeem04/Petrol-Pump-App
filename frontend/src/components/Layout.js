import React, { useState } from "react";
import Alerts from '../utils/Alerts';
import { useNavigate } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import {
    FaGasPump, FaChartLine, FaTruck,
    FaFileInvoice, FaUsers, FaCogs, FaSignOutAlt, FaHome, FaBars, FaTimes
} from "react-icons/fa";

function Layout({ children }) {
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
        Swal.fire({
            title: 'System Logout',
            text: "Are you sure you want to end your session?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48', // Puma Red
            cancelButtonColor: '#001f3f',  // Sidebar Blue
            confirmButtonText: 'Yes, Logout',
            background: '#ffffff',
            borderRadius: '15px'
        }).then((result) => {
            if (result.isConfirmed) {
                // Clear session
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');

                // Redirect to login video
                window.location.href = '/';
            }
        });
    };

    const menuItems = [
        { path: "/home", name: "Home", icon: <FaHome /> },
        { path: "/dashboard", name: "Dashboard", icon: <FaChartLine /> },
        { path: "/customers", name: "Customer Khata", icon: <FaUsers /> },
        { path: "/closing", name: "Meter Closing", icon: <FaFileInvoice /> },
        { path: "/stock", name: "Tanker Stock", icon: <FaTruck /> },
        { path: "/rates", name: "Rate Setting", icon: <FaCogs /> },
    ];

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setSidebarOpen(false); // Helper to close

    return (
        <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f7fe" }}>
            <style>{`
                .sidebar-container {
                    background: #001f3f !important;
                    color: white;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    z-index: 1050;
                    width: ${isSidebarOpen ? '260px' : '80px'} !important;
                    min-width: ${isSidebarOpen ? '260px' : '80px'} !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    box-shadow: 4px 0 15px rgba(0,0,0,0.1);
                }

                /* --- BACKDROP/OVERLAY --- */
                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.4);
                    z-index: 1040; /* Just below sidebar */
                    backdrop-filter: blur(2px);
                }

                .nav-link-custom {
                    margin: 4px 0 4px 12px;
                    padding: 12px;
                    border-radius: 30px 0 0 30px;
                    color: rgba(255,255,255,0.7) !important;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .nav-link-custom.active {
                    background-color: #f4f7fe !important;
                    color: #001f3f !important;
                    font-weight: bold;
                }

                .nav-icon-box {
                    font-size: 1.2rem;
                    min-width: 56px; 
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-shrink: 0;
                }
                .main-content-wrapper {
                    flex-grow: 1;
                    min-width: 0; /* Prevents layout breaking */
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                }

                    /* Optional: Ensure the header stays aligned with content */
                    header {
                    width: 100%;
                }
                .sidebar-text {
                    opacity: ${isSidebarOpen ? '1' : '0'};
                    visibility: ${isSidebarOpen ? 'visible' : 'hidden'};
                    transition: opacity 0.2s ease;
                }

                /* MOBILE ADJUSTMENTS */
                @media (max-width: 991px) {
                    .sidebar-container { 
                        position: fixed;
                        width: 260px !important; 
                        left: ${isSidebarOpen ? '0' : '-260px'} !important; 
                    }
                    
                    /* Show overlay only on mobile when sidebar is open */
                    .sidebar-overlay {
                        display: ${isSidebarOpen ? 'block' : 'none'};
                    }
                }
            `}</style>

            {/* --- CLICKABLE OVERLAY --- */}
            <div className="sidebar-overlay no-print" onClick={closeSidebar}></div>

            {/* --- SIDEBAR --- */}
            <div className="no-print sidebar-container shadow-sm">
                <div className="p-3 d-flex align-items-center gap-2 border-bottom border-white border-opacity-10" style={{ height: '80px' }}>
                    <div className="nav-icon-box">
                        <button className="btn p-0 text-white shadow-none" onClick={toggleSidebar}>
                            {isSidebarOpen && window.innerWidth < 992 ? <FaTimes size={22} /> : <FaBars size={22} />}
                        </button>
                    </div>
                    <div className="sidebar-text">
                        <h6 className="m-0 fw-bold text-white text-uppercase" style={{ fontSize: '13px', letterSpacing: '1px' }}>Station Menu</h6>
                    </div>
                </div>

                <div className="mt-4 flex-grow-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === "/customers" && location.pathname.includes("customer-profile"));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link-custom ${isActive ? 'active' : ''}`}
                                onClick={() => window.innerWidth < 992 && closeSidebar()} // Auto-close on mobile after clicking link
                            >
                                <div className="nav-icon-box">{item.icon}</div>
                                <span className="sidebar-text">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-3 border-top border-white border-opacity-10">
                    <button
                        className="btn nav-link-custom border-0 w-100 m-0 shadow-none"
                        style={{ borderRadius: '12px', margin: '0' }}
                        onClick={handleLogout}
                    >
                        <div className="nav-icon-box"><FaSignOutAlt /></div>
                        <span className="sidebar-text">Logout System</span>
                    </button>
                </div>

            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="main-content-wrapper">
                <header className="shadow-sm sticky-top no-print px-3"
                    style={{
                        background: "#001f3f", color: "white", height: "70px", zIndex: 1000,
                        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center"
                    }}
                >
                    <div className="d-flex align-items-center">
                        <button onClick={toggleSidebar} className="btn btn-link text-white p-0 d-lg-none shadow-none">
                            <FaBars size={24} />
                        </button>
                    </div>

                    <div className="text-center">
                        <h5 className="m-0 fw-bold text-uppercase" style={{ fontSize: 'clamp(14px, 2vw, 18px)', letterSpacing: '1px' }}>
                            PUMA ENERGY STATION
                        </h5>
                    </div>

                    <div className="d-flex justify-content-end align-items-center">
                        <div className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center fw-bold shadow-sm"
                            style={{ width: 38, height: 38, fontSize: '14px' }}>
                            M
                        </div>
                    </div>
                </header>

                <main className="p-3 p-md-4">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;