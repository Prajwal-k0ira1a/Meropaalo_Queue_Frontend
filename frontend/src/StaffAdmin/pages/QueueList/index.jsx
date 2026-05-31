import { useMemo, useState } from "react";
import {
  Search,
  Users,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Avatar from "../../components/Avatar";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/StatCard";

export default function QueueListPage({
  queueItems = [],
  loading,
  error,
  servedToday,
  totalInQueue,
  selectedCounterId,
  counters = [],
  onCounterChange,
}) {
  const [query, setQuery] = useState("");

  const filteredQueue = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return queueItems;
    return queueItems.filter((item) =>
      [item.ticket, item.name].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [query, queueItems]);

  const avgWaitMinutes = queueItems.length
    ? Math.round(
        queueItems.reduce((sum, item) => sum + (item.waitMins || 0), 0) /
          queueItems.length,
      )
    : 0;

  const priorityCases = queueItems.filter((item) => item.status === "missed").length;

  return (
    <div className="flex-1 space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Queue Operations
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              Inspect every active token in one list.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Search by ticket or customer, switch counters, and keep an eye on
              wait times as the line moves.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            <Sparkles size={14} />
            Live queue overview
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="TOTAL IN QUEUE" value={String(totalInQueue)} icon={Users} />
        <StatCard
          label="AVG. WAIT TIME"
          value={`${avgWaitMinutes}m`}
          icon={Clock3}
          valueColor="text-amber-600"
        />
        <StatCard
          label="MISSED CASES"
          value={String(priorityCases)}
          icon={AlertTriangle}
          valueColor="text-rose-600"
        />
        <StatCard
          label="SERVED TODAY"
          value={String(servedToday)}
          icon={CheckCircle2}
          valueColor="text-teal-600"
        />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:max-w-md">
            <Search size={15} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search token or customer..."
            />
          </label>
          <select
            value={selectedCounterId}
            onChange={(e) => onCounterChange(e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-500"
          >
            <option value="">Select counter</option>
            {(Array.isArray(counters) ? counters : []).map((counter) => (
              <option key={counter._id} value={counter._id}>
                {counter.counterName} ({counter.status})
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {["TOKEN", "CUSTOMER", "CHECK-IN", "WAIT TIME", "STATUS"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && filteredQueue.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-sm text-slate-500">
                    No queue records found.
                  </td>
                </tr>
              )}
              {(Array.isArray(filteredQueue) ? filteredQueue : []).map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-slate-50 transition-colors ${
                    p.isCurrent ? "bg-teal-50/60" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-3 py-4 text-sm font-semibold text-slate-900">
                    {p.ticket}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={p.initials} />
                      <span className="text-sm font-medium text-slate-800">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600">
                    {p.checkIn}
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600">
                    {p.wait}
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
