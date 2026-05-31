import { Clock3, Sparkles } from "lucide-react";
import HistoryChart from "./HistoryChart";

export default function ServiceHistoryPage({
  historyRecords = [],
  avgServiceMinutes = 0,
  loading,
}) {
  return (
    <div className="flex-1 space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Service History
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
              Keep a polished record of completed sessions.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Review completed tokens, timing, and provider activity without
              losing sight of the day&apos;s pace.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            <Sparkles size={14} />
            Completed sessions
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
        <HistoryChart />
        <div className="flex flex-col justify-between rounded-[28px] bg-gradient-to-br from-teal-600 to-slate-950 p-6 text-white shadow-lg">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm opacity-90">
              <Clock3 size={14} />
              Avg. Service Time
            </p>
            <p className="text-4xl font-black leading-none sm:text-5xl">
              {avgServiceMinutes}{" "}
              <span className="text-lg font-normal">mins</span>
            </p>
          </div>
          <div className="mt-6 inline-flex self-start rounded-full bg-white/10 px-4 py-2 text-sm">
            Live from today&apos;s completed tokens
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {["TOKEN", "CUSTOMER", "SERVICE PROVIDER", "SERVICE DURATION", "COMPLETED AT"].map((h) => (
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
              {!loading && historyRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-sm text-slate-500">
                    No completed sessions found.
                  </td>
                </tr>
              )}
              {historyRecords.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-50 transition-colors hover:bg-slate-50"
                >
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {r.ticket}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm font-medium text-slate-800">
                    {r.patient}
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-700">
                    {r.provider}
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600">
                    {r.durationMinutes ? `${r.durationMinutes}m` : "-"}
                  </td>
                  <td className="px-3 py-4 text-sm font-semibold text-slate-900">
                    {r.completedAt}
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
