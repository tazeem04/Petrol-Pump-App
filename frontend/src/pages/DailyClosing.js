import { useEffect, useState } from "react";
import axios from "axios";

function DailyClosing() {
    const [machines, setMachines] = useState([]);
    
    // Inputs structure: { 1: { closeA: 100, closeB: 200 }, ... }
    const [inputs, setInputs] = useState({});
    const [message, setMessage] = useState("");

    // 1. Data Load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        axios.get("http://localhost:5241/api/closing/formdata")
            .then(res => {
                setMachines(res.data);
                setInputs({});
            })
            .catch(err => console.error(err));
    };

    // 2. Input Change Handler
    const handleInputChange = (nozzleId, side, value) => {
        setInputs(prev => ({
            ...prev,
            [nozzleId]: {
                ...prev[nozzleId],
                [side]: value
            }
        }));
    };

    // 3. Save Function
    const handleSave = async (m) => {
        const userIn = inputs[m.nozzleId] || {};
        
        // Agar Side A khali hai to purani reading utha lo
        const closeA = userIn.closeA ? parseFloat(userIn.closeA) : m.openingMeterA;
        
        // Agar Side B khali hai (ya chhupi hui hai) to purani reading utha lo (taake difference 0 aye)
        const closeB = userIn.closeB ? parseFloat(userIn.closeB) : m.openingMeterB;

        // Validation
        if (closeA < m.openingMeterA || closeB < m.openingMeterB) {
            alert("❌ Error: Reading purani reading se kam nahi ho sakti!");
            return;
        }

        try {
            const payload = {
                nozzleId: m.nozzleId,
                openingMeter: m.openingMeterA,
                closingMeter: closeA,       
                openingMeterB: m.openingMeterB,
                closingMeterB: closeB       
            };

            await axios.post("http://localhost:5241/api/closing", payload);
            setMessage(`✅ ${m.machineName} Saved Successfully!`);
            loadData(); 
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4 fw-bold text-primary">📊 Daily Meter Closing</h2>
            
            {message && <div className="alert alert-success text-center">{message}</div>}

            <div className="row">
                {machines.map(m => {
                    const userIn = inputs[m.nozzleId] || {};
                    const isMobileOil = m.fuelType === "Mobile Oil"; // <-- YAHAN CHECK LAGA DIYA

                    // Calculation Logic
                    const closeA = userIn.closeA ? parseFloat(userIn.closeA) : m.openingMeterA;
                    const closeB = userIn.closeB ? parseFloat(userIn.closeB) : m.openingMeterB;
                    
                    const saleA = closeA - m.openingMeterA;
                    const saleB = closeB - m.openingMeterB;
                    const totalLiters = (saleA + saleB).toFixed(1);
                    const totalRupees = (totalLiters * m.currentRate).toFixed(0);

                    return (
                        <div key={m.nozzleId} className="col-lg-6 mb-4">
                            <div className="card shadow h-100 border-0">
                                <div className={`card-header text-white d-flex justify-content-between align-items-center ${isMobileOil ? "bg-warning" : "bg-dark"}`}>
                                    <h5 className={`m-0 ${isMobileOil ? "text-dark" : "text-warning"}`}>{m.machineName}</h5>
                                    <span className="badge bg-secondary">{m.fuelType}</span>
                                </div>
                                <div className="card-body bg-light">
                                    
                                    {/* --- SIDE A (Ye Sab k liye show hoga) --- */}
                                    <div className="row mb-2 align-items-center">
                                        <div className="col-3 fw-bold text-muted">
                                            {isMobileOil ? "READING" : "LEFT SIDE"}
                                        </div>
                                        <div className="col-4">
                                            <small>Old:</small> <span className="fw-bold">{m.openingMeterA}</span>
                                        </div>
                                        <div className="col-5">
                                            <input type="number" className="form-control border-primary" placeholder="New Reading"
                                                value={userIn.closeA || ""}
                                                onChange={(e) => handleInputChange(m.nozzleId, 'closeA', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* --- SIDE B (Agar Mobile Oil hai to ye CHHUP jaye ga) --- */}
                                    {!isMobileOil && (
                                        <div className="row mb-3 align-items-center">
                                            <div className="col-3 fw-bold text-muted">RIGHT SIDE</div>
                                            <div className="col-4">
                                                <small>Old:</small> <span className="fw-bold">{m.openingMeterB}</span>
                                            </div>
                                            <div className="col-5">
                                                <input type="number" className="form-control border-primary" placeholder="New Reading"
                                                    value={userIn.closeB || ""}
                                                    onChange={(e) => handleInputChange(m.nozzleId, 'closeB', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <hr />

                                    {/* --- TOTALS --- */}
                                    <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                                        {/* Sirf tab dikhao agar Single Side na ho */}
                                        {!isMobileOil && (
                                            <>
                                                <div className="text-center">
                                                    <small className="text-muted d-block">Diff (A)</small>
                                                    <span className="fw-bold text-primary">{saleA.toFixed(1)}</span>
                                                </div>
                                                <div className="text-center">
                                                    <small className="text-muted d-block">Diff (B)</small>
                                                    <span className="fw-bold text-primary">{saleB.toFixed(1)}</span>
                                                </div>
                                            </>
                                        )}
                                        
                                        <div className={`text-center ${!isMobileOil ? "border-start ps-3" : "w-100"}`}>
                                            <small className="text-muted d-block">Total Sold</small>
                                            <h4 className="fw-bold text-success mb-0">{totalLiters}</h4>
                                        </div>
                                    </div>

                                    <div className="alert alert-info py-2 d-flex justify-content-between align-items-center">
                                        <span>Total Cash:</span>
                                        <span className="fw-bold fs-5">Rs {totalRupees}</span>
                                    </div>

                                    <button className={`btn w-100 fw-bold ${isMobileOil ? "btn-warning" : "btn-dark"}`} onClick={() => handleSave(m)}>
                                        Save Closing
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default DailyClosing;