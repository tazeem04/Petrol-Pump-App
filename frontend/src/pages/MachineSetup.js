import { useEffect, useState } from "react";
import axios from "axios";
import { FaGasPump, FaPlus, FaTrash, FaCogs, FaDatabase, FaTimes, FaSave } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Alerts from '../utils/Alerts'; 

function MachineSetup() {
    const [tanks, setTanks] = useState([]);
    const [nozzles, setNozzles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        MachineName: "",
        FuelType: "Petrol",
        TankId: "",
        LabelSideA: "Side A",
        LabelSideB: "Side B"
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const tankRes = await axios.get("http://localhost:5241/api/Stock/tanks");
            const nozzleRes = await axios.get("http://localhost:5241/api/Nozzles");
            setTanks(tankRes.data);
            setNozzles(nozzleRes.data);
        } catch (err) { console.error("Data load error", err); }
    };

    const handleCreateNozzle = async (e) => {
        e.preventDefault();
        if (!formData.TankId || !formData.MachineName) {
            Alerts.error("Missing Info", "Please select a source tank and name the machine.");
            return;
        }

        setLoading(true);
        try {
            await axios.post("http://localhost:5241/api/Nozzles", {
                ...formData,
                TankId: Number(formData.TankId)
            });
            Alerts.success("Success", "Nozzle registered successfully.");
            setShowModal(false); // Close the panel
            setFormData({ MachineName: "", FuelType: "Petrol", TankId: "", LabelSideA: "Side A", LabelSideB: "Side B" });
            loadData();
        } catch (err) {
            Alerts.error("Error", "Failed to link nozzle.");
        } finally { setLoading(false); }
    };

    const handleDeleteNozzle = async (id) => {
        const result = await Alerts.confirmDelete("Delete Nozzle?", "This will remove the machine card from Daily Closing.");
        if (result.isConfirmed) {
            await axios.delete(`http://localhost:5241/api/Nozzles/${id}`);
            loadData();
        }
    };

    return (
        <div className="container py-4 bg-light min-vh-100">
            {/* HEADER SECTION */}
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border">
                <div>
                    <h3 className="fw-bold m-0 text-dark"><FaCogs className="me-2 text-primary" /> Machine Setup</h3>
                    <small className="text-muted">Manage your pump nozzles and side labels</small>
                </div>
                <button className="btn btn-primary fw-bold px-4 shadow-sm" onClick={() => setShowModal(true)} style={{backgroundColor: '#001f3f'}}>
                    <FaPlus className="me-2" /> Add New Machine
                </button>
            </div>

            {/* REGISTERED MACHINES LIST */}
            <div className="card shadow-sm p-4 border-0 rounded-4">
                <h5 className="fw-bold mb-4 text-muted border-bottom pb-2">Active Nozzles Configuration</h5>
                {nozzles.length === 0 ? (
                    <div className="text-center py-5">
                        <FaGasPump size={50} className="text-light mb-3" />
                        <h5 className="text-muted">No machines found</h5>
                        <p className="small text-muted">Click the button above to add your first machine.</p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {nozzles.map(n => (
                            <div key={n.id} className="col-md-6 col-lg-4">
                                <div className="p-3 border rounded-3 bg-white shadow-sm border-top border-4" style={{borderColor: '#001f3f'}}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div className="fw-bold text-dark h5 mb-0">{n.machineName}</div>
                                            <span className="badge bg-primary mb-2">{n.fuelType}</span>
                                            <div className="small text-muted">
                                                <FaDatabase className="me-1" /> Tank: <strong>{n.tank?.tankName || 'N/A'}</strong>
                                            </div>
                                            <div className="mt-2 pt-2 border-top">
                                                <span className="badge bg-light text-dark border me-1">{n.labelSideA}</span>
                                                <span className="badge bg-light text-dark border">{n.labelSideB}</span>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm text-danger" onClick={() => handleDeleteNozzle(n.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL PANEL FOR INPUT */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="fw-bold"><FaPlus className="me-2 text-primary" /> Register Machine</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleCreateNozzle}>
                                        <div className="mb-3">
                                            <label className="small fw-bold text-muted">MACHINE NAME</label>
                                            <input type="text" className="form-control fw-bold" placeholder="e.g. Machine 1" 
                                                value={formData.MachineName} onChange={e => setFormData({...formData, MachineName: e.target.value})} />
                                        </div>
                                        
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <label className="small fw-bold text-muted">FUEL TYPE</label>
                                                <select className="form-select fw-bold" value={formData.FuelType} onChange={e => setFormData({...formData, FuelType: e.target.value})}>
                                                    <option value="Petrol">Petrol</option>
                                                    <option value="Diesel">Diesel</option>
                                                    <option value="Hi-Octane">Hi-Octane</option>
                                                    <option value="Mobile Oil">Mobile Oil</option>
                                                </select>
                                            </div>
                                            <div className="col-6">
                                                <label className="small fw-bold text-muted">SOURCE TANK</label>
                                                <select className="form-select fw-bold border-primary" value={formData.TankId} onChange={e => setFormData({...formData, TankId: e.target.value})}>
                                                    <option value="">-- Select --</option>
                                                    {tanks.map(t => (
                                                        <option key={t.id} value={t.id}>{t.tankName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="row g-2 mb-4">
                                            <div className="col-6">
                                                <label className="small fw-bold text-muted">LABEL SIDE A</label>
                                                <input type="text" className="form-control" value={formData.LabelSideA} 
                                                    onChange={e => setFormData({...formData, LabelSideA: e.target.value})} />
                                            </div>
                                            <div className="col-6">
                                                <label className="small fw-bold text-muted">LABEL SIDE B</label>
                                                <input type="text" className="form-control" value={formData.LabelSideB} 
                                                    onChange={e => setFormData({...formData, LabelSideB: e.target.value})} />
                                            </div>
                                        </div>

                                        <button className="btn btn-primary w-100 fw-bold py-2 shadow-sm" disabled={loading} style={{backgroundColor: '#001f3f'}}>
                                            <FaSave className="me-2" /> {loading ? "Registering..." : "Save Configuration"}
                                        </button>
                                        <button type="button" className="btn btn-link w-100 text-muted mt-2" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default MachineSetup;