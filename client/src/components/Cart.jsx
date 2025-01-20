import React from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Calculate total price
  const total = cart.reduce((sum, beat) => sum + beat.price, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      {cart.length > 0 ? (
        <div className="space-y-6">
          {cart.map((beat) => (
            <div 
              key={beat._id} 
              className="flex items-center gap-6 bg-white p-4 rounded-lg shadow"
            >
              <img
                className="w-24 h-24 object-cover rounded"
                src={beat.picture} // Direct use of the Cloudinary URL
                alt={beat.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg'; // Fallback image
                }}
              />
              <div className="flex-grow">
                <h2 className="text-xl font-semibold">{beat.title}</h2>
                <p className="text-gray-600">Genre: {beat.genre}</p>
                <p className="text-gray-600">BPM: {beat.bpm}</p>
                <p className="font-medium">${beat.price}</p>
              </div>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={() => removeFromCart(beat._id)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-8 flex justify-between items-center">
            <div className="text-xl font-bold">
              Total: ${total.toFixed(2)}
            </div>
            <div className="space-x-4">
              <button
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                onClick={() => navigate("/beats")}
              >
                Continue Shopping
              </button>
              <button
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                onClick={() => navigate("/payment")}
              >
                Proceed to Buy
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty.</p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            onClick={() => navigate("/beats")}
          >
            Browse Beats
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
