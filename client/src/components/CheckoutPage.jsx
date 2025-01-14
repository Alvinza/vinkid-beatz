import axios from 'axios';
import { useCart } from './CartContext';

function CheckoutPage() {
  const { cart } = useCart();

  const handlePayment = async () => {
    try {
      const response = await axios.post('http://localhost:5000/create-checkout-session', { cart });
      window.location.href = response.data.url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      {cart.length > 0 ? (
        <div>
          {cart.map(item => (
            <div key={item._id}>
              <h2>{item.title}</h2>
              <p>${item.price}</p>
            </div>
          ))}
          <button onClick={handlePayment}>Pay Now</button>
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
}

export default CheckoutPage;