import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LottieLoader from "../components/LottieLoader";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { LeftSidebar } from "./components/LeftSidebar";
import { authService } from "./authService";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Sending reset link...");
    try {
      await authService.forgotPassword(email);
      toast.dismiss(loadingToast);
      toast.success("Reset link sent to your email!");
      setEmail("");
    } catch (err) {
      const errorMsg = err.message || "Failed to send reset link.";
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen lg:overflow-hidden overflow-y-auto">
      <LeftSidebar />

      <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6 py-6">
        <div className="flex lg:hidden items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <img
            src="/assets/MeroPaaloLogo.png"
            alt="MeroPaalo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-slate-900 text-lg">MeroPaalo</span>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-6 lg:p-8">
          <div className="mb-5">
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100 mb-3">
              Password recovery
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Forgot your password?
            </h1>
            <p className="text-slate-500 text-sm">
              No worries - enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              name="email"
              placeholder="name@institution.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LottieLoader size={18} className="shrink-0" ariaLabel="Sending reset link" />
                  Sending link...
                </>
              ) : (
                "Send Reset Link ->"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 font-semibold hover:text-teal-600 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>

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
