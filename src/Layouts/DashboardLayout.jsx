import React, { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { FiMenu } from "react-icons/fi";

const DashboardLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="drawer lg:drawer-open">
      {/* Drawer Toggle */}
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Page Content */}
      <div className="drawer-content flex flex-col">
        {/* Mobile Navbar */}
        <div className="navbar bg-base-100 shadow-md lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="dashboard-drawer"
              className="btn btn-ghost text-xl"
            >
              <FiMenu />
            </label>
          </div>
          <div className="flex-1">
            <span className="text-lg font-semibold">Dashboard</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <h1 className="text-2xl font-bold">
            Welcome {user?.name || "User"}
          </h1>
          <p className="mt-2 text-gray-500">
            Dashboard main content goes here
          </p>
        </div>
      </div>

      <div className="drawer-side">
        <label
          htmlFor="dashboard-drawer"
          className="drawer-overlay"
        ></label>

        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          <li><a>Dashboard</a></li>
          <li><a>Profile</a></li>
          <li><a>Settings</a></li>
          <li><a>Logout</a></li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
