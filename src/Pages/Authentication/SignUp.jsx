import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { FaUserCircle } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import useAxios from "../../Hooks/useAxios";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { AuthContext } from "../../Context/AuthContext";

const SignUp = () => {
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const uploadImageToImgbb = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    return data.data.url;
  };

  const signupMutation = useMutation({
    mutationFn: async (formData) => {
      const imageUrl = await uploadImageToImgbb(formData.profileImageFile);

      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        profileImage: imageUrl,
      };

      const res = await axiosInstance.post("/register", payload);
      return res.data;
    },
    onSuccess: (data) => {
      loginUser(data.user, data.token);

      Swal.fire({
        title: "Registration Successful",
        text: "Redirecting to dashboard...",
        icon: "success"
      });

      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Signup error:", error);
      Swal.fire({
        title: "Oops!",
        text: error?.response?.data?.message || "Signup failed",
        icon: "error"
      });
    },
  });

  const onSubmit = (formValues) => {
    if (!selectedFile) {
      alert("Please select a profile image");
      return;
    }

    signupMutation.mutate({ ...formValues, profileImageFile: selectedFile });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('https://i.ibb.co/DHKn73Nv/kitchen.avif')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-gray-800/80 w-full max-w-5xl rounded-lg shadow-xl flex flex-col lg:flex-row overflow-hidden">

        <div className="lg:w-1/2 p-10 flex flex-col justify-center text-white">
          <h1 className="text-5xl font-bold mb-4">Join TasteTrail</h1>
          <p className="mb-2 opacity-90 leading-relaxed">
            Discover recipes, plan meals, and track your cooking journey with
            smart recommendations.
          </p>
          <p className="text-base opacity-80 leading-relaxed">
            Data-driven insights to improve everyday cooking decisions.
          </p>
        </div>

        <div className="lg:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Create Account
          </h2>
          <div className="flex justify-center mb-6">
            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-gray-700">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-6xl text-white" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="input input-bordered input-primary w-full"
                {...register("fullName", { required: "Full name is required" })}
              />
              {errors.fullName && (
                <p className="text-error text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="input input-bordered input-primary w-full"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered input-primary w-full"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              {errors.password && (
                <p className="text-error text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full text-white flex items-center justify-center gap-2 transition-all duration-300 ${signupMutation.isPending ? "opacity-70 cursor-not-allowed" : ""
                }`}
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-white font-bold">
            Already have an account?{" "}
            <Link to="/" className="text-primary">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
