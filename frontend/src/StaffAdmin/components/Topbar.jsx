import { Building2, LogOut, Menu, UserRound, QrCode } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../Authentication/authService";

const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

export default function Topbar({ onMenuClick, user, department, departmentId }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const displayName = user?.name || user?.email || "Staff User";
  const activeDepartmentId =
    departmentId || user?.department?._id || user?.department || "";

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // Ignore API logout failures and continue local cleanup.
    } finally {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };

  const onViewQr = () => {
    if (!activeDepartmentId) return;
    navigate(
      `/qr-generator?department=${encodeURIComponent(activeDepartmentId)}`,
    );
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 sm:flex">
            <QrCode size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Live Staff Console
            </p>
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
              {department || "No Department"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <Building2 size={14} className="text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">
              {department || "No Department"}
            </span>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 sm:flex">
            <UserRound size={14} className="text-slate-500" />
            <span className="max-w-40 truncate text-sm font-semibold text-slate-700">
              {displayName}
            </span>
          </div>
          <button
            onClick={onViewQr}
            disabled={!activeDepartmentId}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <QrCode size={14} />
            View QR
          </button>
          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={14} />
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
          <div className="hidden h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 sm:block" />
        </div>
      </div>
    </header>
  );
}
