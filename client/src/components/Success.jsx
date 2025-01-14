import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

const Success = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the cart when reaching success page
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful! 🎉🎉</h1>
      <p className="text-gray-600 mb-6">Thank you for your purchase.</p>
      <button
        onClick={() => navigate('/beats')}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Back to Store
      </button>
    </div>
  );
};

export default Success;