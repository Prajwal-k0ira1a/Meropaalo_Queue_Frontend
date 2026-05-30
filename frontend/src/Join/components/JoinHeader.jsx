import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../Authentication/authService";

const CUSTOMER_TOKEN_STORAGE_KEY = "meropaalo_customer_token";

export default function JoinHeader({
  showTimer = false,
  showNav = true,
  showLogout = false,
}) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const params = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Timer logic for tracking consistency
  const [countdown, setCountdown] = useState(30);
  useEffect(() => {
    if (!showTimer) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [showTimer]);

  const isJoinActive = location.pathname === "/join";
  const isTokenActive = location.pathname === "/token-status";

  const navLinks = [
    { to: `/join${params}`, label: "Queue Dashboard", isActive: isJoinActive },
    { to: "/token-status", label: "Live Tracking", isActive: isTokenActive },
  ];

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    const loadingToast = toast.loading("Logging out...");
    try {
      await authService.logout();
    } catch {
      // Continue local cleanup even if the server logout request fails.
    } finally {
      localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
      toast.dismiss(loadingToast);
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-4xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Brand — Restored to Original MeroPaalo Style */}
        <Link
          to="/"
          className="flex items-center gap-2 group select-none hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/MeroPaaloLogo.png"
            alt="MeroPaalo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-display font-bold text-slate-900 text-lg tracking-tight hidden sm:inline">
            Mero
            <span className="text-teal-600 transition-colors group-hover:text-teal-500">
              Paalo
            </span>
          </span>
        </Link>

        {/* Navigation & Status */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Desktop Nav */}
          {showNav && (
            <nav className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  isActive={link.isActive}
                  label={link.label}
                />
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3 border-l border-slate-100 pl-4 md:pl-8">
            {showTimer && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-teal-50/50 rounded-full border border-teal-100 animate-in fade-in zoom-in duration-500">
                <SyncIcon className="w-3 h-3 text-teal-600 animate-spin-slow" />
                <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest leading-none">
                  <span className="tabular-nums">{countdown}s</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 hover:text-slate-600 transition-all duration-300 hover:scale-105">
              <UserIcon />
            </div>

            {showLogout && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={14} />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            )}

              {/* Mobile Toggle */}
              {showNav && (
                <button
                  className="md:hidden w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && showNav && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-2 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-between group transition-all ${
                link.isActive
                  ? "bg-teal-50 text-teal-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {link.label}
              <svg
                className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${link.isActive ? "text-teal-500" : "text-slate-300"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}

          {showTimer && (
            <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between sm:hidden">
              <div className="flex items-center gap-3">
                <SyncIcon className="w-4 h-4 text-teal-600 animate-spin-slow" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Auto-Refresh Sync
                </span>
              </div>
              <span className="text-xs font-black text-teal-600 tabular-nums bg-white px-2 py-0.5 rounded-lg border border-teal-100">
                {countdown}s
              </span>
            </div>
          )}

          {showLogout && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={14} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ to, isActive, label }) {
  return (
    <Link
      to={to}
      className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
        isActive
          ? "bg-white text-teal-600 shadow-sm shadow-slate-200 border border-slate-100"
          : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {label}
    </Link>
  );
}

function SyncIcon({ className }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M23 4v6h-6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="7"
        r="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
