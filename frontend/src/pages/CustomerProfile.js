import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFileInvoiceDollar, FaPlusCircle, FaMoneyBillWave, FaArrowLeft, FaHistory } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Components 
import CustomerLedger from "./CustomerLedger"; 
import SaleEntry from "./SaleEntry";
import PaymentEntry from "./PaymentEntry";

function CustomerProfile() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    
    // Modal Control States
    const [showLedgerModal, setShowLedgerModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        loadCustomerData();
    }, [id]);

    const loadCustomerData = () => {
        axios.get(`http://localhost:5241/api/customers/${id}`)
            .then(res => setCustomer(res.data))
            .catch(err => console.error(err));
    };

    if (!customer) return <div className="p-5 text-center text-muted">Loading Customer Profile...</div>;

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <style>{`
                .profile-header { background: white; border-radius: 20px; padding: 25px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
                
                .nav-back-container { display: flex; justify-content: center; margin-bottom: 15px; }
                .btn-back-sleek { 
                    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 30px; 
                    padding: 8px 40px; color: #64748b; transition: all 0.2s ease; font-weight: bold;
                }
                .btn-back-sleek:hover { background: #001f3f; color: white; border-color: #001f3f; }

                .btn-navy-custom { 
                    background-color: #001f3f !important; color: white !important; font-weight: bold; 
                    border: 2px solid #001f3f !important; transition: all 0.3s ease; border-radius: 12px; padding: 14px 24px;
                    display: flex; align-items: center; justify-content: center; gap: 10px; flex: 1; min-width: 200px;
                }
                .btn-navy-custom:hover { 
                    background-color: white !important; color: #001f3f !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,31,63,0.15); 
                }

                .form-container-main { background: white; border-radius: 20px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
                .balance-display { border-left: 4px solid #ef4444; padding-left: 15px; }
                
                @media (max-width: 768px) {
                    .header-flex { flex-direction: column; text-align: center; gap: 20px; }
                    .btn-navy-custom { width: 100%; }
                }
            `}</style>

            {/* --- TOP NAVIGATION & HEADER --- */}
            <div className="profile-header shadow-sm border-0">
                <div className="nav-back-container">
                    <button className="btn-back-sleek" onClick={() => navigate('/customers')}>
                        <FaArrowLeft className="me-2" /> Back to Customers List
                    </button>
                </div>

                <div className="d-flex header-flex justify-content-between align-items-center mt-3">
                    <div className="text-center text-md-start">
                        <h1 className="fw-bold m-0 text-dark" style={{ letterSpacing: '-1.5px' }}>{customer.name}</h1>
                        <p className="text-muted m-0">Direct Entry Panel</p>
                    </div>
                    
                    <div className="balance-display text-center text-md-end">
                        <p className="text-muted small fw-bold mb-0 text-uppercase">Account Balance</p>
                        <h2 className={`fw-bold m-0 ${customer.currentBalance > 0 ? 'text-danger' : 'text-success'}`}>
                            Rs {customer.currentBalance.toLocaleString()}
                        </h2>
                    </div>
                </div>

                {/* --- HEADER ACTIONS (Replaced New Sale with Ledger/History) --- */}
                <div className="d-flex flex-wrap gap-3 mt-4">
                    <button className="btn-navy-custom" onClick={() => setShowLedgerModal(true)}>
                        <FaHistory /> View Account Ledger
                    </button>
                    <button className="btn-navy-custom" onClick={() => setShowPaymentModal(true)} style={{backgroundColor:'#28a745', borderColor:'#28a745'}}>
                        <FaMoneyBillWave /> Cash Recovery
                    </button>
                </div>
            </div>

            {/* --- MAIN PAGE CONTENT: SALE ENTRY FORM (NOW DEFAULT) --- */}
            <div className="row justify-content-center">
                <div className="col-lg-10 col-xl-8">
                    <div className="form-container-main">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <div className="bg-primary p-2 rounded-3 text-white">
                                <FaPlusCircle size={20} />
                            </div>
                            <h4 className="fw-bold m-0">Create New Sale Entry</h4>
                        </div>
                        
                        <SaleEntry 
                            customerId={id} 
                            hideSelection={true} 
                            onSaved={() => {
                                loadCustomerData();
                                // We stay on the page so user can enter another sale if needed
                            }} 
                        />
                    </div>
                </div>
            </div>

            {/* --- MODAL PANELS (Uniform Design) --- */}
            <AnimatePresence>
                {/* 1. LEDGER / HISTORY MODAL (Moved from main page to here) */}
                {showLedgerModal && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-centered modal-xl">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0 bg-navy text-white" style={{ background: '#001f3f', borderRadius: '15px 15px 0 0', padding: '20px' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <FaHistory />
                                        <h5 className="fw-bold m-0">{customer.name} - Transaction History</h5>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowLedgerModal(false)}></button>
                                </div>
                                <div className="modal-body p-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                                    <CustomerLedger customerId={id} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 2. PAYMENT ENTRY MODAL */}
                {showPaymentModal && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0 bg-navy text-white" style={{ background: '#001f3f', borderRadius: '15px 15px 0 0', padding: '20px' }}>
                                    <h5 className="fw-bold m-0"><FaMoneyBillWave className="me-2"/> Cash Recovery Entry</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowPaymentModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <PaymentEntry 
                                        customerId={id} 
                                        hideSelection={true} 
                                        onSaved={() => {
                                            loadCustomerData();
                                            setShowPaymentModal(false);
                                        }} 
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CustomerProfile;