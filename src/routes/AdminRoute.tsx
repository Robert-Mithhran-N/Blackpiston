import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated || !isAdmin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, admin: true }}
      />
    );
  }

  return <Outlet />;
};

export default AdminRoute;


