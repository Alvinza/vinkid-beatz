import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  if (!user || !user.isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
