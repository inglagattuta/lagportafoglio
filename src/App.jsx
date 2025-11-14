import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Portfolio from "./pages/Portfolio";
import Score from "./pages/Score";
import Grafici from "./pages/Grafici";


export default function App() {
return (
<Router>
<nav>
<NavLink to="/">Portafoglio</NavLink>
<NavLink to="/score">Score</NavLink>
<NavLink to="/grafici">Grafici</NavLink>
</nav>


<Routes>
<Route path="/" element={<Portfolio />} />
<Route path="/score" element={<Score />} />
<Route path="/grafici" element={<Grafici />} />
</Routes>
</Router>
);
}
