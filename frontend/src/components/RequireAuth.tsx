import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * If the user is not authenticated, redirect to /sign-in.
 * Otherwise render the child route/component.
 */
export const RequireAuth: React.FC = () => {
  const token = localStorage.getItem("access_token");
  const location = useLocation();

  if (!token) {
    // Redirect them to the /sign-in page, but save the current location they were
    // trying to go to. This allows us to send them along after they login.
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

 return <Outlet />;
};

export default RequireAuth;