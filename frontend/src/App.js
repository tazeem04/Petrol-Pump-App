import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// 1. Pages Import karein (Yahan wo nayi line aayi hai)
import SaleEntry from "./pages/SaleEntry";
import DailyClosing from "./pages/DailyClosing"; // <-- YE WALI LINE

function App() {
  return (
    <Router>
      <div className="container mt-4">
        
        {/* --- MENU / NAVIGATION BUTTONS --- */}
        <nav className="d-flex justify-content-center gap-3 mb-4 p-3 bg-light rounded shadow-sm">
            {/* Button 1: Sale Entry */}
            <Link to="/" className="btn btn-danger fw-bold">
              ⛽ Udhaar Entry
            </Link>

            {/* Button 2: Closing (Ye naya button hai) */}
            <Link to="/closing" className="btn btn-primary fw-bold">
              📊 Daily Closing
            </Link>
        </nav>

        {/* --- PAGES ROUTING --- */}
        <Routes>
          {/* Jab "/" khule to SaleEntry dikhao */}
          <Route path="/" element={<SaleEntry />} />

          {/* Jab "/closing" khule to DailyClosing dikhao (Ye nayi Route hai) */}
          <Route path="/closing" element={<DailyClosing />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;