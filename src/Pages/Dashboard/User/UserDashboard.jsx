import React, { useContext, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    FaFire, FaUtensils, FaStar, FaArrowRight,
    FaTimes, FaPaperPlane, FaBookmark, FaHashtag, FaBolt
} from 'react-icons/fa';
import { AuthContext } from "../../../Context/AuthContext";
import Swal from 'sweetalert2';
import { Link } from 'react-router';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';

const UserDashboard = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useContext(AuthContext);

    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [userRating, setUserRating] = useState(5);
    const [comment, setComment] = useState("");

    const { data: meals = [] } = useQuery({
        queryKey: ['meal-planner-stats', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/meal-planner?email=${user?.email}`);
            // Logic to ensure an array is returned
            if (Array.isArray(res.data)) return res.data;
            if (res.data && Array.isArray(res.data.meals)) return res.data.meals;
            return []; // Fallback to empty array
        },
        enabled: !!user?.email
    });

    const { data: recommended = [] } = useQuery({
        queryKey: ['recommended-recipes'],
        queryFn: async () => {
            const res = await axiosSecure.get('/recipes/recommended');
            // Ensure we always return an array even if the structure is nested
            return Array.isArray(res.data) ? res.data : (res.data.recipes || []);
        }
    });

    const { data: reviewData = { reviews: [], stats: { avgRating: 0, totalReviews: 0 } }, refetch: refetchReviews } = useQuery({
        queryKey: ["reviews", selectedRecipe?._id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/reviews/${selectedRecipe._id}`);
            return res.data;
        },
        enabled: !!selectedRecipe,
    });

    const addToCookbookMutation = useMutation({
        mutationFn: async (recipeId) => {
            const res = await axiosSecure.post("/cookbook", {
                recipeId: recipeId,
                userEmail: user?.email,
            });
            return res.data;
        },
        onSuccess: (data) => {
            if (data.alreadySaved) {
                Swal.fire({ title: "Already Saved", text: "Check your cookbook!", icon: "info" });
            } else {
                Swal.fire({ title: "Saved!", icon: "success", showConfirmButton: false, timer: 1500 });
            }
        }
    });

    const postReviewMutation = useMutation({
        mutationFn: (newReview) => axiosSecure.post("/reviews", newReview),
        onSuccess: () => {
            Swal.fire({ title: "Submitted!", text: "Review pending approval.", icon: "success", timer: 2000 });
            setComment("");
            refetchReviews();
        }
    });

    const daysOrder = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const caloriesData = daysOrder.map(day => {
        const dayMeals = meals.filter(m => m.day === day);
        const totalCalories = dayMeals.reduce((sum, m) => sum + (m.recipeId?.calories || 0), 0);
        return { day: day.substring(0, 3), calories: totalCalories };
    });

    const totalWeeklyCalories = caloriesData.reduce((sum, item) => sum + item.calories, 0);

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        postReviewMutation.mutate({
            recipeId: selectedRecipe._id,
            rating: userRating,
            comment,
            userName: user?.displayName,
            userEmail: user?.email,
            userImage: user?.photoURL
        });
    };

    return (
        <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen space-y-12">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card bg-white shadow-2xl rounded-[2.5rem] p-8 border border-white relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-primary/10 text-primary rounded-2xl"><FaFire size={20} /></div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Weekly Calories</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activity Overview</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl px-6 py-3 flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg text-white"><FaBolt size={14} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Total Calories</p>
                                <p className="text-xl font-black text-slate-800">{totalWeeklyCalories.toLocaleString()} <span className="text-xs font-medium text-slate-400">kcal</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="h-72 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={caloriesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="calories" fill="#2dc653" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card bg-slate-900 shadow-2xl rounded-[2.5rem] p-8 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="mb-6 inline-flex p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                            <FaUtensils size={24} className="text-primary" />
                        </div>
                        <h2 className="text-3xl font-black mb-2">Ready to Cook?</h2>
                        <p className="opacity-70 mb-8 text-sm leading-relaxed">You have {meals.length} meals planned for this week. Keep up the healthy momentum!</p>
                        <Link to="/dashboard/meal-planner" className="btn btn-primary border-none text-white rounded-2xl px-10 h-14 shadow-lg shadow-primary/20">Open Planner</Link>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                        <FaUtensils size={240} />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="border-l-4 border-primary pl-6">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recommended For You</h2>
                        <p className="text-slate-400 text-sm font-medium">Curated dishes based on your preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Array.isArray(recommended) && recommended.map((recipe) => (
                        <div key={recipe._id} className="group ...">
                            <div key={recipe._id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                                <div className="relative h-56 overflow-hidden">
                                    <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                    <div className="absolute top-4 left-4">
                                        <span className="badge badge-accent text-white font-bold py-3 px-4 border-none shadow-lg gap-1.5">
                                            <FaStar className="text-[10px]" /> {recipe.rating || "NEW"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 block">{recipe.category}</span>
                                    <h3 className="font-black text-slate-800 mb-6 line-clamp-1 text-lg">{recipe.title}</h3>
                                    <button
                                        onClick={() => setSelectedRecipe(recipe)}
                                        className="btn btn-primary btn-block rounded-2xl text-white font-bold shadow-md shadow-primary/10 border-none h-12"
                                    >
                                        Details <FaArrowRight size={12} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <input type="checkbox" checked={!!selectedRecipe} readOnly className="modal-toggle" />
            {selectedRecipe && (
                <div className="modal modal-bottom sm:modal-middle backdrop-blur-md">
                    <div className="modal-box max-w-5xl p-0 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto border border-base-300 shadow-2xl">
                        <div className="md:w-5/12 h-64 md:h-auto overflow-hidden">
                            <img src={selectedRecipe.image} className="w-full h-full object-cover" alt="" />
                        </div>

                        <div className="md:w-7/12 p-8 md:p-10 overflow-y-auto bg-base-100 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="badge badge-primary badge-outline font-black px-4 py-3 mb-3 text-[10px] uppercase tracking-widest">{selectedRecipe.category}</span>
                                    <h3 className="text-3xl font-black tracking-tight text-slate-800 leading-tight">{selectedRecipe.title}</h3>
                                </div>
                                <button onClick={() => setSelectedRecipe(null)} className="btn btn-circle btn-sm btn-ghost bg-slate-100"><FaTimes /></button>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 mb-8">
                                <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-3">Rate this Recipe</h4>
                                <div className="rating rating-sm gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <input key={num} type="radio" name="dash-rating" className="mask mask-star-2 bg-orange-400" checked={userRating === num} onChange={() => setUserRating(num)} />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a review..." className="input input-bordered w-full rounded-2xl focus:outline-primary border-slate-200" />
                                    <button onClick={handleReviewSubmit} className="btn btn-primary btn-circle shadow-lg text-white"><FaPaperPlane /></button>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><FaHashtag className="text-primary" size={14} /> Reviews</h4>
                                <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {reviewData.reviews.length > 0 ? reviewData.reviews.map((rev) => (
                                        <div key={rev._id} className="p-4 bg-slate-50 rounded-2xl flex gap-4 border border-slate-100">
                                            <img src={rev.userImage} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs font-black mb-1">
                                                    <span className="text-slate-700">{rev.userName}</span>
                                                    <span className="text-orange-500 flex items-center gap-1 font-black bg-orange-50 px-2 py-0.5 rounded-lg"><FaStar size={10} /> {rev.rating}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed italic">"{rev.comment}"</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-xs font-bold text-slate-400 italic">No reviews yet. Be the first to rate!</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => addToCookbookMutation.mutate(selectedRecipe._id)}
                                    disabled={addToCookbookMutation.isPending}
                                    className="btn btn-primary flex-1 h-14 rounded-2xl text-white shadow-xl shadow-primary/20 border-none font-black text-sm uppercase tracking-widest"
                                >
                                    <FaBookmark /> {addToCookbookMutation.isPending ? "Saving..." : "Save to Cookbook"}
                                </button>
                                <button onClick={() => setSelectedRecipe(null)} className="btn btn-ghost h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-400">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;