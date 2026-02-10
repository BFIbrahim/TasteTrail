import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import {
    FaClock, FaFire, FaStar,
    FaBookmark, FaTimes, FaPaperPlane
} from "react-icons/fa";
import { AuthContext } from "../../../Context/AuthContext";

const AllRecipes = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useContext(AuthContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const [userRating, setUserRating] = useState(5);
    const [comment, setComment] = useState("");

    const { data: recipes = [], isLoading } = useQuery({
        queryKey: ["all-recipes"],
        queryFn: async () => {
            const res = await axiosSecure.get("/recipes");
            return res.data;
        },
    });

    const { data: reviewData = { reviews: [], stats: { avgRating: 0, totalReviews: 0 } }, refetch: refetchReviews } = useQuery({
        queryKey: ["reviews", selectedRecipe?._id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/reviews/${selectedRecipe._id}`);
            return res.data;
        },
        enabled: !!selectedRecipe,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await axiosSecure.get("/categories");
            return res.data;
        },
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
                Swal.fire({
                    title: "Already Saved",
                    text: "You've already added this to your cookbook!",
                    icon: "info",
                    confirmButtonColor: "#3085d6",
                });
            } else {
                Swal.fire({
                    title: "Saved!",
                    text: "Recipe added to your cookbook.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        },
        onError: () => {
            Swal.fire("Error", "Could not save recipe at this time.", "error");
        }
    });

    const postReviewMutation = useMutation({
        mutationFn: (newReview) => axiosSecure.post("/reviews", newReview),
        onSuccess: () => {
            Swal.fire({
                title: "Review Submitted!",
                text: "Your feedback is now pending admin approval.",
                icon: "success",
                confirmButtonColor: "#2dc653",
                timer: 3000
            });
            setComment("");
            setUserRating(5);
            refetchReviews();
        },
        onError: (err) => {
            Swal.fire("Error", err.response?.data?.message || "Failed to post review", "error");
        }
    });

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!user) return Swal.fire("Access Denied", "Please login to review.", "warning");
        if (!comment.trim()) return Swal.fire("Empty Comment", "Please write something first!", "info");

        postReviewMutation.mutate({
            recipeId: selectedRecipe._id,
            rating: userRating,
            comment,
            userName: user?.name || user?.displayName,
            userEmail: user?.email,
            userImage: user?.profileImage || user?.photoURL
        });
    };

    const handleSaveToCookbook = () => {
        if (!user) return Swal.fire("Login Required", "Please login to save recipes!", "warning");
        addToCookbookMutation.mutate(selectedRecipe._id);
    };

    const filteredRecipes = recipes.filter((recipe) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = recipe.title.toLowerCase().includes(searchLower) || recipe.cuisine.toLowerCase().includes(searchLower);
        const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-base-200 pb-20">
            <div className="bg-primary pt-16 pb-28 px-4 text-center text-primary-content relative overflow-hidden">
                <h1 className="text-4xl md:text-6xl font-black mb-4 relative z-10 text-white">
                    Taste <span className="text-accent">Trail</span> Explorer
                </h1>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative z-20">
                    <input
                        type="text"
                        placeholder="Search by Dish or Cuisine..."
                        className="input w-full pl-6 h-14 bg-white/20 border-none text-white placeholder:text-white/60 focus:outline-none rounded-2xl"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="select h-14 bg-white/20 border-none text-white focus:outline-none rounded-2xl md:w-64"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option className="text-black" value="All">All Categories</option>
                        {categories.map(c => <option key={c._id} className="text-black" value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-30">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8"><div className="skeleton h-80 w-full rounded-3xl"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredRecipes.map((recipe) => (
                            <div key={recipe._id} className="group card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden border border-base-300">
                                <figure className="h-60 relative">
                                    <img src={recipe.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <button onClick={() => setSelectedRecipe(recipe)} className="btn btn-accent text-white btn-sm w-full rounded-xl shadow-lg">View Recipe</button>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="badge badge-accent text-white font-bold border-none shadow-md">{recipe.cuisine}</span>
                                    </div>
                                </figure>
                                <div className="card-body p-6">
                                    <h2 className="card-title text-lg font-bold line-clamp-2">{recipe.title}</h2>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-base-content/50 uppercase"><FaClock className="text-primary" /> {recipe.cookingTime}</span>
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-base-content/50 uppercase"><FaFire className="text-accent" /> {recipe.calories} kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <input type="checkbox" checked={!!selectedRecipe} readOnly className="modal-toggle" />
            {selectedRecipe && (
                <div className="modal modal-bottom sm:modal-middle backdrop-blur-md">
                    <div className="modal-box max-w-5xl p-0 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto border border-base-300 shadow-2xl">
                        <div className="md:w-5/12 h-64 md:h-auto"><img src={selectedRecipe.image} className="w-full h-full object-cover" /></div>
                        <div className="md:w-7/12 p-8 md:p-10 overflow-y-auto bg-base-100 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="badge badge-primary badge-outline font-bold px-3 mb-2">{selectedRecipe.category}</span>
                                    <h3 className="text-3xl font-black tracking-tight">{selectedRecipe.title}</h3>
                                </div>
                                <button onClick={() => setSelectedRecipe(null)} className="btn btn-circle btn-sm btn-ghost"><FaTimes /></button>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 mb-8">
                                <h4 className="font-bold text-sm mb-3">Rate this Trail</h4>
                                <div className="rating rating-md gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <input
                                            key={num} type="radio" name="modal-rating"
                                            className="mask mask-star-2 bg-orange-400"
                                            checked={userRating === num}
                                            onChange={() => setUserRating(num)}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text" value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Write a review..."
                                        className="input input-bordered w-full rounded-2xl"
                                    />
                                    <button
                                        onClick={handleReviewSubmit}
                                        disabled={postReviewMutation.isPending}
                                        className="btn btn-primary btn-circle shadow-lg"
                                    >
                                        <FaPaperPlane className="text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-xl font-bold mb-4 flex items-center justify-between">
                                    Reviews <span className="text-sm font-normal opacity-50">Avg: {reviewData.stats.avgRating.toFixed(1)} ⭐</span>
                                </h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
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
                                    )) : <p className="text-center opacity-40 py-4 text-sm italic">No approved reviews yet.</p>}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-lg font-bold mb-3">Ingredients</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRecipe.ingredients.map((ing, i) => (
                                        <span key={i} className="badge badge-ghost p-3 h-auto">{ing.name} ({ing.quantity})</span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto pt-8 border-t flex gap-4">
                                <button
                                    onClick={handleSaveToCookbook}
                                    disabled={addToCookbookMutation.isPending}
                                    className="btn btn-primary flex-1 h-14 rounded-2xl text-white shadow-lg shadow-primary/20"
                                >
                                    {addToCookbookMutation.isPending ? (
                                        <span className="loading loading-spinner"></span>
                                    ) : (
                                        <><FaBookmark /> Save to Cookbook</>
                                    )}
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

export default AllRecipes;