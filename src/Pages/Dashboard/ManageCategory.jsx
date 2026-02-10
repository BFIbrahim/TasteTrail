import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
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
                title: "Category Added",
                text: "New Category Added",
                icon: "success"
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
                title: "Deleted",
                text: "Category Deleted",
                icon: "success"
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
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();
        return data.data.url;
    };

    const onSubmit = async (data) => {
        try {
            if (!data.name || !data.image[0]) {
                alert("Name and image are required");
                return;
            }

            const imageUrl = await handleImageUpload(data.image[0]);

            await addCategoryMutation.mutateAsync({ name: data.name, imageUrl });
        } catch (err) {
            console.error("Failed to add category:", err);
            alert("Failed to add category. Please try again.");
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCategoryMutation.mutate(id);
            }
        });
    };

    return (
        <div className="p-4 flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 bg-secondary p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-primary mb-4">Add New Category</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Category Name"
                        {...register("name", { required: true })}
                        className="input input-bordered w-full"
                    />

                    <div>
                        <label className="block mb-1">Category Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            {...register("image", { required: true })}
                            onChange={handleImagePreview}
                            className="file-input file-input-bordered w-full"
                        />
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="w-32 h-32 mt-2 object-cover rounded"
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary mt-2"
                        disabled={addCategoryMutation.isLoading}
                    >
                        {addCategoryMutation.isLoading ? "Adding..." : "Add Category"}
                    </button>
                </form>
            </div>

            <div className="md:w-2/3 overflow-x-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : isError ? (
                    <p className="text-red-500">Failed to load categories.</p>
                ) : (
                    <table className="table w-full">
                        <thead className="bg-primary text-white">
                            <tr>
                                <th>#</th>
                                <th>Category Image</th>
                                <th>Category Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category, index) => (
                                <tr key={category._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="avatar">
                                            <div className="w-12 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                                                <img
                                                    src={category.image || "https://i.ibb.co/2kR2zq0/user.png"}
                                                    alt={category.name}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td>{category.name}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-error flex items-center gap-1 text-white"
                                            onClick={() => handleDelete(category._id)}
                                        >
                                            <MdDelete /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ManageCategory;
