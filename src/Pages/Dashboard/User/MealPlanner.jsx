import React, { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaPlus, FaTrash, FaHistory, FaSearch, FaTimes, FaCalendarAlt, FaCheckCircle, FaFireAlt, FaClock } from "react-icons/fa";
import { AuthContext } from "../../../Context/AuthContext";

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const MealPlanner = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [showHistory, setShowHistory] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null); 
    const [searchTerm, setSearchTerm] = useState("");

    const { data: meals = [], isLoading: mealsLoading } = useQuery({
        queryKey: ["meal-planner", user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/meal-planner?email=${user?.email}`);
            return res.data;
        },
        enabled: !!user?.email
    });

    const { data: allRecipes = [], isLoading: recipesLoading } = useQuery({
        queryKey: ["recipes-list"],
        queryFn: async () => {
            const res = await axiosSecure.get("/recipes");
            return res.data;
        }
    });

    const addMealMutation = useMutation({
        mutationFn: async (newMeal) => {
            const res = await axiosSecure.post("/meal-planner", { ...newMeal, userEmail: user?.email });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["meal-planner"]);
            setSelectedDay(null);
            Swal.fire({ title: "Added to Plan", icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        },
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, newStatus }) => {
            const res = await axiosSecure.patch(`/meal-planner/${id}`, { status: newStatus });
            return res.data;
        },
        onSuccess: () => queryClient.invalidateQueries(["meal-planner"])
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.delete(`/meal-planner/${id}`);
            return res.data;
        },
        onSuccess: () => queryClient.invalidateQueries(["meal-planner"])
    });

    const filteredRecipes = allRecipes?.filter(r => {
        if (!searchTerm) return true;
        return r.title?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const progressPercent = meals.length > 0 
        ? Math.round((meals.filter(m => m.status === "Cooked").length / meals.length) * 100) 
        : 0;

    if (mealsLoading) return <div className="h-screen flex items-center justify-center"><span className="loading loading-ring loading-lg text-primary"></span></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-4 mb-8 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                            <FaCalendarAlt size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Weekly Planner</h2>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Schedule your meals</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Completion</p>
                            <p className="text-xl font-black text-slate-800">{progressPercent}%</p>
                        </div>
                        <div className="radial-progress text-primary transition-all duration-500" style={{ "--value": progressPercent, "--size": "3.5rem", "--thickness": "4px" }}>
                            <span className="text-[10px] font-bold text-slate-700">{progressPercent}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden">
                            <div className="p-6 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
                                <h3 className="font-extrabold text-slate-700 tracking-tight">{day}</h3>
                                <button 
                                    onClick={() => setSelectedDay(day)} 
                                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20"
                                >
                                    <FaPlus size={12} />
                                </button>
                            </div>

                            <div className="p-5 space-y-6 flex-grow min-h-[250px]">
                                {meals.filter(m => m.day === day).length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center py-10 opacity-20 italic">
                                        <p className="text-xs font-medium">No meals planned</p>
                                    </div>
                                ) : (
                                    meals.filter(m => m.day === day).map((meal) => (
                                        <div key={meal._id} className="relative bg-white group animate-in fade-in duration-300">
                                            <div className="flex gap-4 mb-4">
                                                <div className="relative">
                                                    <img src={meal.recipeId?.image} className="w-16 h-16 rounded-2xl object-cover shadow-md" alt="" />
                                                    <button 
                                                        onClick={() => deleteMutation.mutate(meal._id)}
                                                        className="absolute -top-2 -right-2 bg-white text-error p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100"
                                                    >
                                                        <FaTrash size={10}/>
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">{meal.recipeId?.title}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{meal.recipeId?.cuisine || 'Recipe'}</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-100 p-1 rounded-xl flex items-center justify-between border border-slate-200/50">
                                                <button 
                                                    onClick={() => statusMutation.mutate({ id: meal._id, newStatus: "Planned" })}
                                                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all duration-300 ${meal.status === 'Planned' ? 'bg-white shadow-sm text-primary scale-100' : 'text-slate-400 hover:text-slate-600 scale-95 opacity-70'}`}
                                                >
                                                    <FaClock size={10} />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">Plan</span>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => statusMutation.mutate({ id: meal._id, newStatus: "Cooking" })}
                                                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all duration-300 ${meal.status === 'Cooking' ? 'bg-white shadow-sm text-amber-500 scale-100' : 'text-slate-400 hover:text-slate-600 scale-95 opacity-70'}`}
                                                >
                                                    <FaFireAlt size={10} />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">Cook</span>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => statusMutation.mutate({ id: meal._id, newStatus: "Cooked" })}
                                                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all duration-300 ${meal.status === 'Cooked' ? 'bg-white shadow-sm text-green-500 scale-100' : 'text-slate-400 hover:text-slate-600 scale-95 opacity-70'}`}
                                                >
                                                    <FaCheckCircle size={10} />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">Done</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-slate-200"></div>
                        <button 
                            onClick={() => setShowHistory(!showHistory)} 
                            className="btn btn-ghost btn-md rounded-2xl gap-2 text-slate-500 hover:text-primary"
                        >
                            <FaHistory /> {showHistory ? "Hide History" : "Cooking History"}
                        </button>
                        <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                    
                    {showHistory && (
                        <div className="flex gap-4 overflow-x-auto pb-6 px-2 custom-scrollbar">
                            {meals.filter(m => m.status === "Cooked").map(meal => (
                                <div key={meal._id} className="flex-shrink-0 w-32 group">
                                    <div className="relative overflow-hidden rounded-2xl mb-2 aspect-square">
                                        <img src={meal.recipeId?.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FaCheckCircle className="text-white text-2xl" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-600 truncate text-center uppercase tracking-tighter">{meal.recipeId?.title}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedDay && (
                <div className="modal modal-open backdrop-blur-md">
                    <div className="modal-box max-w-2xl rounded-[3rem] p-0 overflow-hidden bg-white shadow-2xl border border-white">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <button onClick={() => setSelectedDay(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><FaTimes /></button>
                            <h3 className="text-3xl font-bold tracking-tighter">Add to {selectedDay}</h3>
                            <div className="relative mt-6">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <input 
                                    type="text" 
                                    placeholder="Search recipes..." 
                                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:bg-white/20 transition-all placeholder:text-white/20"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar bg-slate-50">
                            {filteredRecipes.map(recipe => (
                                <div key={recipe._id} className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-lg hover:border-primary/20 transition-all group">
                                    <img src={recipe.image} className="w-14 h-14 object-cover rounded-xl" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xs text-slate-800 truncate">{recipe.title}</h4>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">{recipe.cuisine}</p>
                                    </div>
                                    <button 
                                        onClick={() => addMealMutation.mutate({ recipeId: recipe._id, day: selectedDay })}
                                        className="btn btn-primary btn-sm rounded-xl px-4 normal-case font-bold"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealPlanner;