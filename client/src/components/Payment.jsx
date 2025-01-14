import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from './CartContext'; // Update this path based on your file structure
// import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const { cart } = useCart(); // Using the custom hook
  // const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || cart.length === 0) {
      setMessage('No items in cart');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cart
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const { sessionId } = await response.json();
      
      const result = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Payment Information
        </h2>
        {cart.length === 0 ? (
          <div className="text-center text-red-500">Your cart is empty</div>
        ) : (
          <>
            <div className="p-4 border rounded-md bg-gray-50">
              <CardElement className="p-2" />
            </div>
            <div className="text-right text-lg font-bold">
              Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </div>
            <button
              type="submit"
              disabled={!stripe || isProcessing || cart.length === 0}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </>
        )}
        {message && (
          <div className="text-red-500 text-center">{message}</div>
        )}
      </form>
    </div>
  );
};

const Payment = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Payment;