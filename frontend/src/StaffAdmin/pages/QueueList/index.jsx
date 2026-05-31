import { useMemo, useState } from "react";
import { Search, Users, Activity, Clock, Play, RotateCcw, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";

export default function QueueListPage({
  queueItems = [],
  loading,
  error,
  servedToday = 0,
  totalInQueue = 0,
  selectedCounterId,
  counters = [],
  onCounterChange,
  onServeNext,
  onCallCurrent,
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Determine priority categorization for a token
  const getCategoryDetails = (ticket = "") => {
    const t = ticket.toUpperCase();
    if (t.includes("A") || t.includes("102") || t.includes("VIP")) {
      return { label: "VIP", color: "#f97316", badgeBg: "bg-orange-50 text-orange-500 border-orange-100", borderStyle: "border-l-4 border-l-[#f97316]" };
    }
    if (t.includes("B") || t.includes("PRIORITY")) {
      return { label: "PRIORITY", color: "#10b981", badgeBg: "bg-emerald-50 text-emerald-500 border-emerald-100", borderStyle: "border-l-4 border-l-[#10b981]" };
    }
    return { label: "STANDARD", color: "#94a3b8", badgeBg: "bg-slate-100 text-slate-500 border-slate-200", borderStyle: "border-l-4 border-l-[#94a3b8]" };
  };

  // Perform search and category filtering
  const filteredQueue = useMemo(() => {
    return queueItems.filter((item) => {
      // 1. Search Query filter
      const q = query.trim().toLowerCase();
      const matchesSearch = !q || [item.ticket, item.name].some((val) =>
        String(val || "").toLowerCase().includes(q)
      );

      if (!matchesSearch) return false;

      // 2. Category Tab filter
      if (categoryFilter === "All") return true;
      const cat = getCategoryDetails(item.ticket).label;
      if (categoryFilter === "VIP Only" && cat === "VIP") return true;
      if (categoryFilter === "Priority" && cat === "PRIORITY") return true;
      if (categoryFilter === "Standard" && cat === "STANDARD") return true;

      return false;
    });
  }, [query, categoryFilter, queueItems]);

  // Paginated active rows
  const paginatedQueue = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQueue.slice(start, start + itemsPerPage);
  }, [filteredQueue, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredQueue.length / itemsPerPage));

  // Calculate high-fidelity stats
  const avgWaitTime = queueItems.length
    ? Math.round(queueItems.reduce((sum, item) => sum + (item.waitMins || 0), 0) / queueItems.length)
    : 12;

  const longestWaitTime = queueItems.length
    ? Math.max(...queueItems.map((item) => item.waitMins || 0), 0)
    : 42;

  const longestWaitToken = useMemo(() => {
    if (!queueItems.length) return "A-102";
    const sorted = [...queueItems].sort((a, b) => (b.waitMins || 0) - (a.waitMins || 0));
    return sorted[0]?.ticket?.replace("#", "") || "A-102";
  }, [queueItems]);

  // Handler for row actions
  const handleAction = async (actionName, item) => {
    toast.success(`Action '${actionName}' triggered for token ${item.ticket}`);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a]">Queue List</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Floor Administration
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Top 3 Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Total Waiting Card */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              TOTAL WAITING
            </p>
            <h2 className="text-3xl font-black text-[#0f172a] mt-1.5 tracking-tight">
              {totalInQueue || queueItems.length}
            </h2>
            <p className="text-xs font-bold text-[#10b981] mt-1.5 flex items-center gap-1">
              <span>↑ 12%</span>
              <span className="text-slate-400 font-semibold">from last hour</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 shadow-sm">
            <Users size={20} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Avg Wait Time Card */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              AVG. WAIT TIME
            </p>
            <h2 className="text-3xl font-black text-[#0f172a] mt-1.5 tracking-tight">
              {avgWaitTime}m
            </h2>
            {/* Linear Progress Bar */}
            <div className="mt-3.5 h-1.5 w-32 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-2/5 rounded-full bg-[#10b981]" />
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#10b981] border border-emerald-100 shadow-sm">
            <Activity size={20} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Longest Wait Card */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              LONGEST WAIT
            </p>
            <h2 className="text-3xl font-black text-orange-600 mt-1.5 tracking-tight">
              {longestWaitTime}m
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1.5">
              Token <span className="font-extrabold text-slate-600">#{longestWaitToken}</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 shadow-sm">
            <Clock size={20} className="stroke-[1.75]" />
          </div>
        </div>
      </div>

      {/* Main Table: Queue Detail Card */}
      <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {/* Card Header & Filter Pills */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-slate-500" />
            <span>Queue Detail</span>
          </h2>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5">
            {["All", "VIP Only", "Priority", "Standard"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setCategoryFilter(tab);
                  setCurrentPage(1);
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  (categoryFilter === tab || (tab === "All" && categoryFilter === "All"))
                    ? "bg-[#1e293b] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {tab === "All" ? "All Categories" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Desk Filters */}
        <div className="my-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 sm:max-w-md shadow-inner">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search token or customer..."
            />
          </label>

          <select
            value={selectedCounterId}
            onChange={(e) => onCounterChange(e.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-slate-400"
          >
            <option value="">Select Desk counter</option>
            {counters.map((counter) => (
              <option key={counter._id} value={counter._id}>
                {counter.counterName} ({counter.status})
              </option>
            ))}
          </select>
        </div>

        {/* Custom Structured Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="pb-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">TOKEN #</th>
                <th className="pb-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">CUSTOMER NAME</th>
                <th className="pb-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center">SERVICE TYPE</th>
                <th className="pb-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">WAIT TIME</th>
                <th className="pb-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-semibold text-slate-400">
                    Loading queue records...
                  </td>
                </tr>
              ) : paginatedQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-semibold text-slate-400">
                    No active tokens matched this criteria.
                  </td>
                </tr>
              ) : (
                paginatedQueue.map((item) => {
                  const cat = getCategoryDetails(item.ticket);
                  const isCurrent = item.isCurrent;

                  return (
                    <tr
                      key={item.id}
                      className={`group transition-all duration-200 ${
                        isCurrent ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                      }`}
                    >
                      {/* Token column with custom category left border */}
                      <td className={`py-4 pr-3 text-sm font-black text-slate-800 ${cat.borderStyle} pl-4`}>
                        {item.ticket.replace("#", "")}
                      </td>

                      {/* Customer Name & Sub-details */}
                      <td className="py-4 px-3">
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                            {cat.label === "VIP"
                              ? "Account Inquiry"
                              : cat.label === "PRIORITY"
                              ? "Loan Consultation"
                              : "General Support"}
                          </p>
                        </div>
                      </td>

                      {/* Service Type pill badge */}
                      <td className="py-4 px-3 text-center">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest leading-none ${cat.badgeBg}`}>
                          {cat.label}
                        </span>
                      </td>

                      {/* Wait Time */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          <span>{item.wait.replace(" mins", "")} mins</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Serve Next Card Button */}
                          <button
                            onClick={onServeNext}
                            disabled={!selectedCounterId}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#1e293b] px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#2e3f57] disabled:opacity-30"
                          >
                            <Play size={8} className="fill-white translate-x-px" />
                            <span>Serve Next</span>
                          </button>

                          {/* Recall Button */}
                          <button
                            onClick={onCallCurrent}
                            disabled={!selectedCounterId}
                            className="rounded-full p-2 border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-30"
                            title="Recall announcements"
                          >
                            <RotateCcw size={13} className="stroke-[2.2]" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleAction("Cancel Ticket", item)}
                            className="rounded-full p-2 border border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors"
                            title="Cancel Token"
                          >
                            <X size={13} className="stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: showing active totals and custom pagination controls */}
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-slate-400">
            Showing {paginatedQueue.length} of {filteredQueue.length} active tokens
          </p>

          {/* Interactive Pagination */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} className="stroke-[2]" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pIdx = idx + 1;
              const isSelected = pIdx === currentPage;
              return (
                <button
                  key={pIdx}
                  onClick={() => setCurrentPage(pIdx)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#1e293b] border-[#1e293b] text-white shadow-sm"
                      : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {pIdx}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={14} className="stroke-[2]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

