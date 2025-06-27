import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const token = Cookies.get("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || !user?.role) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
