import { Bell, HelpCircle, Menu, User } from "lucide-react";

export default function Topbar({ onMenuClick, user, department }) {
  const displayName = user?.name || user?.email || "Staff User";
  
  // Format user role for display
  const displayRole = user?.role === "admin" ? "ADMINISTRATOR" : "FLOOR MANAGER";

  return (
    <header className="w-full bg-transparent px-2 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="hidden lg:block" />

        {/* Top-Right Profile & Settings Widgets */}
        <div className="flex items-center gap-5 ml-auto">
          {/* Notification Bell */}
          <button className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Bell size={20} className="stroke-[1.75]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          {/* Help Tooltip */}
          <button className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <HelpCircle size={20} className="stroke-[1.75]" />
          </button>

          {/* Vertical Divider */}
          <span className="h-6 w-px bg-slate-200" />

          {/* User Profile Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {displayName}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 mt-0.5">
                {displayRole}
              </p>
            </div>
            
            {/* Avatar Circle */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e293b] text-white font-bold text-xs uppercase shadow-sm">
              {displayName.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

