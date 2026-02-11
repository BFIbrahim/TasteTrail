import React from 'react';
import { useQuery } from '@tanstack/react-query';

import {
    FaUsers, FaUtensils, FaStar, FaBookmark,
    FaDownload, FaHistory
} from 'react-icons/fa';
import {
    ResponsiveContainer, Tooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';

const AdminDashboard = () => {
    const axiosSecure = useAxiosSecure();

    const { data: stats = {}, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/admin-stats');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(n => <div key={n} className="skeleton h-32 w-full rounded-3xl"></div>)}
                </div>
                <div className="skeleton h-96 w-full rounded-[2.5rem]"></div>
                <div className="skeleton h-64 w-full rounded-[2.5rem]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Insights</h1>
                    <p className="text-slate-500 font-medium">Monitoring TasteTrail performance and growth.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="stats shadow-sm border border-slate-100 rounded-[2rem] bg-white p-2">
                    <div className="stat">
                        <div className="stat-figure text-primary opacity-20"><FaUsers size={40} /></div>
                        <div className="stat-title font-bold text-slate-400">Total Users</div>
                        <div className="stat-value text-primary">{stats?.totalUsers || 0}</div>
                        <div className="stat-desc font-medium text-success">↗︎ 12% increase</div>
                    </div>
                </div>

                <div className="stats shadow-sm border border-slate-100 rounded-[2rem] bg-white p-2">
                    <div className="stat">
                        <div className="stat-figure opacity-20"><FaUtensils size={40} /></div>
                        <div className="stat-title font-bold text-slate-400">Total Recipes</div>
                        <div className="stat-value">{stats?.totalRecipes || 0}</div>
                        <div className="stat-desc font-medium">Community uploads</div>
                    </div>
                </div>

                <div className="stats shadow-sm border border-slate-100 rounded-[2rem] bg-white p-2">
                    <div className="stat">
                        <div className="stat-figure text-accent opacity-20"><FaStar size={40} /></div>
                        <div className="stat-title font-bold text-slate-400">Total Reviews</div>
                        <div className="stat-value text-accent">{stats?.totalReviews || 0}</div>
                        <div className="stat-desc font-medium text-accent">4.8 Avg Rating</div>
                    </div>
                </div>

                <div className="stats shadow-sm border border-slate-100 rounded-[2rem] bg-white p-2">
                    <div className="stat">
                        <div className="stat-figure text-info opacity-20"><FaBookmark size={40} /></div>
                        <div className="stat-title font-bold text-slate-400">Cookbook Saves</div>
                        <div className="stat-value text-info">{stats?.totalSaves || 0}</div>
                        <div className="stat-desc font-medium text-slate-400">User engagement</div>
                    </div>
                </div>
            </div>

            <div className="mb-10">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <span className="w-2 h-8 bg-secondary rounded-full"></span>
                            User Growth Analytics
                        </h3>
                        <div className="badge badge-outline text-slate-400 p-3">Last 6 Months</div>
                    </div>
                    
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.userGrowth || []}>
                                <defs>
                                    <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F000B8" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#F000B8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="users" 
                                    stroke="#F000B8" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorUser)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <FaHistory className="text-slate-400" /> Recent Activities
                    </h3>
                    
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-slate-50/50">
                            <tr className="text-slate-400 uppercase text-[11px] tracking-widest border-none">
                                <th className="pl-8 py-4">Entity</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th className="pr-8">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats?.recentActivities || []).map((activity, idx) => (
                                <tr key={idx} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                    <td className="pl-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-slate-100 text-slate-500 rounded-full w-10 group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <span className="text-xs font-bold uppercase">{activity.name.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-slate-700">{activity.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-ghost rounded-lg font-medium py-3 px-4">{activity.type}</span></td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-success"></div>
                                            <span className="text-sm font-semibold text-slate-600">Success</span>
                                        </div>
                                    </td>
                                    <td className="pr-8 text-slate-400 text-sm font-medium">
                                        {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;