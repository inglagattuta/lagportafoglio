import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Portfolio from "./Portfolio";

const Home = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Benvenuto nella tua App di Portafoglio</h1>
      <p>Questa è la pagina principale.</p>
      <nav style={{ margin: "20px 0" }}>
        <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
        <Link to="/portfolio">Portfolio</Link>
      </nav>

      <Routes>
        <Route path="/" element={<p>Seleziona una sezione dal menu sopra.</p>} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </div>
  );
};

export default function AppRouter() {
  return (
    <Router>
      <Home />
    </Router>
  );
}
