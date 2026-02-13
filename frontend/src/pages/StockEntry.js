import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaTruckLoading, FaHistory, FaPlus, FaSave, FaTrash, FaDatabase, FaEdit, FaTimes, FaRulerVertical, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../context/AppContext";
import Alerts from '../utils/Alerts';

function StockEntry() {
    const { saleFormState, setSaleFormState } = useContext(AppContext);

    // --- DATA STATES ---
    const [tanks, setTanks] = useState([]);
    const [history, setHistory] = useState([]); 
    const [dipHistory, setDipHistory] = useState([]); 
    const [loading, setLoading] = useState(false);

    // --- MODAL CONTROL STATES ---
    const [showRefillModal, setShowRefillModal] = useState(false);
    const [showDipModal, setShowDipModal] = useState(false);
    const [showTankModal, setShowTankModal] = useState(false);

    // --- FORM STATES (PURCHASE/REFILL) ---
    const [selectedTank, setSelectedTank] = useState("");
    const [quantity, setQuantity] = useState("");
    const [costPerLiter, setCostPerLiter] = useState("");
    const [editingId, setEditingId] = useState(null);

    // --- FORM STATES (MANUAL DIP ENTRY) ---
    const [dipTankId, setDipTankId] = useState("");
    const [dipReading, setDipReading] = useState("");
    const [dipLiters, setDipLiters] = useState("");

    // --- TANK SETUP STATES ---
    const [editingTankId, setEditingTankId] = useState(null);
    const [newTank, setNewTank] = useState({ tankName: "", fuelType: "Petrol", capacity: "", currentStock: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        Promise.all([
            axios.get("http://localhost:5241/api/Stock/tanks"),
            axios.get("http://localhost:5241/api/Stock/history"),
            axios.get("http://localhost:5241/api/Dip/history")
        ]).then(([tanksRes, historyRes, dipRes]) => {
            setTanks(tanksRes.data || []);
            setHistory(historyRes.data || []);
            setDipHistory(dipRes.data || []);
        }).catch(err => console.error("Load Error:", err))
          .finally(() => setLoading(false));
    };

    // --- HANDLERS ---
    const handleRefillSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = { 
            Id: editingId || 0, 
            TankId: Number(selectedTank), 
            Quantity: parseFloat(quantity), 
            CostPerLiter: parseFloat(costPerLiter) 
        };
        try {
            if (editingId) await axios.put(`http://localhost:5241/api/Stock/refill/${editingId}`, payload);
            else await axios.post("http://localhost:5241/api/Stock/refill", payload);
            setShowRefillModal(false); resetRefill(); loadData();
            Alerts.success("Saved", "Purchase record updated.");
        } catch (e) { Alerts.error("Error", "Action failed."); }
        finally { setLoading(false); }
    };

    const handleEditRefill = (item) => {
        setEditingId(item.id);
        setSelectedTank(item.tankId);
        setQuantity(item.quantity);
        setCostPerLiter(item.costPerLiter);
        setShowRefillModal(true);
    };

    const handleDipSubmit = async (e) => {
        e.preventDefault();
        const tank = tanks.find(t => t.id === Number(dipTankId));
        setLoading(true);
        try {
            const payload = { TankId: Number(dipTankId), DipMM: parseFloat(dipReading), QuantityLiters: parseFloat(dipLiters), TankName: tank?.fuelType };
            await axios.post("http://localhost:5241/api/Dip/save", payload);
            setShowDipModal(false); setDipReading(""); setDipLiters(""); loadData();
            Alerts.success("Synced", "Dip history updated.");
        } catch (err) { Alerts.error("Error", "Manual entry failed."); }
        finally { setLoading(false); }
    };

    const handleSaveTank = async () => {
        const payload = { Id: editingTankId || 0, TankName: newTank.tankName, FuelType: newTank.fuelType, Capacity: parseFloat(newTank.capacity), CurrentStock: parseFloat(newTank.currentStock || 0) };
        try {
            if (editingTankId) await axios.put(`http://localhost:5241/api/Tanks/${editingTankId}`, payload);
            else await axios.post("http://localhost:5241/api/Tanks", payload);
            setShowTankModal(false); setEditingTankId(null); loadData();
            Alerts.success("Success", "Tank saved.");
        } catch (e) { Alerts.error("Error", "Action failed."); }
    };

    const resetRefill = () => { setEditingId(null); setSelectedTank(""); setQuantity(""); setCostPerLiter(""); };

    // --- CALCULATIONS FOR NET TOTALS ---
    const totalRefillLiters = history.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
    const totalRefillCost = history.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.costPerLiter || 0)), 0);

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <style>{`
                .header-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; margin-bottom: 30px; }
                .stock-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; height: 100%; }
                .history-table thead th { background: #001f3f !important; color: white !important; font-size: 11px; text-transform: uppercase; padding: 15px; text-align: center; }
                .history-table tbody td { padding: 12px; text-align: center; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
                .table-footer { background: #f8fafc; font-weight: bold; }
                
                .btn-navy-custom { 
                    background-color: #001f3f !important; color: white !important; font-weight: bold; 
                    border: 2px solid #001f3f !important; transition: all 0.3s ease; border-radius: 10px; padding: 12px 24px;
                    display: flex; align-items: center; justify-content: center; gap: 10px; flex: 1; min-width: 180px;
                }
                .btn-navy-custom:hover { background-color: white !important; color: #001f3f !important; box-shadow: 0 4px 12px rgba(0,31,63,0.2); }
                
                @media (max-width: 768px) {
                    .header-flex { flex-direction: column; text-align: center; gap: 20px; }
                    .btn-navy-custom { width: 100%; }
                }
            `}</style>

            {/* --- RESPONSIVE HEADER --- */}
            <div className="header-container shadow-sm border-0">
                <div className="d-flex header-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold m-0 text-dark">Inventory Management</h2>
                        <p className="text-muted m-0 small">Overview of your fuel stocks and purchase records.</p>
                    </div>
                    <div className="d-flex flex-wrap gap-3 button-group w-auto">
                        <button className="btn-navy-custom" onClick={() => { resetRefill(); setShowRefillModal(true); }}>
                            <FaTruckLoading size={18} /> Purchase Stock
                        </button>
                        <button className="btn-navy-custom" onClick={() => setShowDipModal(true)} style={{backgroundColor:'#0d6efd', borderColor:'#0d6efd'}}>
                            <FaRulerVertical size={16} /> Manual Dip Entry
                        </button>
                        <button className="btn-navy-custom" onClick={() => { setEditingTankId(null); setShowTankModal(true); }} style={{backgroundColor:'#6c757d', borderColor:'#6c757d'}}>
                            <FaPlus size={16} /> Setup Tank
                        </button>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* --- 1. REFILL HISTORY --- */}
                <div className="col-lg-8">
                    <div className="stock-card p-4 shadow-sm">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2"><FaHistory className="text-primary" /> Purchase Refill Logs</h5>
                        <div className="table-responsive">
                            <table className="table history-table align-middle">
                                <thead>
                                    <tr>
                                        <th>Date</th><th>Tank</th><th>Rate</th><th>Qty (L)</th>
                                        <th>Total Bill</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((h, index) => {
                                        
                                        return (
                                            <tr key={h.id}>
                                                <td className="small">{new Date(h.date || h.Date).toLocaleDateString()}</td>
                                                <td className="fw-bold">{h.tankName}</td>
                                                <td>Rs {h.costPerLiter}</td>
                                                <td className="text-primary fw-bold">{h.quantity} L</td>
                                                <td className="fw-bold text-success">Rs {(h.quantity * h.costPerLiter).toLocaleString()}</td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <FaEdit className="text-primary cursor-pointer" onClick={() => handleEditRefill(h)} title="Edit" />
                                                        <FaTrash className="text-danger cursor-pointer" onClick={() => Alerts.confirmDelete("Delete?", "Remove this log?").then(r => r.isConfirmed && axios.delete(`http://localhost:5241/api/Stock/refill/${h.id}`).then(loadData))} title="Delete" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="table-footer">
                                    <tr>
                                        <td colSpan="3" className="text-end">NET TOTALS:</td>
                                        <td className="text-primary">{totalRefillLiters.toLocaleString()} L</td>
                                        <td></td>
                                        <td className="text-success">Rs {totalRefillCost.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- 2. DIP HISTORY --- */}
                <div className="col-lg-4">
                    <div className="stock-card p-4 shadow-sm">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2"><FaRulerVertical className="text-primary" /> Physical Dip Logs</h5>
                        <div className="table-responsive">
                            <table className="table history-table">
                                <thead>
                                    <tr><th>Date</th><th>Tank</th><th>MM</th><th>Liters</th></tr>
                                </thead>
                                <tbody>
                                    {dipHistory.map(d => (
                                        <tr key={d.id}>
                                            <td className="small">{new Date(d.date || d.Date || d.createdAt).toLocaleDateString()}</td>
                                            <td className="fw-bold">{d.tankName}</td>
                                            <td>{d.dipMM}</td>
                                            <td className="fw-bold text-primary">{d.quantityLiters.toLocaleString()} L</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- 3. TANKS SECTION (AT BOTTOM) --- */}
                <div className="col-12">
                    <div className="stock-card p-4 shadow-sm">
                        <h6 className="fw-bold text-muted mb-4 text-uppercase small">Current Storage Levels</h6>
                        <div className="row row-cols-1 row-cols-md-4 g-4">
                            {tanks.map(t => (
                                <div key={t.id} className="col">
                                    <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fw-bold text-muted small">{t.tankName}</span>
                                            <FaEdit className="text-primary cursor-pointer small" onClick={() => { setEditingTankId(t.id); setNewTank(t); setShowTankModal(true); }} />
                                        </div>
                                        <h3 className="fw-bold m-0" style={{ color: '#001f3f' }}>{t.currentStock.toLocaleString()} <small className="fs-6">L</small></h3>
                                        <div className="progress mt-3 mb-2" style={{ height: '10px', borderRadius: '10px' }}>
                                            <div className="progress-bar" style={{ width: `${(t.currentStock / t.capacity) * 100}%`, backgroundColor: '#001f3f' }}></div>
                                        </div>
                                        <div className="d-flex justify-content-between small fw-bold">
                                            <span className="text-muted">Cap: {t.capacity}L</span>
                                            <span className="text-navy">{((t.currentStock / t.capacity) * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- UNIFORM MODALS --- */}
            <AnimatePresence>
                {/* 1. PURCHASE MODAL */}
                {showRefillModal && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0 bg-navy text-white p-4" style={{ background: '#001f3f', borderRadius: '15px 15px 0 0' }}>
                                    <h5 className="fw-bold m-0"><FaTruckLoading className="me-2"/>{editingId ? "Update Purchase" : "New Purchase Refill"}</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowRefillModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="small fw-bold text-muted text-uppercase">Target Tank</label>
                                        <select className="form-select border-2 p-3" value={selectedTank} onChange={e => setSelectedTank(e.target.value)}>
                                            <option value="">-- Choose Tank --</option>
                                            {tanks.map(t => <option key={t.id} value={t.id}>{t.tankName}</option>)}
                                        </select>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-6"><label className="small fw-bold text-muted text-uppercase">Rate (P/L)</label><input type="number" className="form-control p-3 border-2" value={costPerLiter} onChange={e => setCostPerLiter(e.target.value)} /></div>
                                        <div className="col-6"><label className="small fw-bold text-muted text-uppercase">Quantity (L)</label><input type="number" className="form-control p-3 border-2" value={quantity} onChange={e => setQuantity(e.target.value)} /></div>
                                    </div>
                                    <div className="p-3 mb-3 bg-light rounded border text-center fw-bold">
                                        TOTAL BILL: Rs {(quantity * costPerLiter).toLocaleString()}
                                    </div>
                                    <button className="btn-navy-custom w-100 py-3" onClick={handleRefillSubmit}><FaSave className="me-2"/> Save Purchase</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 2. DIP MODAL */}
                {showDipModal && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0 bg-navy text-white p-4" style={{ background: '#001f3f', borderRadius: '15px 15px 0 0' }}>
                                    <h5 className="fw-bold m-0"><FaRulerVertical className="me-2"/>Manual Dip Record</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowDipModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3"><label className="small fw-bold text-muted text-uppercase">Select Tank</label>
                                        <select className="form-select border-2 p-3" value={dipTankId} onChange={e => setDipTankId(e.target.value)}>
                                            <option value="">-- Choose Tank --</option>
                                            {tanks.map(t => <option key={t.id} value={t.id}>{t.tankName}</option>)}
                                        </select>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-6"><label className="small fw-bold text-muted text-uppercase">Dip (MM)</label><input type="number" className="form-control p-3 border-2" placeholder="e.g. 40" value={dipReading} onChange={e => setDipReading(e.target.value)} /></div>
                                        <div className="col-6"><label className="small fw-bold text-muted text-uppercase">Liters (Chart)</label><input type="number" className="form-control p-3 border-2 fw-bold text-primary" placeholder="e.g. 49" value={dipLiters} onChange={e => setDipLiters(e.target.value)} /></div>
                                    </div>
                                    <button className="btn-navy-custom w-100 py-3" onClick={handleDipSubmit} style={{backgroundColor:'#0d6efd', borderColor:'#0d6efd'}}>Save Physical Level</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 3. TANK SETUP MODAL */}
                {showTankModal && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0 bg-navy text-white p-4" style={{ background: '#001f3f', borderRadius: '15px 15px 0 0' }}>
                                    <h5 className="fw-bold m-0"><FaDatabase className="me-2"/> Tank Configuration</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowTankModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3"><label className="small fw-bold text-muted text-uppercase">Tank Name</label><input type="text" className="form-control p-3 border-2" value={newTank.tankName} onChange={e => setNewTank({...newTank, tankName: e.target.value})} /></div>
                                    <div className="row mb-3">
                                        <div className="col-6"><label className="small fw-bold text-muted text-uppercase">Fuel Type</label><select className="form-select border-2 p-3" value={newTank.fuelType} onChange={e => setNewTank({...newTank, fuelType: e.target.value})}><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Hi-Octane">Hi-Octane</option></select></div>
                                        <div className="col-6"><label className="small fw-bold text-muted text-uppercase">Capacity (L)</label><input type="number" className="form-control p-3 border-2" value={newTank.capacity} onChange={e => setNewTank({...newTank, capacity: e.target.value})} /></div>
                                    </div>
                                    <button className="btn-navy-custom w-100 py-3" onClick={handleSaveTank} style={{backgroundColor:'#6c757d', borderColor:'#6c757d'}}><FaSave className="me-2"/> Save Tank Setup</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default StockEntry;