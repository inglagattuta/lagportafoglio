import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./pages/Home";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/lagportafoglio">
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);
