import React from "react";
import "./App.css";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Routes } from "react-router-dom";

//  custom components and context providers
import CustomNavbar from "./components/CustomNavbar";
import Contact from "./components/Contact";
import BeatStore from "./components/BeatStore";
import About from "./components/About";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Faq from "./components/Faq";
import { CartProvider } from "./context/CartContext";
import { AudioProvider } from "./context/AudioContext";
import { UserProvider } from "./context/UserContext";
import AdminRoute from "./components/AdminRoute";
import Payment from "./components/Payment";
import CartPage from "./components/CartPage";
import Success from "./components/Success";
import NotFound from "./components/NotFound";
import AdminPanel from "./components/AdminPanel";

function App() {
  return (
    <div className="app">
      {/* Wrap entire application with context providers for global state management */}
      <UserProvider>
        <CartProvider>
          <AudioProvider>
            {/* Toast notification container for displaying alerts */}
            <ToastContainer />
            <CustomNavbar />

            {/*  application routing */}
            <Routes>
              {/* routes */}
              <Route path="/beats" element={<BeatStore />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/success" element={<Success />} />
              {/* Catch-all route for undefined pages */}
              <Route path="*" element={<NotFound />} />

              <Route
                path="/admin-panel"
                element={
                  // Protected route requiring admin authentication
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
            </Routes>
          </AudioProvider>
        </CartProvider>
      </UserProvider>
    </div>
  );
}

export default App;
