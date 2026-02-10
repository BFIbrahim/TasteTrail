import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaCheck, FaEye, FaTrashAlt, FaTimes } from "react-icons/fa";

const ManageReviews = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [viewReview, setViewReview] = useState(null);

    const { data: pendingReviews = [], isLoading } = useQuery({
        queryKey: ["pending-reviews"],
        queryFn: async () => {
            const res = await axiosSecure.get("/reviews/admin/pending");
            return res.data;
        }
    });

    const approveMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.patch(`/reviews/approve/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["pending-reviews"]);
            Swal.fire({
                title: "Approved!",
                text: "The review is now live.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            setViewReview(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.delete(`/reviews/admin/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["pending-reviews"]);
            Swal.fire({
                title: "Rejected!",
                text: "The review has been permanently removed.",
                icon: "success",
                confirmButtonColor: "#ef4444"
            });
            setViewReview(null);
        },
        onError: (error) => {
            Swal.fire("Error", "Could not delete the review.", "error");
            console.log(error)
        }
    });

    const handleReject = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This review will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    if (isLoading) return <div className="p-10 text-center"><span className="loading loading-bars loading-lg"></span></div>;

    return (
        <div className="p-8 bg-base-100 min-h-screen">
            <h2 className="text-3xl font-black mb-8">Review <span className="text-primary">Moderation</span></h2>

            <div className="overflow-x-auto rounded-2xl border border-base-200 shadow-sm">
                <table className="table w-full">
                    <thead className="bg-base-200">
                        <tr>
                            <th>User</th>
                            <th>Target Recipe</th>
                            <th>Rating</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingReviews.length > 0 ? pendingReviews.map((rev) => (
                            <tr key={rev._id} className="hover:bg-base-50 transition-colors">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-10 h-10">
                                                <img src={rev.userImage} alt="User" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{rev.userName}</div>
                                            <div className="text-xs opacity-50">{rev.userEmail}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={rev.recipeId?.image || "https://via.placeholder.com/50"}
                                            className="w-10 h-10 object-cover rounded-lg"
                                            alt=""
                                        />
                                        <div className="max-w-[150px]">
                                            <div className="font-bold text-sm truncate">{rev.recipeId?.title || "Deleted Recipe"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="badge badge-warning gap-1 font-bold">
                                        {rev.rating} ⭐
                                    </div>
                                </td>
                                <td className="flex justify-center gap-2">
                                    <button
                                        onClick={() => setViewReview(rev)}
                                        className="btn btn-square btn-sm btn-ghost text-info"
                                        title="View Details"
                                    >
                                        <FaEye size={18} />
                                    </button>
                                    <button
                                        onClick={() => approveMutation.mutate(rev._id)}
                                        className="btn btn-square btn-sm btn-ghost text-success"
                                        title="Approve"
                                    >
                                        <FaCheck size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleReject(rev._id)}
                                        className="btn btn-square btn-sm btn-ghost text-error"
                                        title="Delete/Reject"
                                    >
                                        <FaTrashAlt size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-10 opacity-50">No pending reviews found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <input type="checkbox" checked={!!viewReview} readOnly className="modal-toggle" />
            {viewReview && (
                <div className="modal">
                    <div className="modal-box rounded-3xl p-8 max-w-2xl border border-base-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-black text-2xl">Review Moderation</h3>
                                <p className="text-sm opacity-60 font-medium">Submitted on {new Date(viewReview.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setViewReview(null)} className="btn btn-sm btn-circle btn-ghost">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl mb-6 border border-primary/10">
                            <img src={viewReview.recipeId?.image} className="w-16 h-16 object-cover rounded-xl shadow-md" alt="" />
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Reviewing for</p>
                                <h4 className="text-xl font-black">{viewReview.recipeId?.name}</h4>
                            </div>
                        </div>

                        <div className="bg-base-200 p-6 rounded-2xl mb-8 relative">
                            <span className="absolute -top-3 left-4 text-4xl text-primary opacity-20 italic font-serif">"</span>
                            <p className="text-lg italic text-base-content/80 leading-relaxed">{viewReview.comment}</p>
                        </div>

                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-3">
                                <img src={viewReview.userImage} className="w-12 h-12 rounded-full border-2 border-primary/20" alt="" />
                                <div>
                                    <p className="font-bold">{viewReview.userName}</p>
                                    <p className="text-xs opacity-60">{viewReview.userEmail}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold opacity-40 uppercase">User Rating</p>
                                <div className="text-2xl font-black text-warning">{viewReview.rating}/5 ⭐</div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => approveMutation.mutate(viewReview._id)}
                                className="btn btn-primary flex-1 rounded-xl shadow-lg shadow-primary/20"
                            >
                                <FaCheck className="mr-2" /> Approve Now
                            </button>
                            <button
                                onClick={() => handleReject(viewReview._id)}
                                className="btn btn-error btn-outline flex-1 rounded-xl"
                            >
                                <FaTrashAlt className="mr-2" /> Reject Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReviews;