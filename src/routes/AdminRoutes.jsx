import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../Context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)
  const location = useLocation();

  if (loading) {
    return <span className="loading loading-spinner text-primary"></span>;
  }

  if (!user) {
    return (
      <Navigate
        to="/"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to="/forbidden"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
};

export default AdminRoute;