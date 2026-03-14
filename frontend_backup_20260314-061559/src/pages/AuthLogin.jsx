import { useState } from "react";
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
  const [mode, setMode] = useState("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const onPasswordLogin = async (data) => {
    try {
      const res = await api.post("/auth/login", data);
      setAuth({
        user: res.data.user,
        token: res.data.token,
        refreshToken: res.data.refreshToken
      });
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const sendOtp = async (data) => {
    try {
      setOtpLoading(true);
      await api.post("/auth/send-otp", { regNo: data.regNo, phone: data.phone });
      setOtpSent(true);
      alert("OTP sent to the provided phone number.");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (data) => {
    try {
      const res = await api.post("/auth/verify-otp", {
        regNo: data.regNo,
        phone: data.phone,
        code: data.otp
      });
      setAuth({
        user: res.data.user,
        token: res.data.token,
        refreshToken: res.data.refreshToken
      });
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white shadow-sm rounded-xl p-6 border border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">College CMS Login</h1>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setMode("password");
              setOtpSent(false);
            }}
            className={`flex-1 text-sm py-2 rounded-md ${
              mode === "password"
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => {
              setMode("otp");
              setOtpSent(false);
            }}
            className={`flex-1 text-sm py-2 rounded-md ${
              mode === "otp" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            OTP
          </button>
        </div>

        {mode === "password" ? (
          <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-2">
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
        ) : (
          <form
            onSubmit={handleSubmit(otpSent ? verifyOtp : sendOtp)}
            className="space-y-2"
          >
            <Input
              label="Reg No"
              type="text"
              {...register("regNo", { required: "Reg No is required" })}
              error={errors.regNo?.message}
            />
            <Input
              label="Phone"
              type="text"
              {...register("phone", { required: "Phone is required" })}
              error={errors.phone?.message}
            />
            {otpSent && (
              <Input
                label="OTP"
                type="text"
                {...register("otp", { required: "OTP is required" })}
                error={errors.otp?.message}
              />
            )}
            <button
              type="submit"
              disabled={otpLoading}
              className="w-full mt-2 rounded-md bg-primary-600 text-white text-sm py-2.5 hover:bg-primary-500 disabled:opacity-60"
            >
              {otpSent ? "Verify OTP" : otpLoading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

