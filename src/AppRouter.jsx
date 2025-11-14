import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";

export default function AppRouter() {
  return (
    <div style={{ padding: "20px" }}>
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/" style={{ marginRight: "20px" }}>Home</Link>
        <Link to="/portfolio">Portfolio</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </div>
  );
}
