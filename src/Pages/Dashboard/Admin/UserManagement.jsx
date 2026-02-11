import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaTrashAlt, FaUserShield, FaSearch, FaUsers, FaUserTag, FaEnvelope, FaCalendarDay, FaExclamationTriangle } from "react-icons/fa";

const UserManagement = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const { data: users = [], isLoading, isError, error } = useQuery({
        queryKey: ["users", activeTab],
        queryFn: async () => {
            const url = activeTab === "admin" ? "/users?role=admin" : "/users";
            const res = await axiosSecure.get(url);
            return res.data;
        }
    });

    const promoteMutation = useMutation({
        mutationFn: async (userId) => {
            const res = await axiosSecure.patch(`/users/admin/${userId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            Swal.fire({
                title: "Elevation Successful",
                text: "The user now has administrative privileges.",
                icon: "success",
                confirmButtonColor: "#2dc653",
            });
        },
        onError: (err) => {
            Swal.fire("Error", err.response?.data?.message || "Failed to promote user", "error");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId) => {
            const res = await axiosSecure.delete(`/users/${userId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            Swal.fire("Removed", "User account deleted successfully.", "success");
        }
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handlePromote = (user) => {
        Swal.fire({
            title: "Confirm Promotion",
            text: `Grant admin access to ${user.name}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2dc653",
            cancelButtonColor: "#f97316",
            confirmButtonText: "Yes, promote them"
        }).then((result) => {
            if (result.isConfirmed) {
                promoteMutation.mutate(user._id);
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f97316",
            confirmButtonText: "Yes, delete user"
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    return (
        <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Users</h1>
                        <p className="text-slate-500 font-medium">Manage your community and staff permissions.</p>
                    </div>
                    
                    <div className="stats shadow-sm border border-slate-200 rounded-3xl bg-white p-2">
                        <div className="stat px-8">
                            <div className="stat-title font-bold text-xs uppercase text-slate-400">Total Listed</div>
                            <div className="stat-value text-primary text-3xl">{users.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 justify-between items-center mb-6">
                <div className="tabs tabs-boxed bg-slate-200/50 p-1 rounded-2xl border border-slate-200/40">
                    <button 
                        onClick={() => setActiveTab("all")}
                        className={`tab tab-lg rounded-xl transition-all ${activeTab === "all" ? "bg-white shadow-md text-primary font-bold" : "text-slate-500"}`}
                    >
                        All Members
                    </button>
                    <button 
                        onClick={() => setActiveTab("admin")}
                        className={`tab tab-lg rounded-xl transition-all ${activeTab === "admin" ? "bg-white shadow-md text-primary font-bold" : "text-slate-500"}`}
                    >
                        Admins Only
                    </button>
                </div>

                <div className="relative w-full lg:w-96 group">
                    <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="input input-lg w-full pl-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="py-6 pl-10 text-slate-400 font-bold uppercase text-[10px] tracking-[0.15em]">User Identity</th>
                                <th className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.15em]">Role Status</th>
                                <th className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.15em]">Joined</th>
                                <th className="text-right pr-10 text-slate-400 font-bold uppercase text-[10px] tracking-[0.15em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="pl-10 py-5"><div className="flex gap-4 items-center"><div className="skeleton w-12 h-12 rounded-full"></div><div className="space-y-2"><div className="skeleton h-4 w-32"></div><div className="skeleton h-3 w-48"></div></div></div></td>
                                        <td><div className="skeleton h-8 w-24 rounded-lg"></div></td>
                                        <td><div className="skeleton h-4 w-20"></div></td>
                                        <td className="pr-10"><div className="skeleton h-10 w-24 ml-auto rounded-xl"></div></td>
                                    </tr>
                                ))
                            ) : isError ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-red-500">
                                        <FaExclamationTriangle className="mx-auto mb-4 text-4xl" />
                                        <p className="font-bold">Error loading users</p>
                                        <p className="text-sm opacity-70">{error?.message || "Check your backend connection"}</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/40 transition-colors group/row">
                                        <td className="pl-10 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="avatar">
                                                    <div className="w-14 h-14 rounded-2xl border-2 border-slate-100 shadow-sm">
                                                        <img src={user.profileImage || user.image || "https://i.ibb.co/mJR7z9Y/user.png"} alt="" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-800 text-base">{user.name}</div>
                                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                                                        <FaEnvelope size={10} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`badge badge-lg gap-2 px-4 py-4 border-none font-black text-[10px] uppercase tracking-wider ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                                {user.role === 'admin' ? <FaUserShield /> : <FaUserTag />}
                                                {user.role || 'User'}
                                            </div>
                                        </td>
                                        <td className="text-slate-500 font-bold text-xs">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarDay className="text-slate-300" />
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                                            </div>
                                        </td>
                                        <td className="pr-10">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.role !== 'admin' && (
                                                    <button 
                                                        disabled={promoteMutation.isPending}
                                                        onClick={() => handlePromote(user)}
                                                        className="btn btn-sm h-10 bg-secondary/50 text-primary hover:bg-primary hover:text-white border-none rounded-xl font-bold px-4 disabled:opacity-50"
                                                    >
                                                        {promoteMutation.isPending && user._id === promoteMutation.variables ? '...' : 'Promote'}
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(user._id)}
                                                    className="btn btn-square btn-sm h-10 w-10 btn-ghost text-slate-300 hover:text-accent hover:bg-accent/5 transition-all rounded-xl"
                                                >
                                                    <FaTrashAlt size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <FaUsers size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800">No results found</h3>
                                            <p className="text-slate-400 text-sm mt-1">We couldn't find any users matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;