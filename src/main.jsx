import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./pages/Home";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
     <Routes>
  <Route path="/" element={<App />}>
    <Route index element={<Home />} />
    <Route path="portfolio" element={<Portfolio />} />
    <Route path="score" element={<Score />} />
    <Route path="grafici" element={<Grafici />} />
  </Route>
</Routes>
    </BrowserRouter>
  </React.StrictMode>
);
