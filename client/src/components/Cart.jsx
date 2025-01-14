import React from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cart.length > 0 ? (
        <div className="cart-items">
          {cart.map((beat) => (
            <div key={beat._id} className="cart-item">
              <img
                className="cart-item-image"
                src={`http://localhost:5000${beat.picture}`}
                alt={beat.title}
              />
              <div className="cart-item-details">
                <h2>{beat.title}</h2>
                <p>Genre: {beat.genre}</p>
                <p>BPM: {beat.bpm}</p>
                <p>Price: ${beat.price}</p>
              </div>
              <button
                className="remove-button bg-red-500 text-white p-2 rounded hover:bg-red-600"
                onClick={() => removeFromCart(beat._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
      {cart.length > 0 && (
        <button
          className="buy-button bg-green-600 text-white p-3 rounded-full hover:bg-green-700"
          onClick={() => navigate("/payment")}
        >
          Buy Now
        </button>
      )}
    </div>
  );
}

export default Cart;
