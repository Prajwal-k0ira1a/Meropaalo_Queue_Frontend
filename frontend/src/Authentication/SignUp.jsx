import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { LeftSidebar } from "./components/LeftSidebar";
import { authService } from "./authService";

export const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Password strength indicator
  const getStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0-4
  };

  const strength = getStrength(formData.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-teal-500",
  ][strength];

  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to terms and conditions");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    const loadingToast = toast.loading("Creating account...");
    try {
      await authService.register(
        formData.fullName,
        formData.email,
        formData.password,
      );
      toast.dismiss(loadingToast);
      toast.success("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errorMsg = err.message || "Registration failed. Please try again.";
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen lg:overflow-hidden overflow-y-auto">
      {/* Left branded panel */}
      <LeftSidebar />

      {/* Right form section */}
      <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6 py-4 overflow-y-auto">
        {/* Mobile-only logo */}
        <div className="flex lg:hidden items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
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
          <div className="mb-4">
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100 mb-3">
              Get started free
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Create your account
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full name + Role row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input
                  label="Full Name"
                  type="text"
                  name="fullName"
                  placeholder="Sujal Shrestha"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Work email */}
            <Input
              label="Work Email"
              type="email"
              name="email"
              placeholder="name@institution.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Password */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Lock size={18} strokeWidth={1.5} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full py-3 px-4 pl-11 pr-11 border-2 rounded-xl text-gray-900 placeholder-gray-400 text-sm border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  aria-label="Toggle password"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-medium w-12 text-right">
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Confirm Password
                {passwordsMatch && (
                  <CheckCircle2
                    size={14}
                    className="inline ml-2 text-teal-500"
                  />
                )}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Lock size={18} strokeWidth={1.5} />
                </div>
                <input
                  type={showConf ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full py-3 px-4 pl-11 pr-11 border-2 rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 focus:outline-none ${
                    formData.confirmPassword && !passwordsMatch
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConf((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  aria-label="Toggle confirm password"
                >
                  {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-teal-600 cursor-pointer shrink-0"
              />
              <span className="text-sm text-slate-500 leading-relaxed">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-teal-600 font-semibold hover:text-teal-700"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-teal-600 font-semibold hover:text-teal-700"
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={
                isLoading ||
                !agreed ||
                (formData.confirmPassword && !passwordsMatch)
              }
            >
              {isLoading ? "Creating account..." : "Create Account ->"}
            </Button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-600 font-semibold hover:text-teal-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
