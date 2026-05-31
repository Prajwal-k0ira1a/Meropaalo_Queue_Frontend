import { LayoutGrid, ListOrdered, Settings, LogOut, Activity } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../Authentication/authService";

const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "queue", label: "Queue List", icon: ListOrdered },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  hasError = false,
  department,
}) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

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

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 transform border-r border-slate-100 bg-white text-slate-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col p-6">
        {/* Brand Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-[#0f172a]">
            MeroPaalo
          </h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {department ? `${department} Manager` : "Queue Manager"}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-slate-100 text-slate-950 font-bold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/4 h-1/2 w-1.5 rounded-r bg-[#1e293b]" />
                )}
                <Icon size={16} className={`transition-colors ${isActive ? "text-[#1e293b]" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* System & Logout Footer */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 p-3 text-xs text-slate-500">
            <Activity
              size={13}
              className={hasError ? "text-rose-500 animate-pulse" : "text-emerald-500"}
            />
            <span className="font-medium">
              {hasError ? "Network Issues Detected" : "System Status: Online"}
            </span>
          </div>

          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            <LogOut size={16} className="text-slate-400 group-hover:text-rose-500" />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
