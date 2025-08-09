import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from './CartContext'; 

// Load Stripe with public key from environment variables
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  // Initialize Stripe and Elements hooks for payment processing
  const stripe = useStripe();
  const elements = useElements();

  // State management for payment processing and messaging
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  // Access cart items from CartContext
  const { cart } = useCart();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate Stripe initialization and cart items
    if (!stripe || !elements || cart.length === 0) {
      setMessage('No items in cart');
      return;
    }

    // Set processing state and clear previous messages
    setIsProcessing(true);
    setMessage('');

    try {
      // Create checkout session on the backend
      const response = await fetch('https://vinkid-beatz-backend.onrender.com/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cart
        }),
      });

      // Handle potential errors in session creation
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      // Extract session ID and redirect to Stripe Checkout
      const { sessionId } = await response.json();
      
      const result = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      // Handle any redirect errors
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      // Log and display any payment errors
      console.error('Payment error:', error);
      setMessage(error.message);
    } finally {
      // Reset processing state
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
          // Display message if cart is empty
          <div className="text-center text-red-500">Your cart is empty</div>
        ) : (
          <>
            {/* Stripe card input element */}
            <div className="p-4 border rounded-md bg-gray-50">
              <CardElement className="p-2" />
            </div>
            
            {/* Calculate and display total cart price */}
            <div className="text-right text-lg font-bold">
              Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </div>
            
            {/* Submit button with dynamic state */}
            <button
              type="submit"
              disabled={!stripe || isProcessing || cart.length === 0}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </>
        )}
        
        {/* Display any error messages */}
        {message && (
          <div className="text-red-500 text-center">{message}</div>
        )}
      </form>
    </div>
  );
};

// Wrap CheckoutForm with Stripe Elements provider
const Payment = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Payment;
