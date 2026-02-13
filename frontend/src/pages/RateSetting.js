import { useEffect, useState } from "react";
import axios from "axios";
import { FaSave, FaGasPump, FaHistory, FaCog, FaCalendarAlt, FaCheckCircle, FaTrash, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Alerts from '../utils/Alerts';

function RateSetting() {
    const [rates, setRates] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => { fetchRates(); }, []);

    const fetchRates = () => {
        axios.get("http://localhost:5241/api/rates")
            .then(res => { setRates(res.data); setLoading(false); })
            .catch(err => { Alerts.error("Error", "Rates load nahi ho sakay."); setLoading(false); });
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get("http://localhost:5241/api/rates/history");
            setHistory(res.data);
            setShowHistory(true);
        } catch (err) { Alerts.error("History Error", "History load nahi ho saki."); }
    };

    const handleChange = (index, val) => {
        if (val < 0) return;
        const newRates = [...rates];
        newRates[index].currentPrice = val;
        setRates(newRates);
    };

    const handleSave = async () => {
        try {
            await axios.post("http://localhost:5241/api/rates/update", rates);
            Alerts.success("Updated!", "Naye rates database mein sync ho gaye hain.");
            fetchRates();
            if (showHistory) fetchHistory(); 
        } catch (error) { Alerts.error("Update Failed", "Server communication error."); }
    };

    const handleDeleteHistory = async (id) => {
        const result = await Alerts.confirmDelete("Delete Record?", "Ye history record permanently delete ho jayega.");
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5241/api/rates/history/${id}`);
                setHistory(prev => prev.filter(h => h.id !== id));
                Alerts.success("Deleted", "Record remove kar diya gaya.");
            } catch (err) { Alerts.error("Error", "Delete nahi ho saka."); }
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid py-3 px-2 px-md-4 min-vh-100" style={{backgroundColor: '#f4f7f6'}}>
            <style>{`
                .main-card { background: white; border-radius: 12px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                
                /* MOBILE OPTIMIZED RATE ROW */
                .rate-scroll-container {
                    display: flex;
                    gap: 15px;
                    overflow-x: auto;
                    padding: 10px 5px 20px 5px;
                    scrollbar-width: none; /* Hide scrollbar Firefox */
                }
                .rate-scroll-container::-webkit-scrollbar { display: none; } /* Hide scrollbar Chrome */

                .mobile-rate-card {
                    min-width: 280px;
                    flex: 1;
                }

                .price-box {
                    background: #f8fafc !important;
                    border: 2px solid #e2e8f0 !important;
                    font-size: 1.8rem !important;
                    font-weight: 800 !important;
                    color: #001f3f !important;
                    text-align: center;
                    border-radius: 10px !important;
                    height: 60px;
                }
                .price-box:focus { border-color: #001f3f !important; background: white !important; }

                .btn-navy { background-color: #001f3f; color: white; border-radius: 8px; border: none; transition: 0.3s; }
                .btn-navy:hover { background-color: #003366; color: white; }

                /* MODAL OVERLAY FOR HISTORY ON MOBILE */
                .history-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: white; z-index: 2000;
                    overflow-y: auto;
                }

                @media (min-width: 768px) {
                    .rate-scroll-container { overflow-x: visible; flex-wrap: wrap; }
                    .mobile-rate-card { min-width: auto; flex: 0 0 calc(50% - 15px); }
                    .history-overlay { position: relative; background: none; z-index: 1; }
                }

                @media (min-width: 1200px) {
                    .mobile-rate-card { flex: 0 0 calc(25% - 15px); }
                }
            `}</style>

            {/* --- HEADER --- */}
            <div className="main-card p-3 p-md-4 mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div className="text-center text-md-start">
                        <h3 className="fw-bold m-0" style={{color: '#001f3f'}}><FaCog className="me-2" /> Price Setting</h3>
                        <p className="text-muted m-0 small fw-bold">Update daily selling rates</p>
                    </div>
                    <div className="d-flex gap-2 w-100 w-md-auto">
                        <button onClick={fetchHistory} className="btn btn-light border flex-grow-1 fw-bold shadow-sm">
                            <FaHistory className="me-2 text-primary"/> Audit Log
                        </button>
                        <button onClick={handleSave} className="btn-navy flex-grow-1 px-4 fw-bold shadow-sm">
                            <FaSave className="me-2"/> Save Rates
                        </button>
                    </div>
                </div>
            </div>

            {/* --- HORIZONTAL RATE CARDS --- */}
            <div className="rate-scroll-container">
                {rates.map((r, i) => (
                    <div className="mobile-rate-card" key={r.id}>
                        <motion.div 
                            whileTap={{ scale: 0.98 }}
                            className="main-card p-4 border-top border-4" 
                            style={{ borderTopColor: getFuelColor(r.fuelType) }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <FaGasPump size={18} style={{ color: getFuelColor(r.fuelType) }} />
                                    <h5 className="fw-bold m-0 text-dark">{r.fuelType}</h5>
                                </div>
                                <span className="badge rounded-pill" style={{backgroundColor: '#e1f9eb', color: '#1db46a', fontSize: '10px'}}>
                                    <FaCheckCircle className="me-1"/> LIVE
                                </span>
                            </div>

                            <div className="mb-3">
                                <label className="small fw-bold text-muted mb-2 d-block text-center text-uppercase">PKR / Litre</label>
                                <input 
                                    type="number" 
                                    className="form-control price-box" 
                                    value={r.currentPrice} 
                                    onChange={(e) => handleChange(i, e.target.value)} 
                                    inputMode="decimal"
                                />
                            </div>

                            <div className="mt-2 text-center">
                                <span className="text-muted fw-bold" style={{fontSize: '11px'}}>
                                    <FaCalendarAlt className="me-1"/> Sync: {r.lastUpdated ? new Date(r.lastUpdated).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}) : "N/A"}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* --- AUDIT LOG MODAL/SECTION --- */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div 
                        initial={{ opacity: 0, x: '100%' }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: '100%' }} 
                        className="history-overlay"
                    >
                        <div className="p-3 p-md-4">
                            <div className="main-card overflow-hidden">
                                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top">
                                    <h5 className="fw-bold m-0 text-dark"><FaHistory className="me-2 text-primary" /> Change Log</h5>
                                    <button className="btn btn-sm btn-danger px-3" onClick={() => setShowHistory(false)}>
                                        <FaTimes className="me-1"/> Close
                                    </button>
                                </div>
                                <div className="table-responsive">
                                    <table className="table m-0 text-center">
                                        <thead style={{backgroundColor: '#001f3f', color: 'white'}}>
                                            <tr className="small text-uppercase">
                                                <th className="p-3">Time</th>
                                                <th className="p-3">Fuel</th>
                                                <th className="p-3">New Price</th>
                                                <th className="p-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((h) => (
                                                <tr key={h.id}>
                                                    <td className="small text-muted py-3">{new Date(h.date).toLocaleDateString()}</td>
                                                    <td className="fw-bold">{h.fuelType}</td>
                                                    <td className="fw-bold text-primary">Rs {h.newPrice}</td>
                                                    <td>
                                                        <button onClick={() => handleDeleteHistory(h.id)} className="btn btn-sm text-danger border-0">
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const getFuelColor = (type) => {
    switch(type) {
        case 'Petrol': return '#ef4444';
        case 'Diesel': return '#22c55e';
        case 'Hi-Octane': return '#8b5cf6';
        default: return '#f59e0b';
    }
}

export default RateSetting;