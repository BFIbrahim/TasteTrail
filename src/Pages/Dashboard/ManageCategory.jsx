import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDelete, MdCloudUpload } from "react-icons/md";
import { HiOutlineFolderAdd } from "react-icons/hi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Swal from "sweetalert2";

const ManageCategory = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();
    const [previewImage, setPreviewImage] = useState(null);

    const {
        data: categories = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await axiosSecure.get("/categories");
            return res.data;
        },
    });

    const addCategoryMutation = useMutation({
        mutationFn: async ({ name, imageUrl }) => {
            const res = await axiosSecure.post("/categories", { name, image: imageUrl });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            Swal.fire({
                title: "Success!",
                text: "Category has been created.",
                icon: "success",
                customClass: { popup: 'rounded-[2rem]' }
            });
            reset();
            setPreviewImage(null);
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.delete(`/categories/${id}`);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                title: "Deleted!",
                text: "Category removed successfully.",
                icon: "success",
                customClass: { popup: 'rounded-[2rem]' }
            });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });

    const handleImagePreview = (e) => {
        const file = e.target.files[0];
        if (file) setPreviewImage(URL.createObjectURL(file));
        else setPreviewImage(null);
    };

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
            { method: "POST", body: formData }
        );
        const data = await response.json();
        return data.data.url;
    };

    const onSubmit = async (data) => {
        try {
            if (!data.name || !data.image[0]) {
                Swal.fire("Error", "Name and image are required", "error");
                return;
            }
            const imageUrl = await handleImageUpload(data.image[0]);
            await addCategoryMutation.mutateAsync({ name: data.name, imageUrl });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Delete Category?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#94A3B8",
            confirmButtonText: "Yes, delete",
            customClass: { popup: 'rounded-[2.5rem]' }
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCategoryMutation.mutate(id);
            }
        });
    };

    return (
        <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage <span className="text-primary">Categories</span></h1>
                <p className="text-slate-500 font-medium">Organize and structure your recipe collections.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <HiOutlineFolderAdd size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">New Category</h2>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="form-control w-full">
                                <label className="label text-xs font-bold uppercase tracking-wider text-slate-400">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Italian Cuisine"
                                    {...register("name", { required: true })}
                                    className="input input-bordered w-full rounded-2xl bg-slate-50 border-slate-200 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="form-control w-full">
                                <label className="label text-xs font-bold uppercase tracking-wider text-slate-400">Cover Image</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register("image", { required: true })}
                                        onChange={handleImagePreview}
                                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                    />
                                    <div className={`border-2 border-dashed rounded-[1.5rem] p-6 transition-all flex flex-col items-center justify-center gap-2 ${previewImage ? 'border-primary/50 bg-primary/5' : 'border-slate-200 bg-slate-50 group-hover:border-primary/30'}`}>
                                        {!previewImage ? (
                                            <>
                                                <MdCloudUpload className="text-slate-400 group-hover:text-primary transition-colors" size={32} />
                                                <span className="text-sm font-medium text-slate-500">Click to upload</span>
                                            </>
                                        ) : (
                                            <img src={previewImage} alt="Preview" className="w-full h-32 object-cover rounded-xl shadow-sm" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full rounded-2xl h-14 text-white shadow-lg shadow-primary/20"
                                disabled={addCategoryMutation.isLoading}
                            >
                                {addCategoryMutation.isLoading ? <span className="loading loading-spinner"></span> : "Create Category"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center py-20 gap-4">
                                <span className="loading loading-ring loading-lg text-primary"></span>
                                <p className="text-slate-400 font-medium italic">Loading categories...</p>
                            </div>
                        ) : isError ? (
                            <div className="p-20 text-center text-red-400 font-medium">Failed to sync categories.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead className="bg-slate-50/80">
                                        <tr className="text-slate-400 uppercase text-[11px] tracking-widest border-none">
                                            <th className="pl-8 py-5">Preview</th>
                                            <th>Category Name</th>
                                            <th className="text-right pr-8">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {categories.map((category) => (
                                            <tr key={category._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="pl-8 py-4">
                                                    <div className="avatar">
                                                        <div className="w-14 h-14 rounded-2xl ring-4 ring-slate-100 group-hover:ring-primary/10 transition-all">
                                                            <img
                                                                src={category.image || "https://i.ibb.co/2kR2zq0/user.png"}
                                                                alt={category.name}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="font-bold text-slate-700 text-lg tracking-tight">
                                                        {category.name}
                                                    </span>
                                                </td>
                                                <td className="text-right pr-8">
                                                    <button
                                                        onClick={() => handleDelete(category._id)}
                                                        className="btn btn-ghost btn-circle text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                                    >
                                                        <MdDelete size={22} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCategory;