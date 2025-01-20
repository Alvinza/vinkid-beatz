import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
// import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { HashRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    
  <HashRouter>
    {" "}
    {/* Wrap App with BrowserRouter for routing */}
    <App />
  </HashRouter>
);

reportWebVitals();
