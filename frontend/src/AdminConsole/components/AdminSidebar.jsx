import { Building2, LayoutDashboard, Monitor, Users, Zap } from "lucide-react";
import { useMemo } from "react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "counters", label: "Counters", icon: Monitor },
  { id: "users", label: "Users", icon: Users },
];

const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

export default function AdminSidebar({ activeNav, setActiveNav }) {
  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const displayName = authUser?.name || authUser?.email || "Admin User";
  const displayRole = authUser?.role
    ? `${String(authUser.role).charAt(0).toUpperCase()}${String(authUser.role).slice(1)}`
    : "Administrator";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "AD";

  return (
    <aside className="w-56 bg-[#111827] text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-700">
        <img
          src="/assets/MeroPaaloLogo.png"
          alt="MeroPaalo"
          className="w-8 h-8 object-contain flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">MeroPaalo</p>
          <p className="text-[11px] text-gray-400">Admin Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left transition-colors
                ${
                  isActive
                    ? "bg-teal-600 text-white font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-gray-400">{displayRole}</p>
        </div>
      </div>
    </aside>
  );
}
