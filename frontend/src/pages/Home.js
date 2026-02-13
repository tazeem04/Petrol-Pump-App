import React from "react";
import { motion } from "framer-motion";
import {
  FaGasPump,
  FaTools,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaChevronRight,
  FaClock,
  FaCheckCircle
} from "react-icons/fa";

function Home() {
  return (
    <div className="home-container">
      {/* ================= 1. WELCOME LABEL (TOP) ================= */}
      <header className="welcome-header">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="header-content"
        >
          <span className="system-online">
             <FaCheckCircle className="online-icon" /> SYSTEM ONLINE
          </span>
          <h1 className="welcome-text">Welcome to</h1>
          <h2 className="brand-text">PUMA PETROL ENERGY</h2>
        </motion.div>
      </header>

      {/* ================= 2. HERO IMAGE (CLEAR VIEW) ================= */}
      <section className="image-section">
        <div className="puma-image-wrapper shadow-lg">
          {/* Aapki local image yahan use ho rahi hai */}
          <img src="/assets/puma.jpg" alt="Puma Station" className="main-puma-img" />
          <div className="image-overlay-label">
            <h4 className="m-0">STATION COMMAND</h4>
            <small>Nadeem Hussain | 03117675419</small>
          </div>
        </div>
      </section>

      {/* ================= 3. INFO BOXES (2x2 GRID) ================= */}
      <section className="grid-section">
        <div className="container px-4">
          <div className="row g-4">
            
            {/* Box 1: Live Rates */}
            <div className="col-md-6">
              <motion.div whileHover={{ y: -5 }} className="info-box glass-red">
                <div className="box-header">
                  <FaGasPump className="icon text-danger" /> 
                  <span>LIVE FUEL RATES</span>
                </div>
                <div className="dotted-list mt-3">
                  <div className="d-row"><span>Petrol</span><div className="dots"></div><b className="price">272.5</b></div>
                  <div className="d-row"><span>Diesel</span><div className="dots"></div><b className="price">281.2</b></div>
                  <div className="d-row"><span>RON 97</span><div className="dots"></div><b className="price">295.1</b></div>
                </div>
              </motion.div>
            </div>

            {/* Box 2: Services */}
            <div className="col-md-6">
              <motion.div whileHover={{ y: -5 }} className="info-box glass-green">
                <div className="box-header">
                  <FaTools className="icon text-success" /> 
                  <span>CORE SERVICES</span>
                </div>
                <div className="service-list mt-3">
                  <div className="s-item"><FaChevronRight className="bullet" /> Fueling & Lubricants</div>
                  <div className="s-item"><FaChevronRight className="bullet" /> Professional Car Wash</div>
                  <div className="s-item"><FaChevronRight className="bullet" /> Engine Diagnostics</div>
                </div>
              </motion.div>
            </div>

            {/* Box 3: Location */}
            <div className="col-md-6">
              <motion.div whileHover={{ y: -5 }} className="info-box glass-blue">
                <div className="box-header">
                  <FaMapMarkerAlt className="icon text-primary" /> 
                  <span>HUB LOCATION</span>
                </div>
                <p className="box-desc mt-3">
                  Regional Hub, Station #782. Operational 24/7/365. 
                  Standard safety protocols active for all fleet owners.
                </p>
              </motion.div>
            </div>

            {/* Box 4: Why Choose Us */}
            <div className="col-md-6">
              <motion.div whileHover={{ y: -5 }} className="info-box glass-yellow">
                <div className="box-header">
                  <FaShieldAlt className="icon text-warning" /> 
                  <span>WHY CHOOSE US?</span>
                </div>
                <div className="why-pills mt-3">
                  <div className="pills"><FaShieldAlt /> 100% Quality</div>
                  <div className="pills"><FaClock /> 24/7 Service</div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@500&display=swap');

        .home-container {
          background-color: #000c1d; /* Deep Navy Blue */
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          color: white;
          padding-bottom: 50px;
        }

        /* 1. Header */
        .welcome-header { padding: 40px 0 20px; text-align: center; }
        .system-online { color: #22c55e; font-size: 11px; font-weight: 900; letter-spacing: 2px; }
        .welcome-text { font-weight: 300; font-size: 2.2rem; margin: 0; }
        .brand-text { font-weight: 900; font-size: 3rem; color: #ffcc00; letter-spacing: -1px; margin-top: -10px; }

        /* 2. Image Section */
        .image-section { display: flex; justify-content: center; padding: 20px 40px; }
        .puma-image-wrapper { 
          width: 100%; max-width: 1000px; height: 350px; 
          border-radius: 20px; overflow: hidden; position: relative;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .main-puma-img { width: 100%; height: 100%; object-fit: cover; }
        .image-overlay-label {
          position: absolute; bottom: 20px; left: 20px;
          background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px);
          padding: 15px 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
        }

        /* 3. Grid Boxes */
        .grid-section { margin-top: 30px; }
        .info-box { 
          background: rgba(255, 255, 255, 0.03); 
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px; padding: 25px; height: 100%;
          backdrop-filter: blur(12px); transition: 0.3s ease;
        }
        .box-header { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 13px; letter-spacing: 1px; }
        
        /* Dotted Lines */
        .dotted-list { font-family: 'JetBrains Mono', monospace; }
        .d-row { display: flex; align-items: baseline; font-size: 14px; color: #cbd5e1; margin-bottom: 10px; }
        .dots { flex-grow: 1; border-bottom: 1px dotted rgba(255,255,255,0.2); margin: 0 10px; height: 10px; }
        .price { font-size: 18px; color: #fff; }

        /* Others */
        .s-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #94a3b8; margin-bottom: 8px; }
        .bullet { color: #22c55e; font-size: 10px; }
        .box-desc { font-size: 13px; color: #94a3b8; line-height: 1.6; }
        .why-pills { display: flex; gap: 15px; }
        .pills { background: rgba(255,255,255,0.05); padding: 8px 15px; border-radius: 50px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; }

        /* Colors */
        .glass-red:hover { border-color: rgba(220, 53, 69, 0.5); }
        .glass-green:hover { border-color: rgba(40, 167, 69, 0.5); }
        .glass-blue:hover { border-color: rgba(13, 110, 253, 0.5); }
        .glass-yellow:hover { border-color: rgba(255, 193, 7, 0.5); }
      `}</style>
    </div>
  );
}

export default Home;