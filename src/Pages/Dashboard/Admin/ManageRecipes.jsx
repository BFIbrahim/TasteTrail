import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import Swal from "sweetalert2";

import { 
  FaPlus, FaEdit, FaTrash, FaUtensils, 
  FaClock, FaFire, FaGlobe, FaListUl, FaImage, FaTimes 
} from "react-icons/fa";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";


const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

const ManageRecipes = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const res = await axiosSecure.get("/recipes");
      return res.data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosSecure.get("/categories");
      return res.data;
    },
  });

  const { register, handleSubmit, control, reset, watch } = useForm();
  const { fields, append, remove } = useFieldArray({ control, name: "ingredients" });

  const imageFile = watch("image");
  useEffect(() => {
    if (imageFile && imageFile[0] instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(imageFile[0]);
    }
  }, [imageFile]);

  const addRecipeMutation = useMutation({
    mutationFn: (recipeData) => axiosSecure.post("/recipes", recipeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      Swal.fire({ icon: 'success', title: 'Recipe Added!', showConfirmButton: false, timer: 1500 });
      closeModal();
    },
  });

  const updateRecipeMutation = useMutation({
    mutationFn: (recipeData) => axiosSecure.patch(`/recipes/${editingRecipeId}`, recipeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      Swal.fire({ icon: 'success', title: 'Recipe Updated!', showConfirmButton: false, timer: 1500 });
      closeModal();
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id) => axiosSecure.delete(`/recipes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      Swal.fire("Deleted!", "Your recipe has been removed.", "success");
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecipeId(null);
    setImageUploading(false);
    setPreviewImage(null);
    reset({
      title: "", cookingTime: "", calories: "", cuisine: "",
      instructions: "", category: "", ingredients: [{ name: "", quantity: "" }], image: null,
    });
  };

  const handleEditClick = (recipe) => {
    setEditingRecipeId(recipe._id);
    setPreviewImage(recipe.image);
    reset(recipe);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) deleteRecipeMutation.mutate(id);
    });
  };

  const onSubmit = async (data) => {
    setImageUploading(true);
    let imageUrl = null;
    try {
      if (data.image && data.image[0] instanceof File) {
        const formData = new FormData();
        formData.append("image", data.image[0]);
        const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: "POST",
          body: formData,
        });
        const imgData = await imgRes.json();
        imageUrl = imgData.data.display_url;
      }

      const recipePayload = {
        ...data,
        calories: Number(data.calories),
        ingredients: data.ingredients.filter(i => i.name && i.quantity),
        image: imageUrl || (editingRecipeId ? recipes.find(r => r._id === editingRecipeId).image : null),
      };

      if (editingRecipeId) updateRecipeMutation.mutate(recipePayload);
      else addRecipeMutation.mutate(recipePayload);
    } catch (err) {
      Swal.fire("Error", "Action failed.", "error");
      setImageUploading(false);
      console.log(err)
    }
  };

  return (
    <div className="p-4 md:p-8 bg-base-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300">
          <div>
            <h2 className="text-3xl font-black text-primary flex items-center gap-2">
              <FaUtensils className="text-2xl" /> <span className="text-black">Manage</span> Recipes
            </h2>
            <p className="text-base-content/60 font-medium">Manage your culinary collection</p>
          </div>
          <button className="btn btn-primary btn-wide rounded-xl shadow-lg shadow-primary/20 text-white" onClick={() => setModalOpen(true)}>
            <FaPlus /> Add New Recipe
          </button>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200 text-base-content/70">
                <tr className="text-sm uppercase tracking-wider">
                  <th className="py-4 px-6">Dish Info</th>
                  <th>Category</th>
                  <th>Cuisine</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipesLoading ? (
                  <tr><td colSpan={4} className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></td></tr>
                ) : recipes.map((recipe) => (
                  <tr key={recipe._id} className="hover:bg-base-200/50 transition-colors border-b border-base-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="mask mask-squircle w-14 h-14 bg-base-300 shadow-md">
                            <img src={recipe.image} alt="" className="object-cover" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-lg leading-tight">{recipe.title}</div>
                          <div className="text-xs opacity-60 flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1"><FaClock className="text-primary/70"/> {recipe.cookingTime}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><FaFire className="text-orange-500/70"/> {recipe.calories} kcal</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-outline badge-primary font-bold px-3 py-3 h-auto">{recipe.category}</span></td>
                    <td className="font-medium text-base-content/70">{recipe.cuisine}</td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(recipe)} className="btn btn-square btn-warning btn-sm shadow-sm"><FaEdit /></button>
                        <button onClick={() => handleDelete(recipe._id)} className="btn btn-square btn-error btn-sm shadow-sm text-white"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <input type="checkbox" checked={modalOpen} readOnly className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
        <div className="modal-box max-w-4xl p-0 rounded-2xl overflow-hidden border border-base-300 flex flex-col max-h-[90vh]">
          
          <div className="bg-primary p-6 text-primary-content flex justify-between items-center shrink-0 shadow-md z-10">
            <h3 className="text-2xl font-bold flex items-center gap-2 text-white">
              {editingRecipeId ? <FaEdit /> : <FaPlus />} 
              {editingRecipeId ? "Update Recipe" : "New Creation"}
            </h3>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={closeModal}><FaTimes /></button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-8 space-y-8 bg-base-100 flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-widest text-base-content/50">Recipe Title</label>
                <div className="relative">
                  <FaUtensils className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input {...register("title", { required: true })} className="input input-bordered w-full pl-12 focus:border-primary bg-base-200/30" />
                </div>
              </div>
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-widest text-base-content/50">Cooking Time</label>
                <div className="relative">
                  <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input {...register("cookingTime", { required: true })} className="input input-bordered w-full pl-12 focus:border-primary bg-base-200/30" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-widest text-base-content/50">Calories</label>
                <div className="relative">
                  <FaFire className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input type="number" {...register("calories", { required: true })} className="input input-bordered w-full pl-12 focus:border-primary bg-base-200/30" />
                </div>
              </div>
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-widest text-base-content/50">Cuisine</label>
                <div className="relative">
                  <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input {...register("cuisine", { required: true })} className="input input-bordered w-full pl-12 focus:border-primary bg-base-200/30" />
                </div>
              </div>
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-widest text-base-content/50">Category</label>
                <div className="relative">
                  <FaListUl className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 z-10" />
                  <select className="select select-bordered w-full pl-12 focus:border-primary bg-base-200/30" {...register("category", { required: true })}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-base-200/50 p-6 rounded-2xl border border-base-300">
              <div className="flex justify-between items-center mb-4">
                <label className="label-text font-black text-primary uppercase text-xs tracking-widest">Ingredients</label>
                <button type="button" onClick={() => append({ name: "", quantity: "" })} className="btn btn-xs btn-primary gap-1 text-white">
                  <FaPlus /> Add
                </button>
              </div>
              <div className="space-y-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex gap-2">
                    <input placeholder="Item Name" {...register(`ingredients.${index}.name`)} className="input input-bordered w-2/3 input-sm focus:border-primary" />
                    <input placeholder="Qty" {...register(`ingredients.${index}.quantity`)} className="input input-bordered w-1/3 input-sm focus:border-primary" />
                    <button type="button" onClick={() => remove(index)} className="btn btn-sm btn-square btn-error btn-outline border-none bg-error text-white hover:bg-error">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-widest text-base-content/50">Instructions</label>
                <textarea {...register("instructions", { required: true })} className="textarea textarea-bordered h-40 focus:border-primary bg-base-200/30" />
              </div>
              
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-widest text-base-content/50">Recipe Image</label>
                <div className="relative h-40 group">
                  {previewImage ? (
                    <div className="w-full h-full relative rounded-xl overflow-hidden shadow-inner border border-base-300">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-white text-xs font-bold">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-base-300 rounded-xl w-full h-full flex flex-col items-center justify-center bg-base-200/30">
                      <FaImage className="text-4xl text-base-content/20" />
                      <span className="text-xs font-medium text-base-content/40 mt-2">Upload Photo</span>
                    </div>
                  )}
                  <input type="file" {...register("image", { required: !editingRecipeId })} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                </div>
              </div>
            </div>
            <div className="h-4"></div>
          </form>

          <div className="bg-base-100 p-6 flex gap-3 border-t border-base-200 shrink-0 shadow-md z-10">
            <button type="button" onClick={closeModal} className="btn btn-ghost flex-1 rounded-xl uppercase font-bold text-xs tracking-widest">Discard</button>
            <button type="submit" onClick={handleSubmit(onSubmit)} disabled={imageUploading} className="btn btn-primary flex-[2] rounded-xl shadow-lg shadow-primary/20 uppercase font-bold text-xs tracking-widest text-white">
              {imageUploading ? <span className="loading loading-spinner"></span> : editingRecipeId ? "Apply Changes" : "Publish Recipe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRecipes;