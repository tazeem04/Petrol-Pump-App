import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUserPlus, FaUserCircle, FaEdit, FaUserAlt, FaCamera, FaPhoneAlt, FaTimes, FaTrashAlt, FaUsers } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Alerts from '../utils/Alerts';

const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // Toggle for Registration Form
    const [customerData, setCustomerData] = useState({ name: "", phone: "", address: "", imageFile: null, preview: null });
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get("http://localhost:5241/api/customers");
            setCustomers(res.data);
        } catch (err) {
            Alerts.error("Error", "Customer list load nahi ho saki.");
        }
    };

    const handleDelete = async (customer) => {
        if (customer.currentBalance > 0) {
            Alerts.error(
                "Deletion Blocked",
                `Is customer ka balance Rs. ${customer.currentBalance.toLocaleString()} rehta hai. Pehle balance clear karein phir delete hoga.`
            );
            return;
        }

        const result = await Alerts.confirmDelete(
            "Delete Customer?",
            `Kya aap waqai "${customer.name}" ka account khatam karna chahte hain?`
        );

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5241/api/customers/${customer.id}`);
                Alerts.success("Deleted!", "Customer successfully remove ho gaya.");
                fetchCustomers();
            } catch (err) {
                Alerts.error("Delete Failed", "Record delete nahi kiya ja sakta.");
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomerData({ ...customerData, imageFile: file, preview: URL.createObjectURL(file) });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!customerData.name) {
            Alerts.error("Validation", "Naam likhna lazmi hai.");
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append("Name", customerData.name);
        data.append("Phone", customerData.phone || "");
        data.append("Address", customerData.address || "");
        if (customerData.imageFile) data.append("ImageFile", customerData.imageFile);

        try {
            if (editMode) {
                await axios.put(`http://localhost:5241/api/customers/${selectedId}`, data);
                Alerts.success("Updated!", "Details tabdeel ho gayeen.");
            } else {
                await axios.post("http://localhost:5241/api/customers", data);
                Alerts.success("Success", "Naya account ban gaya.");
            }
            resetForm();
            fetchCustomers();
        } catch (err) {
            Alerts.error("Error", "Data save nahi ho saka.");
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        setCustomerData({ name: "", phone: "", address: "", imageFile: null, preview: null });
        setEditMode(false);
        setShowModal(false);
    };

    const openEdit = (customer, fullImgUrl) => {
        setEditMode(true);
        setSelectedId(customer.id);
        setCustomerData({ name: customer.name, phone: customer.phone, address: customer.address, imageFile: null, preview: fullImgUrl });
        setShowModal(true);
    };

    return (
        <div className="container-fluid py-4 bg-light" style={{ minHeight: '100vh' }}>
            <style>{`
    .glass-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; transition: all 0.3s ease; }
    .header-navy { background: #001f3f; border-radius: 15px; color: white !important; padding: 25px 35px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.search-box-container { 
    background: #fff; 
    border-radius: 10px; 
    border: 1px solid #dee2e6; 
    display: flex; 
    align-items: center; 
    padding: 10px 20px; 
    margin-bottom: 25px; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}    
    .search-input-field { 
    border: none !important; 
    outline: none !important; 
    width: 100%; 
    font-size: 15px; 
    color: #495057; 
}
    /* FIX: This keeps cards the same height and aligns buttons to the bottom */
    .cust-card { min-height: 240px; display: flex; flex-direction: column; justify-content: space-between; position: relative; }
    .cust-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06) !important; }
    
    .grid-avatar-small { width: 60px; height: 60px; border-radius: 50%; background: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid #fff; flex-shrink: 0; }
    
    /* FIX: Prevents large balances from breaking the card layout */
    .balance-badge-sm { 
        background: #fff5f5; color: #e53e3e; padding: 3px 8px; border-radius: 8px; 
        font-weight: 700; font-size: 0.75rem; border: 1px solid #fed7d7;
        white-space: nowrap;
    }

    .card-footer-btns { border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: auto; }

    /* MOBILE SIDE-BY-SIDE FIX */
    @media (max-width: 576px) {
        .mobile-col-6 { width: 50% !important; flex: 0 0 50% !important; }
        .cust-card { min-height: 210px !important; padding: 10px !important; }
        .grid-avatar-small { width: 50px !important; height: 50px !important; }
    }
`}</style>

            {/* --- HEADER --- */}
            <div className="header-navy d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-center">
                    <div className="bg-white p-3 rounded-circle me-4 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <FaUsers size={25} style={{ color: '#001f3f' }} />
                    </div>
                    <div>
                        <h3 className="fw-bold m-0 text-white">Customer Directory</h3>
                        <p className="m-0 opacity-75 small text-uppercase tracking-wider fw-bold">Pump Credit Management</p>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-none d-md-block text-end pe-3 border-end border-light">
                        <div className="h4 fw-bold m-0 text-white">{customers.length}</div>
                        <div className="small opacity-75 fw-bold">Total Accounts</div>
                    </div>
                    <button className="btn btn-light fw-bold px-4 py-2 shadow-sm rounded-pill d-flex align-items-center" onClick={() => setShowModal(true)}>
                        <FaUserPlus className="me-2 text-primary" /> Register New
                    </button>
                </div>
            </div>

            {/* --- SEARCH --- */}
            <div className="search-box-container">
                <FaSearch className="search-icon-style" />
                <input
                    type="text"
                    className="search-input-field"
                    placeholder="Search by name or mobile number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* --- CUSTOMER GRID --- */}
            <div className="row g-2 g-md-3">
                <AnimatePresence>
                    {customers
                        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.phone && c.phone.includes(searchTerm)))
                        .map(customer => {
                            const fullImgUrl = customer.imageUrl ? `http://localhost:5241/${customer.imageUrl}` : null;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mobile-col-6" // This forces 2-columns on mobile
                                    key={customer.id}
                                >
                                    <div className="glass-card p-3 shadow-sm border cust-card">
                                        <button className="del-btn-mini" onClick={() => handleDelete(customer)} style={{ position: 'absolute', top: '8px', right: '8px', border: 'none', background: 'transparent', color: '#cbd5e0' }}>
                                            <FaTrashAlt size={12} />
                                        </button>

                                        <div className="text-center">
                                            <div className="grid-avatar-small mx-auto mb-2 shadow-sm border">
                                                {fullImgUrl ? (
                                                    <img src={fullImgUrl} className="w-100 h-100" style={{ objectFit: 'cover', cursor: 'zoom-in' }} onClick={() => setZoomImage(fullImgUrl)} alt="p" />
                                                ) : <FaUserCircle size={35} className="text-secondary opacity-50" />}
                                            </div>

                                            <h6 className="fw-bold text-dark mb-0 text-truncate px-1" style={{ fontSize: '0.85rem' }}>{customer.name}</h6>
                                            <div className="small text-muted mb-2 text-truncate" style={{ fontSize: '0.7rem' }}>
                                                <FaPhoneAlt size={9} className="me-1 text-primary" /> {customer.phone || 'No Number'}
                                            </div>

                                            <div className="balance-badge-sm shadow-sm d-inline-block">
                                                Rs {customer.currentBalance.toLocaleString()}
                                            </div>
                                        </div>

                                        {/* FOOTER BUTTONS: margin-top: auto keeps these aligned across all cards */}
                                        <div className="d-flex gap-1 card-footer-btns">
                                            <button className="btn btn-sm btn-light border-0" 
            style={{ background: '#f1f5f9', width: '40px' }} 
            onClick={() => openEdit(customer, fullImgUrl)}>
        <FaEdit size={12} className="text-primary"/>
    </button>
    
    <button className="btn btn-sm btn-primary flex-grow-1 shadow-sm fw-bold border-0 d-flex align-items-center justify-content-center" 
            style={{ backgroundColor: '#001f3f', fontSize: '0.75rem' }} 
            onClick={() => navigate(`/customer-profile/${customer.id}`)}>
        <FaUserAlt size={10} className="me-1"/> Profile
    </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                </AnimatePresence>
            </div>

            {/* --- REGISTRATION MODAL --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="form-modal-overlay">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="modal-content-custom shadow-lg">
                            <div className="p-3 bg-light d-flex justify-content-between align-items-center border-bottom">
                                <h6 className="fw-bold m-0"><FaUserPlus className="me-2 text-primary" /> {editMode ? "Update Details" : "Register New Account"}</h6>
                                <button className="btn btn-sm text-muted" onClick={resetForm}><FaTimes /></button>
                            </div>
                            <div className="p-4">
                                <form onSubmit={handleSave}>
                                    <div className="avatar-container mb-3 text-center">
                                        {customerData.preview ? (
                                            <img src={customerData.preview} className="avatar-img-main" alt="preview" />
                                        ) : (
                                            <div className="avatar-img-main d-flex align-items-center justify-content-center bg-light text-secondary border">
                                                <FaUserCircle size={60} />
                                            </div>
                                        )}
                                        <label className="cam-label shadow-sm"><FaCamera /><input type="file" hidden onChange={handleImageChange} accept="image/*" /></label>
                                    </div>

                                    <div className="mb-2">
                                        <label className="text-muted fw-bold mb-1" style={{ fontSize: '10px' }}>FULL NAME</label>
                                        <input type="text" className="form-control border-0 bg-light fw-bold px-3 py-2" placeholder="Full Name" value={customerData.name} required onChange={e => setCustomerData({ ...customerData, name: e.target.value })} />
                                    </div>

                                    <div className="mb-2">
                                        <label className="text-muted fw-bold mb-1" style={{ fontSize: '10px' }}>MOBILE NUMBER</label>
                                        <input type="text" className="form-control border-0 bg-light fw-bold px-3 py-2" placeholder="03xx xxxxxxx" value={customerData.phone} onChange={e => setCustomerData({ ...customerData, phone: e.target.value })} />
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-muted fw-bold mb-1" style={{ fontSize: '10px' }}>ADDRESS</label>
                                        <input type="text" className="form-control border-0 bg-light fw-bold px-3 py-2" placeholder="Location" value={customerData.address} onChange={e => setCustomerData({ ...customerData, address: e.target.value })} />
                                    </div>

                                    <button className="btn btn-primary w-100 fw-bold py-2 shadow-sm border-0" disabled={loading} style={{ backgroundColor: '#001f3f' }}>
                                        {loading ? "Saving..." : (editMode ? "Update Details" : "Create Account")}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- IMAGE ZOOM --- */}
            <AnimatePresence>
                {zoomImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="image-zoom-overlay" onClick={() => setZoomImage(null)}>
                        <img src={zoomImage} style={{ maxWidth: '85%', maxHeight: '85%', borderRadius: '12px', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }} alt="Zoom" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerList;