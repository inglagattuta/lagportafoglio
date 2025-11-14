<nav className="p-4 bg-gray-200 flex gap-4">
  <Link to="/">Home</Link>
  <Link to="/portfolio">Portfolio</Link>
  <Link to="/score">Score</Link>
  <Link to="/grafici">Grafici</Link>
</nav>

import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div>
      {/* NAVBAR */}
      <nav className="p-4 bg-gray-200 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/portfolio">Portfolio</Link>
      </nav>

      {/* CONTENUTO DELLE PAGINE */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
