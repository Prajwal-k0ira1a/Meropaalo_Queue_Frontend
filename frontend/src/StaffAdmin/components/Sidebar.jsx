import { Activity, LayoutGrid, ListOrdered, History, Sparkles } from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "queue", label: "Queue List", icon: ListOrdered },
  { id: "history", label: "Service History", icon: History },
];

export default function Sidebar({
  activeNav,
  setActiveNav,
  sidebarOpen,
  hasError = false,
  department,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 transform border-r border-slate-200 bg-white text-slate-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col p-4">
        <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700">
                MeroPaalo
              </p>
              <h1 className="text-lg font-bold tracking-tight">Staff Desk</h1>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Assigned Department
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {department || "Not assigned"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col justify-between gap-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-teal-500 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
            );
          })}
          </nav>

          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              System Status
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Activity
                size={14}
                className={hasError ? "text-amber-500" : "text-emerald-500"}
              />
              {hasError ? "Connection needs attention" : "Live connection"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
