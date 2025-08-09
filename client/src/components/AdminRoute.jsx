import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext"; // Import user context for authentication

// Higher-order component to protect admin routes
const AdminRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  
  // Redirect to login if user is not authenticated or not an admin
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" />;
  }
  // Render child components if user is an admin
  return children;
};
export default AdminRoute;
