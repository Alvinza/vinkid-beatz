import React, { useEffect } from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('Current cart items:', cart);
    cart.forEach(beat => {
      console.log(`Beat "${beat.title}" picture URL:`, beat.picture);
    });
  }, [cart]);

  const renderImage = (beat) => {
    // First try the direct URL
    let imageUrl = beat.picture;
    
    // If it starts with /uploads, prepend the backend URL
    if (beat.picture?.startsWith('/uploads')) {
      imageUrl = `https://vinkid-beatz-backend.onrender.com${beat.picture}`;
    }
    
    // If it's a relative URL without /uploads, still try with the backend URL
    if (beat.picture && !beat.picture.startsWith('http') && !beat.picture.startsWith('/uploads')) {
      imageUrl = `https://vinkid-beatz-backend.onrender.com/uploads/${beat.picture}`;
    }

    return (
      <img
        className="w-24 h-24 object-cover rounded"
        src={imageUrl}
        alt={beat.title}
        onError={(e) => {
          console.error(`Failed to load image for "${beat.title}"`, {
            originalSrc: beat.picture,
            attemptedSrc: imageUrl
          });
          e.target.onerror = null;
          e.target.src = '/placeholder-image.jpg';
        }}
      />
    );
  };

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
              {renderImage(beat)}
              <div className="flex-grow">
                <h2 className="text-xl font-semibold">{beat.title}</h2>
                <p className="text-gray-600">Genre: {beat.genre}</p>
                {beat.bpm && <p className="text-gray-600">BPM: {beat.bpm}</p>}
                <p className="font-medium">${beat.price}</p>
                {/* Debug info - remove in production */}
                <p className="text-xs text-gray-400 break-all">Image path: {beat.picture}</p>
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
              Total: ${cart.reduce((sum, beat) => sum + beat.price, 0).toFixed(2)}
            </div>
            <div className="space-x-4">
              <button
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                onClick={() => navigate("/beats")}
              >
                Continue Shopping
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
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
