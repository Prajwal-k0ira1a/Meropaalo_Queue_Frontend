import { useMemo, useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import LottieLoader from "../components/LottieLoader";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { LeftSidebar } from "./components/LeftSidebar";
import { authService } from "./authService";

const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

const getLoginErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Login failed. Please try again.";

const getDepartmentFromJoinReturnTo = (returnTo) => {
  if (!returnTo.startsWith("/join")) return "";

  try {
    const queryString = returnTo.includes("?") ? returnTo.split("?")[1] : "";
    return new URLSearchParams(queryString).get("department") || "";
  } catch {
    return "";
  }
};

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const returnTo = useMemo(() => searchParams.get("returnTo") || "", [searchParams]);
  const departmentFromQuery = useMemo(
    () => searchParams.get("department") || "",
    [searchParams],
  );
  const departmentFromReturnTo = useMemo(
    () => getDepartmentFromJoinReturnTo(returnTo),
    [returnTo],
  );
  const joinDepartment = departmentFromQuery || departmentFromReturnTo;
  const nextJoinPath = joinDepartment
    ? `/join?department=${encodeURIComponent(joinDepartment)}`
    : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...");
    try {
      const user = await authService.login(formData.email, formData.password);

      if (!user) {
        throw new Error("Invalid login response. Please try again.");
      }

      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      toast.dismiss(loadingToast);
      toast.success(`Welcome back, ${user.name || user.email || "User"}!`);
      if (returnTo) {
        if (returnTo.startsWith("/join") && nextJoinPath) {
          navigate(nextJoinPath, { replace: true });
        } else {
          navigate(returnTo, { replace: true });
        }
      } else if (nextJoinPath) {
        navigate(nextJoinPath, { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "staff") {
        navigate("/staff-admin");
      } else {
        navigate("/join");
      }
    } catch (err) {
      const errorMsg = getLoginErrorMessage(err);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.28),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.16),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#134e4a_100%)]" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px] sm:bg-[size:40px_40px] lg:bg-[size:48px_48px]" />

        <div className="relative z-10 flex h-screen w-screen flex-col items-center justify-center px-4 text-center sm:px-6">
          <div className="flex w-full max-w-[96vw] flex-col items-center justify-center">
            <div className="flex min-h-[54vh] w-full max-w-[1400px] items-center justify-center sm:min-h-[62vh] lg:min-h-[72vh]">
              <LottieLoader
                size="clamp(190px, 50vw, 620px)"
                className="drop-shadow-[0_0_50px_rgba(45,212,191,0.22)] max-w-full"
                ariaLabel="Signing in"
              />
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.5em] text-teal-200/80 sm:text-xs">
              MeroPaalo
            </p>
            <p className="mt-3 text-xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Signing you in
            </p>
            <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-slate-200/90 sm:text-sm">
              Please wait while we verify your account and prepare your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen lg:overflow-hidden overflow-y-auto">
      {/* Left branded panel */}
      <LeftSidebar />

      {/* Right white form section */}
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6 py-6">
        {/* Mobile-only logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <img
            src="/assets/MeroPaaloLogo.png"
            alt="MeroPaalo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-slate-900 text-lg">MeroPaalo</span>
        </div>

        {/* Form card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-6 lg:p-8">
          {/* Header */}
          <div className="mb-5">
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100 mb-3">
              Welcome back
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Sign in to your account
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              name="email"
              placeholder="name@institution.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            {/* Password with show/hide toggle */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-800">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-teal-600 font-semibold hover:text-teal-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Lock size={18} strokeWidth={1.5} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full py-3 px-4 pl-11 pr-11 border-2 rounded-xl text-gray-900 placeholder-gray-400 text-sm border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 disabled:cursor-not-allowed"
                  aria-label="Toggle password visibility"
                  disabled={isLoading}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-teal-600 cursor-pointer"
                disabled={isLoading}
              />
              <span className="text-sm text-slate-600">
                Keep me signed in for 30 days
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              Sign In →
            </Button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-teal-600 font-semibold hover:text-teal-700"
            >
              Create one free
            </Link>
          </p>

          {/* Footer policy links */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Terms of Service
            </a>
            <span>·</span>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
