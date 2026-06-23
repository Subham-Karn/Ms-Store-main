import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoutes = ({ children, allowedRoles }) => {
  const { user } = useSelector(state=>state.user);

  if (!user) {
    console.log("gooing tru");
    
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  
  if (allowedRoles.includes(role)) {
    return children;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoutes;
