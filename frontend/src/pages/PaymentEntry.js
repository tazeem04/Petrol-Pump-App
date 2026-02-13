import { useEffect, useState } from "react";
import axios from "axios";
import { FaMoneyBillWave, FaSave, FaCalendarAlt, FaTrash, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";
import Alerts from '../utils/Alerts'; // Central Utility Import

function PaymentEntry({ customerId, hideSelection, onSaved }) {
    const [customers, setCustomers] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(customerId || "");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("Cash Received");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (!hideSelection) {
            axios.get("http://localhost:5241/api/payment/customers").then(res => setCustomers(res.data));
        }
        fetchRecent();
        if (customerId) setSelectedCustomer(customerId);
    }, [customerId, hideSelection]);

    const fetchRecent = async () => {
        try {
            const url = customerId ? `http://localhost:5241/api/report/ledger/${customerId}` : `http://localhost:5241/api/payment/recent`;
            const res = await axios.get(url);
            const data = customerId ? res.data.filter(x => x.type === 'Payment').slice(0, 10) : res.data;
            setRecentPayments(data);
        } catch (e) { console.log("Load error"); }
    };

    const handleEdit = (p) => {
        setEditMode(true);
        setEditingId(p.id || p.Id);
        setSelectedCustomer(p.customerId || p.CustomerId);
        setAmount(p.amount || p.credit || 0);
        setNote(p.description || "");
        const rawDate = p.paymentDate || p.date || new Date().toISOString();
        setDate(new Date(rawDate).toISOString().split('T')[0]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- PROFESSIONAL DELETE ---
    const handleDelete = async (id) => {
        const result = await Alerts.confirmDelete("Are you sure?", "This payment record will be permanently removed.");
        
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5241/api/payment/${id}`);
                Alerts.success("Deleted!", "Payment record has been removed.");
                fetchRecent();
                if (onSaved) onSaved();
            } catch (e) { 
                Alerts.error("Error", "Could not delete the record.");
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const customerVal = selectedCustomer || customerId;

        // Validation using Central Alerts
        if (!customerVal || customerVal === "") {
            Alerts.error("Missing Info", "Please select a customer first.");
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            Alerts.error("Invalid Amount", "Please enter a valid payment amount.");
            return;
        }

        setIsSaving(true);
        const payload = {
            Id: editMode ? Number(editingId) : 0,
            CustomerId: Number(customerVal),
            Amount: Number(amount),
            Description: note || "Cash Received",
            PaymentDate: new Date(date).toISOString()
        };

        try {
            if (editMode) {
                await axios.put(`http://localhost:5241/api/payment/${editingId}`, payload);
                Alerts.success("Updated!", "Payment details updated successfully.");
            } else {
                await axios.post("http://localhost:5241/api/payment", payload);
                Alerts.success("Saved!", "Payment has been recorded.");
            }

            setAmount("");
            setEditMode(false);
            fetchRecent();
            if (onSaved) onSaved();

        } catch (error) {
            Alerts.error("Save Failed", error.response?.data?.message || "Server connection error.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex flex-column align-items-center w-100">
            <div className="glass-card p-4 p-md-5 mt-3 shadow-sm border bg-white rounded-4 w-100" style={{ maxWidth: "800px" }}>
                {!hideSelection && <h2 className="text-center mb-4 fw-bold text-success"><FaMoneyBillWave /> {editMode ? "Update Wasooli" : "Recovery Entry"}</h2>}

                <form onSubmit={handleSave} className="row g-3">
                    {!hideSelection && <div className="col-12"><label className="fw-bold small text-muted uppercase">Customer</label>
                        <select className="form-select border-2" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} disabled={editMode}>
                            <option value="">-- Select Customer --</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}

                    <div className="col-md-6"><label className="fw-bold small text-muted uppercase"><FaCalendarAlt /> Date</label>
                        <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} /></div>

                    <div className="col-md-6"><label className="fw-bold small text-muted uppercase">Amount (Rs)</label>
                        <input type="number" className="form-control fw-bold text-success" value={amount} onChange={e => setAmount(e.target.value)} /></div>

                    <div className="col-12"><label className="fw-bold small text-muted uppercase">Description</label>
                        <input type="text" className="form-control" value={note} onChange={e => setNote(e.target.value)} /></div>

                    <div className="col-12 mt-4">
                        <button
                            type="submit"
                            className="btn w-100 py-3 fw-bold shadow-sm text-uppercase"
                            style={{
                                backgroundColor: "#001f3f",
                                color: "white",
                                border: "none",
                                transition: "0.3s"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#003366"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#001f3f"}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : editMode ? "Update Entry" : "Save Entry"}
                        </button>
                        {editMode && <button type="button" className="btn btn-link w-100 text-muted" onClick={() => { setEditMode(false); setAmount(""); }}>Cancel Edit</button>}
                    </div>
                </form>

                <div className="mt-5 pt-4 border-top">
                    <h6 className="fw-bold text-muted mb-3 small uppercase">Recent History</h6>
                    <div className="table-responsive rounded border bg-white shadow-sm">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light"><tr className="small text-muted"><th>#</th><th>DATE</th><th>DESCRIPTION</th><th>AMOUNT</th><th className="text-end">ACTION</th></tr></thead>
                            <tbody>
                                {recentPayments.length > 0 ? recentPayments.map((p, index) => (
                                    <tr key={p.id || index}>
                                        <td className="small text-muted">{index + 1}</td>
                                        <td className="small">{new Date(p.paymentDate || p.date).toLocaleDateString()}</td>
                                        <td className="small">{p.description}</td>
                                        <td className="small fw-bold text-success">Rs {(p.amount || p.credit).toLocaleString()}</td>
                                        <td className="text-end">
                                            <button className="btn btn-sm text-primary border-0 me-1" onClick={() => handleEdit(p)}><FaEdit /></button>
                                            <button className="btn btn-sm text-danger border-0" onClick={() => handleDelete(p.id || p.Id)}><FaTrash /></button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="text-center py-3 text-muted">No history found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default PaymentEntry;