import React, { createContext, useReducer, useContext } from 'react';
import { useUser } from './UserContext'; // user context for authentication check
import { toast } from 'react-toastify';

// Creating context for cart management
const CartContext = createContext();

// Reducer function to manage cart state
const cartReducer = (state, action) => {
  switch (action.type) {
    // Add item to cart 
    case 'ADD_TO_CART':
      if (state.find(item => item._id === action.payload._id)) {
        return state;
      }
      return [...state, action.payload];
    
    // Remove specific item from cart
    case 'REMOVE_FROM_CART':
      return state.filter(item => item._id !== action.payload);
    
    // Clear entire cart
    case 'CLEAR_CART':
      return [];
    
    // Load cart from storage
    case 'LOAD_CART':
      return action.payload;
    
    // Return current state if no matching action
    default:
      return state;
  }
};

// Provider component to manage cart state and operations
export const CartProvider = ({ children }) => {
  // Get authentication status
  const { isAuthenticated } = useUser();
  
  // Initialize cart state with reducer
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Load cart from localStorage on component mount
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

  // Function to add item to cart with authentication check
  const addToCart = (item) => {
    if (!isAuthenticated()) {
      toast.error('Please login to add beats to cart');
      return false;
    }
    dispatch({ type: 'ADD_TO_CART', payload: item });
    return true;
  };
  
  // Function to remove item from cart
  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    // Commented out toast for success notification
  };
  
  // Function to clear entire cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cart');
    // Commented out toast for success notification
  };

  // Provide cart context to children components
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
