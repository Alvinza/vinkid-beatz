import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from './CartContext'; // Import cart context hook

function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Calculate total cart price
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleBuy = () => {
    navigate('/payment');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {/* Show empty cart message */}
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">Your cart is empty!</p>
          <button 
            onClick={() => navigate('/beats')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Browse Beats
          </button>
        </div>
      ) : (
        <div>
          {/* List cart items */}
          <div className="space-y-4">
            {cart.map((item) => (
              <div 
                key={item._id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow max-w-3xl"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://vinkid-beatz-backend.onrender.com${item.picture}`}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-gray-600">Genre: {item.genre}</p>
                    <p className="text-blue-600 font-semibold">${item.price}</p>
                  </div>
                </div>
                {/* Remove item button */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

           {/* Total price & actions */}
          <div className="mt-8 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex space-x-4 justify-end">
              {/* Clear all items */}
              <button
                onClick={clearCart}
                className="btn btn-outline-secondary transition duration-300"
              >
                Clear Cart
              </button>
              <button
                onClick={handleBuy}
                className="btn btn-primary ml-2"
              >
                Proceed to Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
