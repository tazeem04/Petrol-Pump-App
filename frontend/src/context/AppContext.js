import { createContext, useState } from "react";

export const AppContext = createContext();

/**
 * AppProvider
 * Central state management for the Petrol Pump Application.
 * Stores state for Sales, Payments, and Stock operations.
 */
export const AppProvider = ({ children }) => {
    
    // 1. Sales & Daily Closing State
    const [saleFormState, setSaleFormState] = useState({
        selectedCustomer: "",
        vehicleNumber: "",
        phoneNumber: "",
        editMode: false,
        editingSaleId: null,
        entries: {
            Petrol: { active: false, quantity: "", amount: "" },
            Diesel: { active: false, quantity: "", amount: "" },
            "Mobile Oil": { active: false, quantity: "", amount: "" },
            "Hi-Octane": { active: false, quantity: "", amount: "" }
        },
        // Used by DailyClosing.js to persist unsaved meter readings
        closingMachines: [] 
    });

    // 2. Payment Entry State
    const [paymentFormState, setPaymentFormState] = useState({
        amount: "",
        note: "Cash Received",
        date: new Date().toISOString().split('T')[0]
    });

    // 3. Stock & Inventory State (Professional addition)
    // Persists tank levels and refill history across the app
    const [stockState, setStockState] = useState({
        tanks: [],
        refillHistory: [],
        lastUpdated: new Date().toISOString()
    });

    return (
        <AppContext.Provider value={{ 
            saleFormState, setSaleFormState, 
            paymentFormState, setPaymentFormState,
            stockState, setStockState 
        }}>
            {children}
        </AppContext.Provider>
    );
};