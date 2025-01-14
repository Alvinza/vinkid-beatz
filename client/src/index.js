import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    
  <BrowserRouter>
    {" "}
    {/* Wrap App with BrowserRouter for routing */}
    <App />
  </BrowserRouter>
);

reportWebVitals();
