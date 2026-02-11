import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import AdminDashboard from "../Pages/Dashboard/Admin/AdminDashboard";
import UserDashboard from "../Pages/Dashboard/User/UserDashboard";

const DashboardIndex = () => {
  const { user } = useContext(AuthContext)
  const role = user?.role;

  if (role === 'admin') {
    return <AdminDashboard />
  }

  return <UserDashboard />
};

export default DashboardIndex