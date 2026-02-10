import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import useAxios from "../../hooks/useAxios";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";

const Login = () => {
  const axiosInstance = useAxios();
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await axiosInstance.post("/login", { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      Swal.fire({
        title: "Login Successfull",
        text: "Redirecting to dashboard...",
        icon: "success"
      });
      
      navigate("/dashboard");
    },
    onError: (error) => {
      Swal.fire({
        title: "Opps",
        text: "Login failed",
        icon: "error"
      });
      console.log(error)
    },
  });

  const onSubmit = (formValues) => {
    loginMutation.mutate(formValues);
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
          <h1 className="text-5xl font-bold mb-4">Welcome to TasteTrail</h1>
          <p className="mb-2 opacity-90 leading-relaxed">
            TasteTrail helps you discover recipes, plan meals, track cooking, and get personalized recommendations.
          </p>
          <p className="text-base opacity-80 leading-relaxed">
            Improve your everyday cooking decisions with smart insights.
          </p>

          <div className="flex mt-6 space-x-4 text-xl">
            <a href="#" className="hover:text-secondary"><i className="fab fa-facebook"></i></a>
            <a href="#" className="hover:text-secondary"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-secondary"><i className="fab fa-instagram"></i></a>
            <a href="#" className="hover:text-secondary"><i className="fab fa-youtube"></i></a>
          </div>
        </div>

        <div className="lg:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign in</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex items-center justify-between">
              <label className="label cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-primary" />
                <span className="label-text ml-2 text-white">Remember Me</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full text-white"
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? "Signing in..." : "Sign in now"}
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
