import { useEffect, useState } from "react";
import axios from "axios";

function SaleEntry() {
    // --- Data States ---
    const [customers, setCustomers] = useState([]);
    const [nozzles, setNozzles] = useState([]);
    const [rates, setRates] = useState({}); 

    // --- Form Inputs ---
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [phoneNumber, setPhoneNumber] = useState(""); 
    const [message, setMessage] = useState("");

    // --- New Customer "Quick Add" States ---
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");

    // --- Cart Items ---
    const [entries, setEntries] = useState({
        Petrol: { active: false, quantity: "", amount: "" },
        Diesel: { active: false, quantity: "", amount: "" },
        "Mobile Oil": { active: false, quantity: "", amount: "" },
        "Hi-Octane": { active: false, quantity: "", amount: "" }
    });

    // 1. Load Data
    useEffect(() => {
        axios.get("http://localhost:5241/api/sales/formdata")
            .then(res => {
                setCustomers(res.data.customers);
                setNozzles(res.data.nozzles);
                const rateMap = {};
                res.data.rates.forEach(r => rateMap[r.fuelType] = r.currentPrice);
                setRates(rateMap);
            })
            .catch(err => console.error("Data Load Error:", err));
    }, []);

    // 2. Calculation Logic
    const handleCalculation = (fuelType, field, value) => {
        const rate = rates[fuelType] || 0;
        let newData = { ...entries[fuelType], [field]: value };

        if (rate > 0 && value) {
            if (field === "quantity") {
                newData.amount = (parseFloat(value) * rate).toFixed(0);
            } else if (field === "amount") {
                newData.quantity = (parseFloat(value) / rate).toFixed(2);
            }
        } else if (!value) {
            newData.quantity = "";
            newData.amount = "";
        }
        setEntries({ ...entries, [fuelType]: newData });
    };

    const toggleFuel = (fuelType) => {
        setEntries({
            ...entries,
            [fuelType]: { ...entries[fuelType], active: !entries[fuelType].active }
        });
    };

    // 3. --- NEW FUNCTION: Quick Add Customer ---
    const handleQuickAdd = async () => {
        if (!newCustomerName) { alert("Naam likhna zaroori hai!"); return; }

        try {
            const res = await axios.post("http://localhost:5241/api/customers", {
                name: newCustomerName,
                phone: newCustomerPhone,
                currentBalance: 0
            });

            // List update karo
            const updatedList = [...customers, res.data];
            setCustomers(updatedList);
            
            // Naye customer ko select kar lo
            setSelectedCustomer(res.data.id);
            
            // Form band karo
            setIsAddingNew(false);
            setNewCustomerName("");
            setNewCustomerPhone("");
            setMessage("✅ New Customer Added!");
        } catch (error) {
            alert("Error adding customer: " + error.message);
        }
    };

    // 4. Save Sale
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!selectedCustomer) { setMessage("❌ Customer Select Karein!"); return; }

        const vehicleInfo = vehicleNumber + (phoneNumber ? ` (Ph: ${phoneNumber})` : "");

        try {
            let savedCount = 0;
            for (const [fuelType, data] of Object.entries(entries)) {
                if (data.active && data.quantity > 0) {
                    const nozzle = nozzles.find(n => n.fuelType === fuelType);
                    if (!nozzle) {
                        alert(`❌ Error: ${fuelType} ki koi machine nahi hai!`);
                        continue;
                    }

                    const saleData = {
                        customerId: Number(selectedCustomer),
                        vehicleNumber: vehicleInfo,
                        nozzleId: nozzle.id,
                        quantity: Number(data.quantity),
                        isCredit: true
                    };

                    await axios.post("http://localhost:5241/api/sales", saleData);
                    savedCount++;
                }
            }

            if (savedCount > 0) {
                setMessage("✅ Udhaar Saved Successfully!");
                setVehicleNumber("");
                setPhoneNumber("");
                // Form Reset (Active status wahi rakhen taake bar bar click na karna pare)
                setEntries({
                    Petrol: { active: false, quantity: "", amount: "" },
                    Diesel: { active: false, quantity: "", amount: "" },
                    "Mobile Oil": { active: false, quantity: "", amount: "" },
                    "Hi-Octane": { active: false, quantity: "", amount: "" }
                });
            } else {
                setMessage("❌ Koi Item Select Nahi Kiya!");
            }

        } catch (error) {
            setMessage("❌ Error: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="card shadow p-4" style={{ width: "600px", borderTop: "6px solid #dc3545", borderRadius: "15px" }}>
                
                <h2 className="text-center text-danger fw-bold mb-4">📕 Udhaar / Credit Entry</h2>
                
                {message && <div className={`alert ${message.includes("Error") ? "alert-danger" : "alert-success"}`}>{message}</div>}

                {/* --- CUSTOMER SECTION --- */}
                <div className="mb-3 bg-light p-3 rounded border">
                    <label className="form-label fw-bold">Select Customer (Khata)</label>

                    {isAddingNew ? (
                        <div className="d-flex gap-2 mb-2">
                            <input type="text" className="form-control" placeholder="New Name" 
                                value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
                            <input type="text" className="form-control" placeholder="Phone" 
                                value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} />
                            <button type="button" className="btn btn-success" onClick={handleQuickAdd}>Save</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsAddingNew(false)}>X</button>
                        </div>
                    ) : (
                        <div className="input-group">
                            <select className="form-select border-danger" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                                <option value="">-- Customer Select Karein --</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button className="btn btn-outline-primary" type="button" onClick={() => setIsAddingNew(true)}>
                                + New Customer
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Vehicle No (Gari No)</label>
                            <input type="text" className="form-control" placeholder="LEA-123" 
                                value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Driver Phone No</label>
                            <input type="text" className="form-control" placeholder="0300-1234567" 
                                value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                        </div>
                    </div>

                    <hr className="text-muted" />

                    {/* --- Fuel Items (Updated to show Machine Name) --- */}
                    <h5 className="mb-3 text-secondary">Items Select Karein:</h5>
                    
                    {Object.keys(entries).map(fuel => {
                        // Yahan hum Machine ka naam dhoond rahe hain
                        const nozzle = nozzles.find(n => n.fuelType === fuel);
                        const machineName = nozzle ? nozzle.machineName : ""; // e.g. "Machine 1"

                        return (
                            <div key={fuel} className={`mb-3 p-2 rounded ${entries[fuel].active ? "bg-light border border-warning" : ""}`}>
                                <div className="d-flex align-items-center">
                                    <div className="form-check me-3" style={{ minWidth: "220px" }}> {/* Width barha di */}
                                        <input className="form-check-input" type="checkbox" 
                                            checked={entries[fuel].active} onChange={() => toggleFuel(fuel)} 
                                            id={fuel} style={{ transform: "scale(1.2)" }}
                                        />
                                        <label className="form-check-label fw-bold ms-2" htmlFor={fuel}>
                                            {fuel} <span className="text-muted small">({machineName})</span>
                                        </label>
                                        <div style={{ fontSize: "12px", color: "gray", marginLeft: "8px" }}>Rate: {rates[fuel] || 0}</div>
                                    </div>

                                    {entries[fuel].active && (
                                        <div className="d-flex gap-2 w-100">
                                            <div className="input-group">
                                                <span className="input-group-text bg-white">Liters</span>
                                                <input type="number" className="form-control" placeholder="0" 
                                                    value={entries[fuel].quantity} onChange={(e) => handleCalculation(fuel, "quantity", e.target.value)} 
                                                />
                                            </div>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white">Rs</span>
                                                <input type="number" className="form-control" placeholder="Amount" 
                                                    value={entries[fuel].amount} onChange={(e) => handleCalculation(fuel, "amount", e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <button type="submit" className="btn btn-danger w-100 btn-lg mt-3 fw-bold shadow-sm">
                        Save Udhaar Entry
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SaleEntry;