import React, { createContext, useState, useEffect } from 'react';

// Create a context for user authentication and management
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    // Retrieve saved user data from browser's local storage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      // Store user data in localStorage when user logs in
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // Remove user data from localStorage when logged out
      localStorage.removeItem('user');
    }
  }, [user]);

  // Login method to update user state
  const login = (userData) => {
    setUser(userData);
  };

  // Logout method to clear user state
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Determine admin status (defaults to false if not specified)
  const isAdmin = user?.isAdmin || false;

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated,
      isAdmin // Expose admin status to consuming components
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to consume UserContext
export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    // Ensure hook is used within UserProvider
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
