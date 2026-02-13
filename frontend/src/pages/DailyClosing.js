import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaSave, FaGasPump, FaOilCan, FaHistory, FaEdit, FaTrash, FaPlus, FaCogs, FaTimes, FaDatabase } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../context/AppContext";
import Alerts from '../utils/Alerts';

function DailyClosing() {
    const { saleFormState, setSaleFormState } = useContext(AppContext);

    // Data States
    const [machines, setMachines] = useState([]);
    const [history, setHistory] = useState([]);
    const [tanks, setTanks] = useState([]);

    // UI States
    const [showHistory, setShowHistory] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);

    // Edit/Setup States
    const [editingId, setEditingId] = useState(null);
    const [editingNozzleId, setEditingNozzleId] = useState(null);
    const [nozzleForm, setNozzleForm] = useState({
        MachineName: "",
        FuelType: "Petrol",
        TankId: "",
        LabelSideA: "Side A",
        LabelSideB: "Side B"
    });

    useEffect(() => {
        const initialize = async () => {
            await loadData();
            await loadHistory();
            await loadTanks();
        };
        initialize();
    }, []);

    const loadData = async () => {
        try {
            const res = await axios.get("http://localhost:5241/api/Closing/formdata");
            const freshMachines = res.data.map(m => ({
                ...m,
                closingA: "",
                closingB: "",
                sale: 0,
                amount: 0
            }));
            setMachines(freshMachines);
            setSaleFormState(prev => ({ ...prev, closingMachines: freshMachines }));
        } catch (err) {
            console.error("Nozzle load error");
        }
    };

    const loadHistory = async () => {
        try {
            const res = await axios.get("http://localhost:5241/api/Closing");
            setHistory(res.data);
        } catch (err) {
            console.error("History Error:", err);
        }
    };

    const loadTanks = async () => {
        try {
            const res = await axios.get("http://localhost:5241/api/Stock/tanks");
            setTanks(res.data);
        } catch (err) { console.error("Tank load error"); }
    };

    const handleOpenSetup = (nozzle = null) => {
        if (nozzle) {
            setEditingNozzleId(nozzle.nozzleId);
            setNozzleForm({
                MachineName: nozzle.machineName || "",
                FuelType: nozzle.fuelType || "Petrol",
                TankId: nozzle.tankId || "",
                LabelSideA: nozzle.labelSideA || "Side A",
                LabelSideB: nozzle.labelSideB || "Side B"
            });
        } else {
            setEditingNozzleId(null);
            setNozzleForm({ MachineName: "", FuelType: "Petrol", TankId: "", LabelSideA: "Side A", LabelSideB: "Side B" });
        }
        setShowSetupModal(true);
    };

    const handleSaveMachineConfig = async (e) => {
        e.preventDefault();
        if (!nozzleForm.MachineName || !nozzleForm.TankId) {
            Alerts.error("Missing Info", "Please fill name and select tank.");
            return;
        }

        try {
            if (editingNozzleId) {
                await axios.put(`http://localhost:5241/api/Nozzles/${editingNozzleId}`, { ...nozzleForm, Id: editingNozzleId });
                Alerts.success("Updated", "Machine configuration updated.");
            } else {
                await axios.post("http://localhost:5241/api/Nozzles", nozzleForm);
                Alerts.success("Added", "New machine registered.");
            }
            setShowSetupModal(false);
            loadData();
        } catch (err) { Alerts.error("Error", "Failed to save machine."); }
    };

    const handleDeleteMachine = async (id) => {
        const result = await Alerts.confirmDelete("Remove Machine?", "This will delete the nozzle permanently.");
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5241/api/Nozzles/${id}`);
                Alerts.success("Deleted", "Machine removed.");
                loadData();
            } catch (err) { Alerts.error("Error", "Failed to delete."); }
        }
    };

    const handleReadingChange = (id, field, value) => {
        const updated = machines.map(m => {
            if (m.nozzleId === id) {
                const newVal = { ...m, [field]: value };

                const cA = newVal.closingA !== "" ? parseFloat(newVal.closingA) : m.openingMeterA;
                const cB = newVal.closingB !== "" ? parseFloat(newVal.closingB) : m.openingMeterB;

                // LOGIC TO PREVENT NEGATIVE SALE ON UI
                const diffA = cA - m.openingMeterA;
                const diffB = cB - m.openingMeterB;

                const totalSale = (diffA > 0 ? diffA : 0) + (diffB > 0 ? diffB : 0);

                return {
                    ...newVal,
                    sale: totalSale,
                    amount: totalSale * m.currentRate
                };
            }
            return m;
        });
        setMachines(updated);
        setSaleFormState(prev => ({ ...prev, closingMachines: updated }));
    };

    const handleSave = async (machine) => {
        const cA = machine.closingA !== "" ? parseFloat(machine.closingA) : machine.openingMeterA;
        const cB = machine.closingB !== "" ? parseFloat(machine.closingB) : machine.openingMeterB;

        // Validation Variable
        const calculatedSale = (cA - machine.openingMeterA) + (cB - machine.openingMeterB);

        // 1. STRICT POSITIVE VALIDATION
        if (cA < machine.openingMeterA || cB < machine.openingMeterB) {
            Alerts.error("Reading Error", "Closing meter reading should be positive!");
            return;
        }

        if (calculatedSale <= 0) {
            Alerts.error("Invalid Reading", "Sale cannot be zero or negative.");
            return;
        }

        // 2. STOCK VALIDATION
        const stockAvailable = machine.currentStock || 0;
        if (calculatedSale > stockAvailable) {
            Alerts.error("Stock Error", `Insufficient Stock! Available: ${stockAvailable.toFixed(2)} L.`);
            return;
        }

        const payload = {
            Id: editingId || 0,
            NozzleId: machine.nozzleId,
            OpeningMeter: machine.openingMeterA,
            ClosingMeter: cA,
            OpeningMeterB: machine.openingMeterB,
            ClosingMeterB: cB,
            Date: new Date().toISOString()
        };

        try {
            await axios.post("http://localhost:5241/api/Closing", payload);
            Alerts.success("Saved!", editingId ? "Updated successfully." : "Recorded successfully.");
            setEditingId(null);
            await loadData();
            await loadHistory();
        } catch (error) {
            Alerts.error("Save Failed", "System could not record the entry.");
        }
    };

    const handleDelete = async (id) => {
        const result = await Alerts.confirmDelete("Are you sure?", "This record will be permanently deleted.");
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5241/api/Closing/${id}`);
                Alerts.success("Deleted!", "The record has been removed.");
                await loadHistory();
            } catch (err) { Alerts.error("Delete Failed", "Failed to remove."); }
        }
    };

    const handleEditFromCard = (id) => {
        // Find the last record for this machine from history
        const lastRec = history.find(h => {
            const nozzleId = (h.nozzleId !== undefined) ? h.nozzleId : h.NozzleId;
            return nozzleId === id;
        });

        if (!lastRec) {
            Alerts.warning("No History", "No previous closing record found for this machine.");
            return;
        }

        try {
            setEditingId(lastRec.id || lastRec.Id);
            const updated = machines.map(m => {
                if (m.nozzleId === id) {
                    const cA = lastRec.closingMeter || lastRec.ClosingMeter || 0;
                    const cB = lastRec.closingMeterB || lastRec.ClosingMeterB || 0;
                    const oA = lastRec.openingMeter || lastRec.OpeningMeter || 0;
                    const oB = lastRec.openingMeterB || lastRec.OpeningMeterB || 0;

                    return {
                        ...m,
                        openingMeterA: oA,
                        closingA: cA.toString(),
                        openingMeterB: oB,
                        closingB: cB !== 0 ? cB.toString() : "",
                        sale: (cA - oA) + (cB - oB),
                        amount: ((cA - oA) + (cB - oB)) * m.currentRate
                    };
                }
                return m;
            });
            setMachines(updated);
            setSaleFormState(prev => ({ ...prev, closingMachines: updated }));
        } catch (err) {
            Alerts.error("Error", "Failed to load previous record.");
            console.error("Edit error:", err);
        }
    };

    const getMachineInfo = (id, fuel) => {
        const info = {
            "Petrol": { color: "#ef4444", icon: <FaGasPump /> },
            "Diesel": { color: "#22c55e", icon: <FaGasPump /> },
            "Hi-Octane": { color: "#8b5cf6", icon: <FaGasPump /> },
            "Mobile Oil": { color: "#f59e0b", icon: <FaOilCan /> }
        };
        return info[fuel] || { color: "#001f3f", icon: <FaGasPump /> };
    };

    const renderMachineCard = (m) => {
        const info = getMachineInfo(m.nozzleId, m.fuelType);
        const isEdit = editingId && history.find(h => (h.id || h.Id) === editingId)?.nozzleId === m.nozzleId;

        return (
            <motion.div
                className="main-card p-3 shadow-sm border-top border-5 h-100 position-relative"
                style={{
                    borderTopColor: isEdit ? '#ffc107' : info.color, /* Dynamic Top Border */
                    borderRadius: '15px',
                    background: 'white',
                    paddingTop: '60px' /* Add space for absolute buttons */
                }}
            >
                {/* Corner Docked Action Buttons to prevent overlapping */}
                <div className="position-absolute top-0 end-0 p-2 d-flex gap-1 flex-wrap justify-content-end" style={{ minWidth: 'auto' }}>
                    <button onClick={() => handleOpenSetup(m)} className="btn btn-sm btn-light border-0 shadow-sm p-0 rounded-circle" style={{ width: '28px', height: '28px' }} title="Edit Machine Config">
                        <FaCogs className="text-primary" size={12} />
                    </button>
                    <button onClick={() => handleEditFromCard(m.nozzleId)} className="btn btn-sm btn-light border-0 shadow-sm p-0 rounded-circle" style={{ width: '28px', height: '28px' }} title="Edit Reading">
                        <FaEdit className="text-warning" size={12} />
                    </button>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
                    <h5 className="fw-bold m-0" style={{ fontSize: '1.15rem', minWidth: '150px' }}>{info.icon} {m.machineName}</h5>
                    <span className="badge bg-light text-dark border-0 shadow-sm flex-shrink-0">Rate: {m.currentRate}</span>
                </div>

                <div className="row g-2 mb-3">
                    {/* Side A Input */}
                    <div className={m.fuelType?.includes("Oil") ? "col-12" : "col-6"}>
                        <div className="reading-box mb-2">
                            <small className="fw-bold text-muted d-block text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>{m.labelSideA}</small>
                            <span className="fw-bold text-navy" style={{ fontSize: '14px' }}>{m.openingMeterA}</span>
                        </div>
                        <input
                            type="number"
                            className="form-control text-center fw-bold border-2"
                            style={{ borderColor: '#001f3f', height: '48px', fontSize: '1.1rem' }}
                            placeholder="Close"
                            value={m.closingA}
                            onChange={(e) => handleReadingChange(m.nozzleId, 'closingA', e.target.value)}
                        />
                    </div>

                    {/* Side B Input (Hidden for single-nozzle types like Oil) */}
                    {!m.fuelType?.includes("Oil") && (
                        <div className="col-6">
                            <div className="reading-box mb-2">
                                <small className="fw-bold text-muted d-block text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>{m.labelSideB}</small>
                                <span className="fw-bold text-navy" style={{ fontSize: '14px' }}>{m.openingMeterB}</span>
                            </div>
                            <input
                                type="number"
                                className="form-control text-center fw-bold border-2"
                                style={{ borderColor: '#001f3f', height: '48px', fontSize: '1.1rem' }}
                                placeholder="Close"
                                value={m.closingB}
                                onChange={(e) => handleReadingChange(m.nozzleId, 'closingB', e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Sales Summary Area */}
                <div className="p-2 rounded mb-3" style={{ backgroundColor: '#f8fafc', borderLeft: `4px solid ${info.color}` }}>
                    <div className="d-flex justify-content-between small px-1">
                        <span className="text-muted fw-bold uppercase" style={{ fontSize: '10px' }}>Liters Sold:</span>
                        <span className="fw-bold text-dark">{m.sale.toFixed(2)} L</span>
                    </div>
                    <div className="d-flex justify-content-between mt-1 px-1">
                        <span className="text-muted fw-bold uppercase" style={{ fontSize: '10px' }}>Total Bill:</span>
                        <span className="fw-bold text-success">Rs {m.amount.toLocaleString()}</span>
                    </div>
                </div>

                <button
                    className={`btn w-100 fw-bold py-2 shadow-sm ${isEdit ? 'btn-warning' : 'btn-primary'}`}
                    style={!isEdit ? { backgroundColor: '#001f3f', border: 'none' } : {}}
                    onClick={() => handleSave(m)}
                >
                    <FaSave className="me-2" /> {isEdit ? "Update Reading" : "Save Closing"}
                </button>
            </motion.div>
        );
    };

    return (
        <div className="container-fluid py-4 bg-light" style={{ minHeight: '100vh' }}>
            <style>{`
    /* --- SHARED STYLES --- */
    .glass-card { 
        background: white; 
        border-radius: 15px; 
        border: 1px solid #e2e8f0; 
    }
    
    .admin-table thead th { 
        background: #0f172a !important; 
        color: white !important; 
        font-size: 11px; 
        text-transform: uppercase; 
        padding: 16px; 
        text-align: center; 
    }
    
    .admin-table tbody td { 
        padding: 14px; 
        text-align: center; 
        border-bottom: 1px solid #f1f5f9; 
        font-size: 13px; 
    }

    .reading-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px;
        text-align: center;
    }

    /* --- HORIZONTAL SWIPE FOR MOBILE --- */
    .machine-scroll-container {
        display: flex;
        gap: 15px;
        overflow-x: auto; /* Enable side-swipe */
        padding: 10px 5px 25px 5px;
        scrollbar-width: none; /* Hide scrollbar Firefox */
        -ms-overflow-style: none; /* Hide scrollbar IE/Edge */
    }

    /* Hide scrollbar for Chrome/Safari */
    .machine-scroll-container::-webkit-scrollbar {
        display: none; 
    }

    /* Mobile Card Width */
    .machine-item {
        min-width: 85vw;
        flex: 0 0 auto; 
    }

    /* --- RESPONSIVE CARD ADJUSTMENTS --- */
    @media (max-width: 576px) {
        .main-card {
            padding-top: 48px !important;
        }
    }

    @media (min-width: 577px) and (max-width: 991px) {
        .main-card {
            padding-top: 55px !important;
        }
    }

    /* Desktop Grid: Revert to 3 columns */
    @media (min-width: 992px) {
        .machine-scroll-container {
            overflow-x: visible;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }
        .machine-item {
            min-width: auto; 
        }
        .main-card {
            padding-top: 60px !important;
        }
    }

    /* Extra large screens */
    @media (min-width: 1400px) {
        .machine-scroll-container {
            grid-template-columns: repeat(4, 1fr);
        }
    }
`}</style>

            {/* HEADER BAR: UPDATED TO NAVY BLUE */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 p-3 rounded shadow-sm border"
                style={{ backgroundColor: '#001f3f', border: 'none' }}>

                <h3 className="fw-bold m-0 text-white">Machine Closing</h3>

                <div className="d-flex gap-2 mt-2 mt-md-0">
                    {/* New Machine Button: Blue to match Navy theme */}
                    <button
                        className="btn btn-primary fw-bold px-3 shadow-sm border-0"
                        style={{ backgroundColor: '#625d5d69' }}
                        onClick={() => handleOpenSetup()}
                    >
                        <FaPlus className="me-2" /> New Machine
                    </button>

                    {/* View Logs Button: Light/White for high contrast */}
                    <button
                        className="btn btn-light fw-bold px-4 shadow-sm text-dark border-0"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? (
                            <><FaSave className="me-2" /> Back to Entry</>
                        ) : (
                            <><FaHistory className="me-2" /> View Logs</>
                        )}
                    </button>
                </div>
            </div>

            {!showHistory ? (
                <>
                    {machines.length === 0 ? (
                        <div className="text-center p-5 bg-white rounded shadow-sm border">
                            <FaGasPump size={50} className="text-muted mb-3" />
                            <h4>No Machines Found</h4>
                            <p className="text-muted">Register your fuel nozzles to start recording sales.</p>
                            <button className="btn btn-primary px-4" onClick={() => handleOpenSetup()}>Create First Machine</button>
                        </div>
                    ) : (
                        <div className="row g-4 mb-4">
                            {machines.map(m => (
                                <div key={m.nozzleId} className="col-lg-4">{renderMachineCard(m)}</div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded shadow-sm border overflow-hidden">
                    <div className="table-responsive">
                        <table className="table admin-table m-0">
                            <thead>
                                <tr><th>S.No</th><th>Date</th><th>Machine</th><th>Side A</th><th>Side B</th><th>Total</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr><td colSpan="7" className="py-5 text-muted">No closing history found.</td></tr>
                                ) : (
                                    history.map((h, i) => (
                                        <tr key={i}>
                                            <td className="fw-bold">{i + 1}</td>
                                            <td>{new Date(h.date).toLocaleDateString()}</td>
                                            <td>{h.machineName || 'Fuel'}</td>
                                            <td>{h.openingMeter} ➔ {h.closingMeter}</td>
                                            <td>{h.openingMeterB} ➔ {h.closingMeterB}</td>
                                            <td className="fw-bold text-success">{(h.closingMeter - h.openingMeter + h.closingMeterB - h.openingMeterB).toFixed(2)} L</td>
                                            <td><button className="btn btn-sm text-danger" onClick={() => handleDelete(h.id)}><FaTrash /></button></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {showSetupModal && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="fw-bold">{editingNozzleId ? <FaEdit className="me-2 text-warning" /> : <FaPlus className="me-2 text-primary" />} {editingNozzleId ? "Edit Machine" : "Register Machine"}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowSetupModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSaveMachineConfig}>
                                        <div className="mb-3">
                                            <label className="small fw-bold">MACHINE NAME</label>
                                            <input type="text" className="form-control" placeholder="e.g. Machine 1" value={nozzleForm.MachineName} onChange={e => setNozzleForm({ ...nozzleForm, MachineName: e.target.value })} />
                                        </div>
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <label className="small fw-bold">FUEL TYPE</label>
                                                <select className="form-select" value={nozzleForm.FuelType} onChange={e => setNozzleForm({ ...nozzleForm, FuelType: e.target.value })}>
                                                    <option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Hi-Octane">Hi-Octane</option><option value="Mobile Oil">Mobile Oil</option>
                                                </select>
                                            </div>
                                            <div className="col-6">
                                                <label className="small fw-bold">SOURCE TANK</label>
                                                <select className="form-select border-primary" value={nozzleForm.TankId} onChange={e => setNozzleForm({ ...nozzleForm, TankId: e.target.value })}>
                                                    <option value="">-- Select --</option>
                                                    {tanks.map(t => <option key={t.id} value={t.id}>{t.tankName}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="row g-2 mb-4">
                                            <div className="col-6">
                                                <label className="small fw-bold">LABEL SIDE A</label>
                                                <input type="text" className="form-control" value={nozzleForm.LabelSideA} onChange={e => setNozzleForm({ ...nozzleForm, LabelSideA: e.target.value })} />
                                            </div>
                                            <div className="col-6">
                                                <label className="small fw-bold">LABEL SIDE B</label>
                                                <input type="text" className="form-control" value={nozzleForm.LabelSideB} onChange={e => setNozzleForm({ ...nozzleForm, LabelSideB: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            {editingNozzleId && <button type="button" className="btn btn-danger px-3" onClick={() => { setShowSetupModal(false); handleDeleteMachine(editingNozzleId); }}><FaTrash /></button>}
                                            <button className="btn btn-primary flex-grow-1 fw-bold py-2 shadow-sm" style={{ backgroundColor: '#001f3f' }}>
                                                <FaSave className="me-2" /> Save Configuration
                                            </button>
                                        </div>
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

export default DailyClosing;