import { useForm } from "react-hook-form";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import Input from "../components/forms/Input.jsx";
import { useNavigate } from "react-router-dom";

export default function AuthLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();


  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      setAuth({ user: res.data.user, token: res.data.token });
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">College CMS Login</h1>
        <p className="text-xs text-slate-500 mb-4">
          Sign in with your email or phone and password.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <Input
            label="Email or Phone"
            type="text"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            {...register("password", { required: "Password is required" })}
            error={errors.password?.message}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-md bg-primary-600 text-white text-sm py-2.5 hover:bg-primary-500 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

