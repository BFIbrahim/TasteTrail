import { useForm } from "react-hook-form";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("FormData ready:", data);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('https://i.ibb.co.com/DHKn73Nv/kitchen.avif')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-gray-800/80 w-full max-w-5xl rounded-lg shadow-xl flex flex-col lg:flex-row overflow-hidden">
        <div className="lg:w-1/2 p-10 flex flex-col justify-center text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to TasteTrail</h1>
          <p className="mb-2 opacity-90 leading-relaxed">
            TasteTrail is a full-stack web application designed to help users
            discover recipes, plan meals efficiently, track cooking activities,
            and receive personalized food recommendations.
          </p>
          <p className="text-base opacity-80 leading-relaxed">
            The system focuses on improving everyday cooking decisions using
            data-driven insights and smart automation.
          </p>

          <div className="flex mt-6 space-x-4 text-xl">
            <a href="#" className="hover:text-secondary">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="hover:text-secondary">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="hover:text-secondary">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="hover:text-secondary">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="lg:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Sign in
          </h2>

          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-white">
              <FaUserCircle className="text-6xl text-white" />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="input input-bordered input-primary w-full"
                {...register("email", {
                  required: "Email is required",
                })}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered input-primary w-full"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-error text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="label cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-primary" />
                <span className="label-text ml-2 text-white">Remember Me</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full text-white">
              Sign in now
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
