import React, { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { AuthContext } from '../../../Context/AuthContext';
import { 
    FaTrash, FaEye, FaUtensils, FaCalendarAlt, FaChevronRight, 
    FaTimes, FaStar, FaPaperPlane, FaClock, FaFire 
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Link } from 'react-router';

const PersonalCookbook = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [userRating, setUserRating] = useState(5);
    const [comment, setComment] = useState("");

    const { data: cookbook = [], isLoading } = useQuery({
        queryKey: ['cookbook', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/cookbook/${user?.email}`);
            return res.data;
        },
        enabled: !!user?.email
    });

    const { data: reviewData = { reviews: [], stats: { avgRating: 0 } }, refetch: refetchReviews } = useQuery({
        queryKey: ["reviews", selectedRecipe?._id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/reviews/${selectedRecipe._id}`);
            return res.data;
        },
        enabled: !!selectedRecipe,
    });

    const removeMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.delete(`/cookbook/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cookbook', user?.email]);
            Swal.fire("Removed!", "Recipe removed from your collection.", "success");
            setSelectedRecipe(null);
        }
    });

    const postReviewMutation = useMutation({
        mutationFn: (newReview) => axiosSecure.post("/reviews", newReview),
        onSuccess: () => {
            Swal.fire("Review Submitted!", "Pending admin approval.", "success");
            setComment("");
            setUserRating(5);
            refetchReviews();
        }
    });

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        postReviewMutation.mutate({
            recipeId: selectedRecipe._id,
            rating: userRating,
            comment,
            userName: user?.displayName || user?.name,
            userEmail: user?.email,
            userImage: user?.photoURL || user?.profileImage
        });
    };

    const handleRemove = (id) => {
        Swal.fire({
            title: 'Remove Recipe?',
            text: "This will take it out of your collection.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) removeMutation.mutate(id);
        });
    };

    if (isLoading) {
        return (
            <div className="p-10 space-y-8 bg-base-100 min-h-screen">
                <div className="skeleton h-20 w-1/3 rounded-3xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((n) => <div key={n} className="skeleton h-80 w-full rounded-[2.5rem]"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-l-4 border-primary pl-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Culinary Collection</h1>
                    <p className="text-slate-500 font-medium mt-1">Your personally curated list of favorite flavors.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Saved</span>
                    <p className="text-2xl font-black text-primary">{cookbook.length} Recipes</p>
                </div>
            </header>

            {cookbook.length === 0 ? (
                <div className="hero min-h-[60vh] bg-white rounded-[3rem] shadow-xl border border-white text-center">
                    <div className="hero-content">
                        <div className="max-w-md">
                            <FaUtensils className="text-slate-200 text-6xl mx-auto mb-6" />
                            <h2 className="text-3xl font-black text-slate-800">Your cookbook is empty</h2>
                            <p className="py-6 text-slate-500">Start exploring and save the ones you love!</p>
                            <Link to="/dashboard/all-recipes" className="btn btn-primary px-8 rounded-2xl text-white font-bold gap-2">
                                Browse All Recipes <FaChevronRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cookbook.map((item) => (
                        <div key={item._id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                            <div className="relative h-56 overflow-hidden">
                                <img src={item.recipeId?.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <button 
                                    onClick={() => handleRemove(item._id)}
                                    className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md text-red-500 rounded-2xl shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <span className="text-[10px] font-black text-primary uppercase mb-2 block">{item.recipeId?.category}</span>
                                <h3 className="text-lg font-black text-slate-800 mb-6 line-clamp-2">{item.recipeId?.title}</h3>
                                <div className="mt-auto space-y-4">
                                    <button 
                                        onClick={() => setSelectedRecipe(item.recipeId)}
                                        className="btn btn-slate-100 btn-block rounded-2xl text-slate-700 border-none font-bold hover:bg-primary hover:text-white transition-colors gap-2"
                                    >
                                        <FaEye size={14} /> View Details
                                    </button>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <FaCalendarAlt size={10} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">
                                            Added {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <input type="checkbox" checked={!!selectedRecipe} readOnly className="modal-toggle" />
            {selectedRecipe && (
                <div className="modal modal-bottom sm:modal-middle backdrop-blur-md">
                    <div className="modal-box max-w-5xl p-0 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto border border-base-300 shadow-2xl bg-base-100">
                        <div className="md:w-5/12 h-64 md:h-auto">
                            <img src={selectedRecipe.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="md:w-7/12 p-8 md:p-10 overflow-y-auto flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="badge badge-primary badge-outline font-bold mb-2">{selectedRecipe.category}</span>
                                    <h3 className="text-3xl font-black tracking-tight">{selectedRecipe.title}</h3>
                                </div>
                                <button onClick={() => setSelectedRecipe(null)} className="btn btn-circle btn-sm btn-ghost"><FaTimes /></button>
                            </div>

                            <div className="flex gap-4 mb-8">
                                <span className="flex items-center gap-1 text-xs font-bold opacity-60"><FaClock className="text-primary"/> {selectedRecipe.cookingTime}</span>
                                <span className="flex items-center gap-1 text-xs font-bold opacity-60"><FaFire className="text-accent"/> {selectedRecipe.calories} kcal</span>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 mb-8">
                                <h4 className="font-bold text-sm mb-3">Rate this Recipe</h4>
                                <div className="rating rating-sm gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <input key={num} type="radio" name="modal-rating" className="mask mask-star-2 bg-orange-400" checked={userRating === num} onChange={() => setUserRating(num)} />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a review..." className="input input-bordered w-full rounded-2xl" />
                                    <button onClick={handleReviewSubmit} disabled={postReviewMutation.isPending} className="btn btn-primary btn-circle text-white shadow-lg"><FaPaperPlane /></button>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-xl font-bold mb-4 flex justify-between items-center">
                                    Reviews <span className="text-sm font-normal opacity-50">Avg: {reviewData.stats.avgRating.toFixed(1)} ⭐</span>
                                </h4>
                                <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {reviewData.reviews.length > 0 ? reviewData.reviews.map((rev) => (
                                        <div key={rev._id} className="p-4 bg-base-200/50 rounded-2xl flex gap-4 border border-base-200">
                                            <img src={rev.userImage} className="w-10 h-10 rounded-full" alt="" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-bold">{rev.userName}</span>
                                                    <span className="text-xs text-orange-500 font-bold flex items-center gap-1"><FaStar /> {rev.rating}</span>
                                                </div>
                                                <p className="text-sm opacity-75 italic">"{rev.comment}"</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-center opacity-40 text-sm italic">No reviews yet.</p>}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-lg font-bold mb-3">Ingredients</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRecipe.ingredients?.map((ing, i) => (
                                        <span key={i} className="badge badge-ghost p-3 h-auto">{ing.name} ({ing.quantity})</span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t flex gap-4">
                                <button className="btn btn-disabled flex-1 h-14 rounded-2xl bg-slate-100 text-slate-400 border-none">
                                    Already in Cookbook
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

export default PersonalCookbook;