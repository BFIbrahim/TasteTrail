import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import useAxios from "../../Hooks/useAxios";
import { Link, useNavigate, useLocation } from "react-router";
import Swal from "sweetalert2";
import { AuthContext } from "../../Context/AuthContext";
import { useContext, useEffect } from "react";

const Login = () => {
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, user, loading } = useContext(AuthContext);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (!loading && user) {
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await axiosInstance.post("/login", { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      loginUser(data.user, data.token);

      Swal.fire({
        title: "Login Successful",
        text: "Redirecting to dashboard...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      navigate("/dashboard");
    },
    onError: (error) => {
      Swal.fire({
        title: "Oops",
        text: error?.response?.data?.message || "Login failed",
        icon: "error"
      });
    },
  });

  const onSubmit = (formValues) => {
    loginMutation.mutate(formValues);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

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
          <h1 className="text-5xl font-bold mb-4">Welcome to TasteTrail</h1>
          <p className="mb-2 opacity-90 leading-relaxed">
            TasteTrail helps you discover recipes, plan meals, track cooking, and get personalized recommendations.
          </p>
        </div>

        <div className="lg:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign in</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="input input-bordered input-primary w-full text-white"
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
                className="input input-bordered input-primary w-full text-white"
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
              className="btn btn-primary w-full text-white"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in now"}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-white font-bold">
            Don't have an account? <Link to="/signup" className="text-primary">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;