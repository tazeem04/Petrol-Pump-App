import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SaleEntry from "./pages/SaleEntry";
import DailyClosing from "./pages/DailyClosing";
import PaymentEntry from "./pages/PaymentEntry";
import StockEntry from "./pages/StockEntry";
import CustomerLedger from "./pages/CustomerLedger";
import CustomerList from "./pages/CustomerList";
import CustomerProfile from "./pages/CustomerProfile";
import RateSetting from "./pages/RateSetting";
import Home from "./pages/Home";
import Login from "./pages/Login"; // Make sure to import your new Login page

// --- 1. AXIOS INTERCEPTOR (Must be outside the component) ---
axios.interceptors.request.use(
    (config) => {
        const name = localStorage.getItem("operatorName");
        if (name) {
            config.headers['X-Operator-Name'] = name;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Directly read from localStorage to avoid stale state issues
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";

  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* 1. PUBLIC ROUTE */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />

          {/* 2. PROTECTED ROUTES WRAPPER */}
          {isAuthenticated ? (
            <Route
              path="/*"
              element={
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/sale" element={<SaleEntry />} />
                    <Route path="/closing" element={<DailyClosing />} />
                    <Route path="/payment" element={<PaymentEntry />} />
                    <Route path="/stock" element={<StockEntry />} />
                    <Route path="/customers" element={<CustomerList />} />
                    <Route path="/customer-profile/:id" element={<CustomerProfile />} />
                    <Route path="/ledger" element={<CustomerLedger />} />
                    <Route path="/rates" element={<RateSetting />} />
                    {/* Redirect any unknown route to home */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </Layout>
              }
            />
          ) : (
            /* 3. REDIRECT EVERYTHING ELSE TO LOGIN IF NOT AUTHENTICATED */
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Router>
    </AppProvider>
  );
}
export default App;