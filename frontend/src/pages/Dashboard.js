import { useEffect, useState } from "react";
import axios from "axios";
import { FaGasPump, FaMoneyBillWave, FaChartLine, FaWallet, FaArrowUp, FaArrowDown, FaExclamationCircle, FaSearch, FaTag } from "react-icons/fa";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { loadStats(); }, []);

    const loadStats = () => {
        axios.get("http://localhost:5241/api/dashboard/stats")
            .then(res => setStats(res.data))
            .catch(err => console.error("Error:", err));
    };

    if (!stats) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    const hasGraphData = stats.graphData && stats.graphData.length > 0;
    const filteredSales = stats.recentSales ? stats.recentSales.filter(sale =>
        sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.desc.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            
            {/* ================= 1. ACTIVE RATES (Dark Cards to Break the White) ================= */}
            <div className="mb-4">
                <h6 className="text-muted fw-bold mb-3 small text-uppercase" style={{letterSpacing:'1px'}}>Current Fuel Prices</h6>
                <div className="row g-3">
                    {stats.activeRates?.map((rate, i) => (
                        <div key={i} className="col-6 col-md-3">
                            <div className="p-3 rounded-3 shadow-sm d-flex align-items-center justify-content-between position-relative overflow-hidden" 
                                 style={{ background: 'linear-gradient(135deg, #001f3f 0%, #003366 100%)', color: 'white' }}>
                                
                                {/* Decor Circle */}
                                <div style={{ position: 'absolute', right: '-10px', top: '-10px', width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                                
                                <div>
                                    <small className="text-white-50 fw-bold d-block text-uppercase" style={{ fontSize: '10px' }}>{rate.fuelType}</small>
                                    <h4 className="m-0 fw-bold">Rs {rate.price}</h4>
                                </div>
                                <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <FaTag size={16} className="text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ================= 2. STAT CARDS (2x2 Split Layout) ================= */}
            <div className="row g-4 mb-5">
                <StatCard 
                    title="Total Revenue" 
                    value={`Rs ${(stats.totalRevenue || 0).toLocaleString()}`} 
                    icon={<FaMoneyBillWave />} 
                    color="#10B981" bg="rgba(16, 185, 129, 0.1)" 
                    trend={stats.revenueTrend} trendColor={stats.revenueColor} 
                />
                <StatCard 
                    title="Total Liters Sold" 
                    value={`${(stats.totalLiters || 0).toLocaleString()} L`} 
                    icon={<FaGasPump />} 
                    color="#ef4444" bg="rgba(239, 68, 68, 0.1)" 
                    trend={stats.litersTrend} trendColor={stats.litersColor} 
                />
                <StatCard 
                    title="Market Udhaar" 
                    value={`Rs ${(stats.totalReceivables || 0).toLocaleString()}`} 
                    icon={<FaWallet />} 
                    color="#F59E0B" bg="rgba(245, 158, 11, 0.1)" 
                    trend="Pending Amount" trendColor="orange" 
                />
                <StatCard 
                    title="Cash Recovered" 
                    value={`Rs ${(stats.todayRecovery || 0).toLocaleString()}`} 
                    icon={<FaChartLine />} 
                    color="#6366F1" bg="rgba(99, 102, 241, 0.1)" 
                    trend="Safe Balance" trendColor="blue" 
                />
            </div>

            {/* ================= 3. GRAPH & STOCK ================= */}
            <div className="row g-4 mb-5">
                {/* Graph */}
                <div className="col-lg-8">
                    <div className="bg-white p-4 rounded-3 shadow-sm h-100 border-0">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-dark m-0">📈 Real-Time Sales (Hourly)</h5>
                            <span className="badge bg-light text-muted border">Today</span>
                        </div>
                        <div style={{ height: "300px", width: "100%" }}>
                            {hasGraphData ? (
                                <ResponsiveContainer>
                                    <AreaChart data={stats.graphData}>
                                        <defs>
                                            <linearGradient id="colorSale" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#001f3f" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#001f3f" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} style={{fontSize: '12px', fill: '#9ca3af'}} />
                                        <YAxis axisLine={false} tickLine={false} style={{fontSize: '12px', fill: '#9ca3af'}} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="sale" stroke="#001f3f" fillOpacity={1} fill="url(#colorSale)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">
                                    <FaExclamationCircle size={40} className="mb-2 opacity-25"/>
                                    <p>No sales today.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stock */}
                <div className="col-lg-4">
                    <div className="bg-white p-4 rounded-3 shadow-sm h-100 border-0">
                        <h5 className="fw-bold mb-4 text-dark">🛢️ Tank Stock</h5>
                        <div className="d-flex flex-column gap-4">
                            {stats.stockStatus?.map((tank, i) => {
                                const percent = (tank.currentStock / tank.capacity) * 100;
                                const isLow = percent < 20;
                                return (
                                    <div key={i}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="fw-bold text-dark">{tank.fuelType}</span>
                                            <span className={`fw-bold ${isLow ? 'text-danger' : 'text-success'}`}>{percent.toFixed(0)}%</span>
                                        </div>
                                        <div className="progress" style={{ height: "10px", borderRadius: "10px", background: '#e9ecef' }}>
                                            <div className={`progress-bar ${isLow ? 'bg-danger' : 'bg-success'}`} style={{ width: `${percent}%`, borderRadius: "10px" }}></div>
                                        </div>
                                        <div className="d-flex justify-content-between mt-1">
                                            <small className="text-muted">{tank.currentStock.toLocaleString()} L</small>
                                            <small className="text-muted text-opacity-50">Cap: {tank.capacity.toLocaleString()}</small>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= 4. RECENT TRANSACTIONS ================= */}
            <div className="bg-white p-4 rounded-3 shadow-sm mb-4 border-0">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <h5 className="fw-bold text-dark m-0">🕒 Recent Transactions</h5>
                    <div className="input-group shadow-sm" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-white border-0 text-muted ps-3"><FaSearch /></span>
                        <input type="text" className="form-control border-0 bg-white" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-3 border-0 py-3">Customer</th>
                                <th className="border-0 py-3">Fuel</th>
                                <th className="border-0 py-3">Time</th>
                                <th className="text-end border-0 py-3">Amount</th>
                                <th className="text-end pe-3 border-0 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((sale, i) => (
                                <tr key={i}>
                                    <td className="ps-3 py-3 fw-bold text-dark">{sale.customer}</td>
                                    <td className="text-muted">{sale.desc}</td>
                                    <td className="text-muted small">{sale.time}</td>
                                    <td className="text-end fw-bold">Rs {sale.amount.toLocaleString()}</td>
                                    <td className="text-end pe-3"><span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">Completed</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}

// --- STAT CARD COMPONENT (Icon Top, Text Center) ---
function StatCard({ title, value, icon, color, bg, trend, trendColor }) {
    let textColor = '#6b7280';
    if(trendColor === 'red') textColor = '#ef4444';
    if(trendColor === 'green') textColor = '#10B981';
    if(trendColor === 'orange') textColor = '#F59E0B';
    if(trendColor === 'blue') textColor = '#6366F1';

    return (
        <div className="col-6 col-md-3">
            <motion.div whileHover={{ y: -5 }} className="bg-white p-4 rounded-3 shadow-sm h-100 border-0">
                <div className="d-flex flex-column align-items-center justify-content-center text-center">
                    <div className="mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '55px', height: '55px', background: bg, color: color, fontSize: '22px' }}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-muted fw-bold text-uppercase small mb-1" style={{fontSize: '11px', letterSpacing: '0.5px'}}>{title}</p>
                        <h3 className="fw-bold text-dark m-0">{value}</h3>
                        <div className="d-flex align-items-center justify-content-center gap-1 small fw-bold mt-1" style={{ color: textColor }}>
                            {trendColor === 'green' ? <FaArrowUp /> : trendColor === 'red' ? <FaArrowDown /> : null} {trend}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Dashboard;