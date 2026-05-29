import { LogOut, Menu, UserRound, Building2 } from "lucide-react";
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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <img
          src="/assets/MeroPaaloLogo.png"
          alt="MeroPaalo"
          className="w-8 h-8 object-contain"
        />
        <span className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
          MeroPaalo
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 sm:flex">
          <Building2 size={14} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">
            {department || "No Department"}
          </span>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
          <UserRound size={14} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">
            {displayName}
          </span>
        </div>
        <button
          onClick={onViewQr}
          disabled={!activeDepartmentId}
          className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          View QR
        </button>
        <button
          onClick={onLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={14} />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
        <div className="h-9 w-9 rounded-full border-2 border-slate-200 bg-gradient-to-br from-amber-400 to-orange-500 sm:h-10 sm:w-10" />
      </div>
    </header>
  );
}
