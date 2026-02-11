import React, { useContext, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { 
    FaFire, FaUtensils, FaStar, FaArrowRight, 
    FaTimes, FaPaperPlane, FaBookmark, 
} from 'react-icons/fa';
import { AuthContext } from "../../../Context/AuthContext";
import Swal from 'sweetalert2';

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
            return res.data;
        },
        enabled: !!user?.email
    });

    const { data: recommended = [] } = useQuery({
        queryKey: ['recommended-recipes'],
        queryFn: async () => {
            const res = await axiosSecure.get('/recipes/recommended');
            return res.data;
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

    const COLORS = ['#2dc653', '#041c38', '#f97316', '#c7f9cc'];

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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card bg-white shadow-2xl rounded-[2.5rem] p-8 border border-white">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-primary/10 text-primary rounded-2xl"><FaFire size={20} /></div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Weekly Calories</h2>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={caloriesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '15px', border: 'none'}} />
                                <Bar dataKey="calories" fill="#2dc653" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card bg-slate-900 shadow-2xl rounded-[2.5rem] p-8 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-2">Ready to Cook?</h2>
                        <p className="opacity-70 mb-6">You have {meals.length} meals planned for this week.</p>
                        <button className="btn btn-primary rounded-2xl px-8 border-none text-white">Open Planner</button>
                    </div>
                    <FaUtensils className="absolute -bottom-10 -right-10 text-white/5 size-60" />
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="text-3xl font-black text-slate-900 border-l-4 border-primary pl-6">Recommended For You</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {recommended.map((recipe) => (
                        <div key={recipe._id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                            <div className="relative h-56 overflow-hidden">
                                <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                <div className="absolute top-4 left-4">
                                    <span className="badge badge-accent text-white font-bold py-3 border-none shadow-lg">
                                        {recipe.rating || "NEW"} <FaStar className="ml-1 text-[10px]" />
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-black text-slate-800 mb-4 line-clamp-1">{recipe.title}</h3>
                                <button 
                                    onClick={() => setSelectedRecipe(recipe)}
                                    className="btn btn-primary btn-block rounded-2xl text-white font-bold"
                                >
                                    Details <FaArrowRight size={12} />
                                </button>
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

                        <div className="md:w-7/12 p-8 md:p-10 overflow-y-auto bg-base-100">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="badge badge-primary badge-outline font-bold mb-2">{selectedRecipe.category}</span>
                                    <h3 className="text-3xl font-black tracking-tight">{selectedRecipe.title}</h3>
                                </div>
                                <button onClick={() => setSelectedRecipe(null)} className="btn btn-circle btn-sm btn-ghost"><FaTimes /></button>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 mb-8">
                                <h4 className="font-bold text-sm mb-3">Rate this Recipe</h4>
                                <div className="rating rating-sm gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <input key={num} type="radio" name="dash-rating" className="mask mask-star-2 bg-orange-400" checked={userRating === num} onChange={() => setUserRating(num)} />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a review..." className="input input-bordered w-full rounded-xl" />
                                    <button onClick={handleReviewSubmit} className="btn btn-primary btn-circle"><FaPaperPlane className="text-white"/></button>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-lg font-bold mb-4">Reviews</h4>
                                <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {reviewData.reviews.length > 0 ? reviewData.reviews.map((rev) => (
                                        <div key={rev._id} className="p-4 bg-base-200/50 rounded-2xl flex gap-4 border border-base-200">
                                            <img src={rev.userImage} className="w-8 h-8 rounded-full" alt="" />
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs font-bold mb-1">
                                                    <span>{rev.userName}</span>
                                                    <span className="text-orange-500 flex items-center gap-1"><FaStar size={10}/> {rev.rating}</span>
                                                </div>
                                                <p className="text-xs opacity-70 italic">"{rev.comment}"</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs opacity-40 italic">No reviews yet.</p>}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t flex gap-4">
                                <button
                                    onClick={() => addToCookbookMutation.mutate(selectedRecipe._id)}
                                    disabled={addToCookbookMutation.isPending}
                                    className="btn btn-primary flex-1 h-14 rounded-2xl text-white shadow-lg"
                                >
                                    <FaBookmark /> {addToCookbookMutation.isPending ? "Saving..." : "Save to Cookbook"}
                                </button>
                                <button onClick={() => setSelectedRecipe(null)} className="btn btn-ghost h-14 rounded-2xl">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;