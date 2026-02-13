import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaGasPump, FaSave, FaUserPlus, FaTimes, FaPhone, FaTruck, FaTrash, FaEdit } from "react-icons/fa";
import { AppContext } from "../context/AppContext"; 
import Alerts from '../utils/Alerts'; 

function SaleEntry({ customerId, hideSelection, onSaved }) {
    const { saleFormState, setSaleFormState } = useContext(AppContext);

    const [customers, setCustomers] = useState([]);
    const [nozzles, setNozzles] = useState([]);
    const [rates, setRates] = useState({});
    const [recentSales, setRecentSales] = useState([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5241/api/sales/formdata")
            .then(res => {
                setCustomers(res.data.customers);
                setNozzles(res.data.nozzles);
                const rateMap = {};
                res.data.rates.forEach(r => rateMap[r.fuelType] = r.currentPrice);
                setRates(rateMap);
            })
            .catch(() => Alerts.error("Data Error", "Could not load form data."));
    }, []);

    useEffect(() => {
        fetchRecentSales();
        if (customerId && !saleFormState.selectedCustomer) {
            updateGlobalState("selectedCustomer", customerId);
        }
    }, [customerId, saleFormState.selectedCustomer]);

    const fetchRecentSales = async () => {
        try {
            const url = customerId
                ? `http://localhost:5241/api/report/ledger/${customerId}`
                : `http://localhost:5241/api/sales/recent`;
            const res = await axios.get(url);
            const salesOnly = customerId ? res.data.filter(x => x.type === 'Sale').slice(0, 10) : res.data;
            setRecentSales(salesOnly);
        } catch (e) { console.log("Sales load error"); }
    };

    const updateGlobalState = (field, value) => {
        setSaleFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleCalculation = (fuelType, field, value) => {
        const rate = rates[fuelType] || 0;
        let fuelData = { ...saleFormState.entries[fuelType], [field]: value };

        if (rate > 0 && value) {
            if (field === "quantity") {
                fuelData.amount = (parseFloat(value) * rate).toFixed(0);
            } else if (field === "amount") {
                fuelData.quantity = (parseFloat(value) / rate).toFixed(2);
            }
        } else if (!value) {
            fuelData.quantity = ""; fuelData.amount = "";
        }

        setSaleFormState(prev => ({
            ...prev,
            entries: { ...prev.entries, [fuelType]: fuelData }
        }));
    };

    const toggleFuel = (fuelType) => {
        const fuelData = { 
            ...saleFormState.entries[fuelType], 
            active: !saleFormState.entries[fuelType].active 
        };
        setSaleFormState(prev => ({
            ...prev,
            entries: { ...prev.entries, [fuelType]: fuelData }
        }));
    };

    const handleQuickAdd = async () => {
        if (!newCustomerName) { Alerts.error("Missing Info", "Customer name is required."); return; }
        try {
            const res = await axios.post("http://localhost:5241/api/customers", {
                name: newCustomerName, phone: newCustomerPhone, currentBalance: 0
            });
            setCustomers([...customers, res.data]);
            updateGlobalState("selectedCustomer", res.data.id);
            setIsAddingNew(false);
            setNewCustomerName(""); setNewCustomerPhone("");
            Alerts.success("Success", "New customer added.");
        } catch (error) { Alerts.error("Error", "Failed to add customer."); }
    };

    const handleEditClick = (sale) => {
        const sId = sale.id || sale.Id || sale.saleId;
        if (!sId) { Alerts.error("Error", "Sale ID not found."); return; }

        let vNum = ""; let pNum = "";
        const rawV = sale.vehicleNumber || "";
        if (rawV.includes(" (Ph: ")) {
            const parts = rawV.split(" (Ph: ");
            vNum = parts[0];
            pNum = parts[1]?.replace(")", "") || "";
        } else { vNum = rawV; }

        const nId = sale.nozzleId || sale.NozzleId;
        const desc = sale.description || "";
        let fuelName = "Petrol";
        if (nId === 6 || desc.includes("Petrol")) fuelName = "Petrol";
        else if (nId === 7 || desc.includes("Diesel")) fuelName = "Diesel";
        else if (nId === 8 || desc.includes("Mobile Oil")) fuelName = "Mobile Oil";
        else if (nId === 4 || desc.includes("Hi-Octane")) fuelName = "Hi-Octane";

        const newEntries = {
            Petrol: { active: false, quantity: "", amount: "" },
            Diesel: { active: false, quantity: "", amount: "" },
            "Mobile Oil": { active: false, quantity: "", amount: "" },
            "Hi-Octane": { active: false, quantity: "", amount: "" }
        };

        newEntries[fuelName] = {
            active: true,
            quantity: sale.quantity || (sale.debit / (rates[fuelName] || 1)).toFixed(2),
            amount: sale.totalAmount || sale.debit || ""
        };

        setSaleFormState({
            editMode: true,
            editingSaleId: sId,
            selectedCustomer: sale.customerId || sale.CustomerId,
            vehicleNumber: vNum,
            phoneNumber: pNum,
            entries: newEntries
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteSale = async (id) => {
        const result = await Alerts.confirmDelete("Are you sure?", "Delete permanently?");
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5241/api/sales/${id}`);
                Alerts.success("Deleted!", "Record removed.");
                fetchRecentSales();
                if (onSaved) onSaved();
            } catch (err) { Alerts.error("Error", "Failed to delete."); }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!saleFormState.selectedCustomer) { Alerts.error("Selection Required", "Select customer."); return; }

        const vehicleInfo = saleFormState.vehicleNumber + (saleFormState.phoneNumber ? ` (Ph: ${saleFormState.phoneNumber})` : "");

        try {
            if (saleFormState.editMode) {
                const activeFuel = Object.keys(saleFormState.entries).find(f => saleFormState.entries[f].active);
                const nozzle = nozzles.find(n => n.fuelType === activeFuel);

                await axios.put(`http://localhost:5241/api/sales/${saleFormState.editingSaleId}`, {
                    id: saleFormState.editingSaleId,
                    customerId: Number(saleFormState.selectedCustomer),
                    vehicleNumber: vehicleInfo,
                    nozzleId: nozzle.id,
                    quantity: Number(saleFormState.entries[activeFuel].quantity),
                    totalAmount: Number(saleFormState.entries[activeFuel].amount),
                    isCredit: true
                });
                Alerts.success("Updated", "Entry updated.");
            } else {
                let anyActive = false;
                for (const data of Object.values(saleFormState.entries)) {
                    if (data.active && Number(data.quantity) > 0) anyActive = true;
                }
                if(!anyActive) { Alerts.error("Invalid", "Enter quantity."); return; }

                for (const [fuelType, data] of Object.entries(saleFormState.entries)) {
                    if (data.active && Number(data.quantity) > 0) {
                        const nozzle = nozzles.find(n => n.fuelType === fuelType);
                        await axios.post("http://localhost:5241/api/sales", {
                            customerId: Number(saleFormState.selectedCustomer),
                            vehicleNumber: vehicleInfo,
                            nozzleId: nozzle.id,
                            quantity: Number(data.quantity),
                            totalAmount: Number(data.amount),
                            isCredit: true
                        });
                    }
                }
                Alerts.success("Saved", "Sale recorded.");
            }

            const freshData = await axios.get("http://localhost:5241/api/sales/formdata");
            setNozzles(freshData.data.nozzles);
            fetchRecentSales();
            
            setSaleFormState({
                editMode: false, editingSaleId: null, selectedCustomer: customerId || "",
                vehicleNumber: "", phoneNumber: "",
                entries: {
                    Petrol: { active: false, quantity: "", amount: "" },
                    Diesel: { active: false, quantity: "", amount: "" },
                    "Mobile Oil": { active: false, quantity: "", amount: "" },
                    "Hi-Octane": { active: false, quantity: "", amount: "" }
                }
            });
            if (onSaved) onSaved();
        } catch (error) { Alerts.error("Error", error.response?.data?.message || "Action Failed"); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`d-flex flex-column align-items-center ${!hideSelection ? 'py-5' : 'p-2'}`}>
            <style>{`
                .navy-theme-btn { background: #001f3f !important; color: white !important; border: none; }
                .navy-theme-btn:hover { background: #003366 !important; }
                .sale-card-main { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e0e0e0; }
                .fuel-row-active { border-left: 4px solid #001f3f !important; background-color: #fcfdfe !important; }
                
                /* FORCED GRID CLASSES */
                .grid-row-custom { display: flex !important; gap: 15px !important; width: 100% !important; margin-bottom: 15px !important; }
                .grid-col-custom { flex: 1 !important; }
            `}</style>

            <div className={`sale-card-main ${!hideSelection ? 'p-4 p-md-5' : 'p-3'}`} style={{ width: "100%", maxWidth: "850px" }}>
                {!hideSelection && (
                    <div className="text-center mb-5">
                        <div className="d-inline-flex p-3 mb-3 rounded-circle" style={{ background: '#001f3f' }}>
                            <FaGasPump size={30} color="white" />
                        </div>
                        <h2 className="fw-bold" style={{ color: '#001f3f' }}>{saleFormState.editMode ? "Update Transaction" : "New Sale Entry"}</h2>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* CUSTOMER SELECTION (Only if not in profile) */}
                    {!hideSelection && (
                        <div className="mb-4 p-3 rounded-3 border bg-light">
                            <label className="fw-bold text-secondary small uppercase mb-2">CUSTOMER</label>
                            <div className="grid-row-custom">
                                <div className="grid-col-custom">
                                    {isAddingNew ? (
                                        <div className="d-flex gap-2">
                                            <input type="text" className="form-control" placeholder="Name" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
                                            <input type="text" className="form-control" placeholder="Phone" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} />
                                            <button className="btn btn-success" onClick={handleQuickAdd}><FaSave /></button>
                                            <button className="btn btn-secondary" onClick={() => setIsAddingNew(false)}><FaTimes /></button>
                                        </div>
                                    ) : (
                                        <select className="form-select border-2" value={saleFormState.selectedCustomer} onChange={e => updateGlobalState("selectedCustomer", e.target.value)} disabled={saleFormState.editMode}>
                                            <option value="">-- Choose Customer --</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                {!isAddingNew && !saleFormState.editMode && (
                                    <button type="button" className="btn btn-outline-primary fw-bold px-3" onClick={() => setIsAddingNew(true)}>
                                        <FaUserPlus />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TWO INPUTS: VEHICLE NO & PHONE (SAME LINE) */}
                    <div className="grid-row-custom">
                        <div className="grid-col-custom">
                            <label className="fw-bold text-muted small mb-1"><FaTruck /> VEHICLE NO</label>
                            <input type="text" className="form-control" placeholder="LEA-1234" value={saleFormState.vehicleNumber} onChange={e => updateGlobalState("vehicleNumber", e.target.value)} />
                        </div>
                        <div className="grid-col-custom">
                            <label className="fw-bold text-muted small mb-1"><FaPhone /> DRIVER PHONE</label>
                            <input type="text" className="form-control" placeholder="03xx-xxxxxxx" value={saleFormState.phoneNumber} onChange={e => updateGlobalState("phoneNumber", e.target.value)} />
                        </div>
                    </div>

                    {/* FUEL ENTRIES (Ltr & Rs on SAME LINE) */}
                    <div className="d-flex flex-column gap-2 mt-3">
                        {Object.keys(saleFormState.entries).map(fuel => (
                            <div key={fuel} className={`p-2 px-3 rounded-3 border ${saleFormState.entries[fuel].active ? "fuel-row-active" : "bg-white"}`}>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center" style={{ minWidth: "120px" }}>
                                        <input className="form-check-input me-2" type="checkbox" checked={saleFormState.entries[fuel].active} onChange={() => toggleFuel(fuel)} id={fuel} />
                                        <label className="fw-bold m-0 small" htmlFor={fuel}>{fuel}</label>
                                    </div>
                                    
                                    {saleFormState.entries[fuel].active && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex gap-2 flex-grow-1 ms-3">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-light small">Ltr</span>
                                                <input type="number" className="form-control fw-bold" value={saleFormState.entries[fuel].quantity} onChange={(e) => handleCalculation(fuel, "quantity", e.target.value)} />
                                            </div>
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-light small">Rs</span>
                                                <input type="number" className="form-control fw-bold text-success" value={saleFormState.entries[fuel].amount} onChange={(e) => handleCalculation(fuel, "amount", e.target.value)} />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="btn navy-theme-btn w-100 mt-4 py-3 fw-bold text-uppercase shadow-sm">
                         {saleFormState.editMode ? "Confirm Update" : "Record Transaction"}
                    </button>
                    {saleFormState.editMode && (
                        <button type="button" className="btn btn-link w-100 text-muted" onClick={() => setSaleFormState({
                            ...saleFormState, editMode: false, editingSaleId: null, vehicleNumber: "", phoneNumber: "",
                            entries: { Petrol: { active: false }, Diesel: { active: false }, "Mobile Oil": { active: false }, "Hi-Octane": { active: false } } 
                        })}>Cancel Edit</button>
                    )}
                </form>

                {/* RECENT SALES TABLE */}
                <div className="mt-5 pt-3 border-top">
                    <h6 className="fw-bold text-muted mb-2 text-uppercase small">Recent Sales</h6>
                    <div className="table-responsive rounded border bg-white shadow-sm">
                        <table className="table table-sm table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="small text-muted">
                                    <th>#</th><th>VEHICLE</th><th>FUEL</th><th>AMOUNT</th><th className="text-end">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.map((sale, index) => (
                                    <tr key={sale.id || index}>
                                        <td className="small text-muted">{index + 1}</td>
                                        <td className="small fw-bold">{sale.vehicleNumber?.split(" (")[0] || "N/A"}</td>
                                        <td className="small">{sale.nozzle?.fuelType || "Petrol"}</td>
                                        <td className="small text-success fw-bold">Rs {(sale.totalAmount || sale.debit).toLocaleString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm text-primary p-1 border-0" onClick={() => handleEditClick(sale)}><FaEdit /></button>
                                            <button className="btn btn-sm text-danger p-1 border-0" onClick={() => handleDeleteSale(sale.id || sale.Id)}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default SaleEntry;