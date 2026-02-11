import React, { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { FiMenu } from "react-icons/fi";
import { MdCalendarMonth, MdCategory, MdKitchen, MdOutlineStar, MdRestaurantMenu, MdSpaceDashboard, MdLogout } from "react-icons/md";
import { NavLink, Outlet, useNavigate } from "react-router";
import { FaBook, FaUsers } from "react-icons/fa";
import Swal from "sweetalert2";

const DashboardLayout = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        Swal.fire({
            title: "Sign Out?",
            text: "Are you sure you want to log out?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f97316",
            cancelButtonColor: "#cbd5e1",
            confirmButtonText: "Yes, Logout",
        }).then((result) => {
            if (result.isConfirmed) {
                logoutUser().then(() => {
                    navigate("/");
                    Swal.fire({
                        title: "Logged Out",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                });
            }
        });
    };

    return (
        <div className="drawer lg:drawer-open bg-base-100 text-base-content">
            <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col">
                <div className="navbar bg-base-100 border-b border-neutral/30 lg:hidden">
                    <div className="flex-none">
                        <label htmlFor="dashboard-drawer" className="btn btn-ghost text-primary text-xl">
                            <FiMenu />
                        </label>
                    </div>
                    <div className="flex-1">
                        <span className="text-lg font-semibold text-primary">Dashboard</span>
                    </div>
                </div>
                <Outlet />
            </div>

            <div className="drawer-side">
                <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>

                <aside className="w-80 min-h-full bg-secondary border-r border-primary/20 flex flex-col">
                    
                    <div className="flex items-center gap-3 p-5 border-b border-primary/20">
                        <div className="avatar">
                            <div className="w-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                                <img src={user?.profileImage || "https://i.ibb.co/2kR2zq0/user.png"} alt="User" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary leading-tight">{user?.name || "Guest User"}</h3>
                            <p className="text-sm text-neutral">Dashboard User</p>
                        </div>
                    </div>

                    <ul className="menu p-4 w-full flex-1 gap-1">
                        <li>
                            <NavLink to="/dashboard" end className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent/40 hover:text-black ${isActive ? "bg-primary/40 text-black" : "text-gray-700"}`}>
                                <MdSpaceDashboard /> Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/manage-recipe" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent/40 hover:text-black ${isActive ? "bg-primary/40 text-black" : "text-gray-700"}`}>
                                <MdRestaurantMenu /> Manage Recipes
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/manage-categories" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent/40 hover:text-black ${isActive ? "bg-primary/40 text-black" : "text-gray-700"}`}>
                                <MdCategory /> Manage Categories
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/all-recipes" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent/40 hover:text-black ${isActive ? "bg-primary/40 text-black" : "text-gray-700"}`}>
                                <MdKitchen /> All Recipes
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/manage-reviews" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent/40 hover:text-black ${isActive ? "bg-primary/40 text-black" : "text-gray-700"}`}>
                                <MdOutlineStar /> Manage Reviews
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/meal-planner" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent/40 hover:text-black ${isActive ? "bg-primary/40 text-black" : "text-gray-700"}`}>
                                <MdCalendarMonth /> Meal Planner
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/manage-users" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent/40 hover:text-black ${isActive ? "bg-primary/40 text-black" : "text-gray-700"}`}>
                                <FaUsers /> Manage Users
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/dashboard/personal-cookbook" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-accent/40 hover:text-black ${isActive ? "bg-primary/40 text-black" : "text-gray-700"}`}>
                                <FaBook /> Personal Cookbook
                            </NavLink>
                        </li>
                    </ul>

                    <div className="p-4 border-t border-primary/10">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full rounded-lg px-3 py-3 transition text-gray-700 hover:bg-red-50 hover:text-red-600 font-bold"
                        >
                            <MdLogout className="text-xl" />
                            Logout
                        </button>
                    </div>

                </aside>
            </div>
        </div>
    );
};

export default DashboardLayout;