import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { FiLock, FiMail } from "react-icons/fi";
import { useAuthStore } from "../store/authStore";
import Button from "../components/ui/Button";

const Login = () => {
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  const onSubmit = async (data) => {
    const success = await login(data);
    if (success)
      navigate(location.state?.from?.pathname || "/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">FashionHub AI</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Sign in to your admin dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                defaultValue="admin@fashionhub.pk"
                {...register("email", { required: "Email is required" })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="you@fashionhub.pk"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                defaultValue="admin123"
                {...register("password", { required: "Password is required" })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>

          <p className="text-xs text-gray-400 text-center pt-2">
            Enter your Credentials
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
