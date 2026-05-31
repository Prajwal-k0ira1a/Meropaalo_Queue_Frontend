import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";
import toast from "react-hot-toast";

import { authService } from "../../Authentication/authService";

const CUSTOMER_TOKEN_STORAGE_KEY = "meropaalo_customer_token";
const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const persistedToken = useMemo(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const persistedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!showTimer) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimer]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname, searchParams]);

  const isJoinActive = location.pathname === "/join";
  const isTokenActive = location.pathname === "/token-status";
  const liveTrackingTo = persistedToken?.tokenId
    ? `/token-status?tokenId=${encodeURIComponent(persistedToken.tokenId)}&department=${encodeURIComponent(
        persistedToken.departmentId || "",
      )}&tokenNumber=${encodeURIComponent(persistedToken.tokenNumber || "")}`
    : "";
  const accountName = persistedUser?.name || persistedUser?.email || "Account";
  const accountEmail = persistedUser?.email || "No email available";
  const accountDepartment =
    persistedUser?.department?.name || persistedUser?.departmentName || "Customer queue";

  const navLinks = [
    { to: `/join${params}`, label: "Queue Dashboard", isActive: isJoinActive },
    {
      to: liveTrackingTo,
      label: "Live Tracking",
      isActive: isTokenActive,
      disabled: !liveTrackingTo,
    },
  ];

  const handleSwitchAccount = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    const loadingToast = toast.loading("Switching account...");

    try {
      await authService.logout();
    } catch {
      // Continue local cleanup even if the server logout request fails.
    } finally {
      localStorage.removeItem("meropaalo_auth_user");
      localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
      localStorage.removeItem("meropaalo_join_take_token");
      toast.dismiss(loadingToast);
      toast.success("Switched account successfully");
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };

  const handleViewProfile = () => {
    setProfileOpen(true);
    setAccountMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex items-center gap-3 select-none transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <img
              src="/assets/MeroPaaloLogo.png"
              alt="MeroPaalo"
              className="h-6 w-6 object-contain"
            />
          </div>

          <div className="hidden sm:block">
            <span className="block text-[13px] font-semibold tracking-tight text-slate-950">
              Mero<span className="text-teal-600 transition-colors group-hover:text-teal-500">Paalo</span>
            </span>
            <span className="block text-[8px] font-medium uppercase tracking-[0.28em] text-slate-400">
              Queue access
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {showNav && (
            <nav className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 p-1 md:flex">
              {navLinks.map((link) =>
                link.disabled ? (
                  <button
                    key={link.label}
                    type="button"
                    disabled
                    className="inline-flex min-w-[128px] items-center justify-center rounded-lg px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-300"
                  >
                    {link.label}
                  </button>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    isActive={link.isActive}
                    label={link.label}
                  />
                ),
              )}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {showTimer && (
              <div className="hidden items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 sm:flex">
                <SyncIcon className="h-3.5 w-3.5 text-teal-600 animate-spin-slow" />
                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-teal-700 leading-none">
                  <span className="tabular-nums">{countdown}s</span>
                </span>
              </div>
            )}

            <div className="relative flex items-center gap-2">
             

              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
              >
                <span className="hidden sm:inline">Account</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Signed in as
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                      {accountName}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {accountEmail}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleViewProfile}
                    className="mt-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span>View Profile</span>
                    <span className="text-slate-300">→</span>
                  </button>

                  {showLogout && (
                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      disabled={loggingOut}
                      className="mt-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                      <LogOut size={14} />
                    </button>
                  )}
                </div>
              )}

              {showNav && (
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:hidden"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {menuOpen && showNav && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {navLinks.map((link) =>
            link.disabled ? (
              <div
                key={link.label}
                className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300"
              >
                {link.label}
              </div>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`mb-2 flex items-center justify-between rounded-xl px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all ${
                  link.isActive
                    ? "bg-teal-50 text-teal-700"
                    : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {link.label}
                <svg
                  className={`h-4 w-4 ${
                    link.isActive ? "text-teal-500" : "text-slate-300"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ),
          )}

          {showTimer && (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 sm:hidden">
              <div className="flex items-center gap-3">
                <SyncIcon className="h-4 w-4 text-teal-600 animate-spin-slow" />
                <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-600">
                  Auto-Refresh Sync
                </span>
              </div>
              <span className="rounded-md border border-teal-100 bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums text-teal-600">
                {countdown}s
              </span>
            </div>
          )}

          {showLogout && (
            <button
              type="button"
              onClick={handleSwitchAccount}
              disabled={loggingOut}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={14} />
              {loggingOut ? "Switching..." : "Switch Account"}
            </button>
          )}
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-end bg-slate-950/20 p-4 pt-20 backdrop-blur-[1px]">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-teal-600">
                  Profile
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                  {accountName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{accountEmail}</p>
              </div>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close profile"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Department
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {accountDepartment}
              </p>
            </div>

            {showLogout && (
              <button
                type="button"
                onClick={handleSwitchAccount}
                disabled={loggingOut}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={14} />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ to, isActive, label }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-w-[128px] items-center justify-center rounded-lg px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ${
        isActive
          ? "border border-slate-200 bg-white text-teal-700"
          : "text-slate-400 hover:bg-white hover:text-slate-700"
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
