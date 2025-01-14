import React, { createContext, useReducer, useContext } from 'react';
import { useUser } from './UserContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      if (state.find(item => item._id === action.payload._id)) {
        return state;
      }
      return [...state, action.payload];

    case 'REMOVE_FROM_CART':
      return state.filter(item => item._id !== action.payload);

    case 'CLEAR_CART':
      return [];

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useUser();
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    if (!isAuthenticated()) {
      toast.error('Please login to add beats to cart');
      return false;
    }
    dispatch({ type: 'ADD_TO_CART', payload: item });
    return true;
  };
  
  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    // toast.success('Item removed from cart');
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cart');
    // toast.success('Cart cleared');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};