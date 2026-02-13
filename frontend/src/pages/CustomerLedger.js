import { useEffect, useState } from "react";
import axios from "axios";
import { FaFileInvoice, FaPrint, FaUserTie, FaMoneyBillWave, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { motion } from "framer-motion";

function CustomerLedger({ customerId }) {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(customerId || "");
    const [custDetails, setCustDetails] = useState(null);
    const [ledger, setLedger] = useState([]);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (!customerId) {
            axios.get("http://localhost:5241/api/customers").then(res => setCustomers(res.data));
        } else {
            loadLedgerData(customerId);
        }
    }, [customerId]);

    const loadLedgerData = async (custId) => {
        if (!custId) return;
        try {
            const res = await axios.get(`http://localhost:5241/api/report/ledger/${custId}`);
            const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setLedger(sortedData);

            const custRes = await axios.get(`http://localhost:5241/api/customers/${custId}`);
            setCustDetails(custRes.data);
            setBalance(custRes.data.currentBalance);
            setSelectedCustomer(custId);
        } catch (error) {
            console.error("Ledger Load Error:", error);
        }
    };

    const handleCustomerChange = (e) => {
        const id = e.target.value;
        setSelectedCustomer(id);
        if (id) {
            loadLedgerData(id);
        } else {
            setLedger([]);
            setBalance(0);
            setCustDetails(null);
        }
    };

    const handlePrint = () => { window.print(); };

    let runningTotal = 0;
    const ledgerWithBalance = [...ledger].reverse().map((item) => {
        runningTotal = runningTotal + (item.debit || 0) - (item.credit || 0);
        return { ...item, runningBalance: runningTotal };
    }).reverse();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container-fluid p-0">
            
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        #printable-area, #printable-area * { visibility: visible; }
                        #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none !important; }
                        .glass-card { border: none !important; box-shadow: none !important; }
                        
                        /* Print ke waqt balance ko normal karne ke liye */
                        .print-balance-fix { 
                            background-color: transparent !important; 
                            color: #000 !important; 
                            border: 1px solid #ddd !important;
                        }
                    }
                    .custom-thead th {
                        color: #000000 !important;
                        background-color: #f1f3f5 !important;
                        font-weight: 800 !important;
                        border-bottom: 2px solid #333 !important;
                        text-transform: uppercase;
                        font-size: 12px;
                    }
                    .summary-row {
                        background-color: #fdfdfd !important;
                        border-top: 2px solid #222 !important;
                    }
                `}
            </style>

            {!customerId && (
                <div className="glass-card mb-4 no-print shadow-sm p-4 bg-white rounded border">
                    <div className="row align-items-center">
                        <div className="col-md-5">
                            <label className="fw-bold text-muted small mb-2 uppercase">Select Customer</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0"><FaUserTie className="text-primary"/></span>
                                <select className="form-select fw-bold border-start-0 shadow-none" value={selectedCustomer} onChange={handleCustomerChange}>
                                    <option value="">-- Choose Customer --</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-7 text-end border-start">
                            <small className="text-muted fw-bold d-block uppercase" style={{fontSize: '10px'}}>Total Outstanding Balance</small>
                            <h2 className={`fw-bold m-0 ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                                Rs {balance.toLocaleString()}
                            </h2>
                        </div>
                    </div>
                </div>
            )}

            <div id="printable-area">
                {selectedCustomer && (
                    <div className={customerId ? "" : "glass-card p-4 bg-white rounded border shadow-sm"}>
                        
                        <div className="text-center mb-4 pb-3 border-bottom">
                            <h1 className="fw-bold m-0" style={{color: '#003366', letterSpacing: '1px', fontSize: '32px'}}>MUNEEB FILLING STATION</h1>
                            <p className="text-muted small uppercase mb-0" style={{letterSpacing: '3px'}}>Customer Ledger Statement</p>
                        </div>

                        <div className="row mb-4 p-3 bg-light rounded mx-0 border border-opacity-50">
                            <div className="col-6">
                                <div className="mb-1" style={{fontSize: '18px'}}> <strong>{custDetails?.name?.toUpperCase()}</strong></div>
                                <div style={{fontSize: '16px'}}> <strong>{custDetails?.phone || "N/A"}</strong></div>
                            </div>
                            <div className="col-6 text-end">
                                <div className="mb-1 small"><strong>STATEMENT DATE:</strong> {new Date().toLocaleDateString()}</div>
                                <div className={`small fw-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                                    STATUS: {balance > 0 ? 'PENDING DUES' : 'CLEAR / ADVANCE'}
                                </div>
                            </div>
                        </div>

                        {ledger.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover align-middle mb-0">
                                    <thead className="custom-thead">
                                        <tr className="text-center">
                                            <th>#</th>
                                            <th>Date</th>
                                            <th className="text-start">Description</th>
                                            <th className="text-end">Debit (+)</th>
                                            <th className="text-end">Credit (-)</th>
                                            <th className="text-end">Running Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="small">
                                        {ledgerWithBalance.map((item, index) => (
                                            <tr key={index}>
                                                <td className="text-center text-muted fw-bold">{index + 1}</td>
                                                <td className="text-center">{new Date(item.date).toLocaleDateString()}</td>
                                                <td className="text-start">
                                                    <div className="d-flex align-items-center">
                                                        {item.type === 'Sale' 
                                                            ? <FaArrowUp className="text-danger me-2" size={10}/> 
                                                            : <FaArrowDown className="text-success me-2" size={10}/>
                                                        }
                                                        <span>{item.description}</span>
                                                    </div>
                                                </td>
                                                <td className="text-end text-danger fw-bold">{item.debit > 0 ? item.debit.toLocaleString() : "-"}</td>
                                                <td className="text-end text-success fw-bold">{item.credit > 0 ? item.credit.toLocaleString() : "-"}</td>
                                                <td className="text-end fw-bold bg-light text-dark">{item.runningBalance.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="summary-row">
                                        <tr>
                                            <td colSpan="3" className="text-end fw-bold py-3 text-uppercase small">Net Balance:</td>
                                            <td className="text-end fw-bold text-danger py-3">{ledger.reduce((acc, i) => acc + i.debit, 0).toLocaleString()}</td>
                                            <td className="text-end fw-bold text-success py-3">{ledger.reduce((acc, i) => acc + i.credit, 0).toLocaleString()}</td>
                                            <td className="text-end p-0">
                                                {/* Added print-balance-fix class here */}
                                                <div className={`h-100 d-flex align-items-center justify-content-end px-3 fw-bold fs-5 print-balance-fix ${balance > 0 ? 'bg-danger text-white' : 'bg-success text-white'}`} style={{ minHeight: '60px' }}>
                                                    Rs {balance.toLocaleString()}
                                                </div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5 border rounded bg-white shadow-sm">
                                <FaFileInvoice size={40} className="text-muted opacity-25 mb-3" />
                                <p className="text-muted m-0">No records found.</p>
                            </div>
                        )}

                        <div className="row mt-5 pt-5 d-none d-print-flex">
                            <div className="col-6"><div className="border-top pt-2 text-center small fw-bold">Authorized Signature</div></div>
                            <div className="col-6 text-end"><div className="border-top pt-2 text-center small fw-bold">Customer Signature</div></div>
                        </div>
                    </div>
                )}
            </div>

            {selectedCustomer && (
                <div className="mt-4 text-end no-print d-flex justify-content-end gap-2">
                    <button className="btn btn-primary fw-bold shadow-sm px-4 d-flex align-items-center gap-2" onClick={handlePrint}><FaPrint /> Print Statement</button>
                </div>
            )}
        </motion.div>
    );
}

export default CustomerLedger;