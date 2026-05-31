import { BarChart3, CircleSlash2, Clock3, Users } from "lucide-react";
import CurrentlyServing from "./CurrentlyServing";
import UpcomingQueue from "./UpcomingQueue";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";

const statusTone = {
  active: "text-emerald-300",
  paused: "text-amber-300",
  closed: "text-rose-300",
};

export default function DashboardPage(props) {
  const counterCount = Array.isArray(props.counters) ? props.counters.length : 0;

  return (
    <div className="flex flex-1 flex-col gap-5 xl:gap-6">
      <section className="rounded-[30px] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Staff Operations
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Queue dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Keep serving, calling, and closing actions in one place with the
              live queue and history nearby.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Queue Status
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={props.queueStatus} />
                <span
                  className={`text-sm font-semibold ${
                    props.queueStatus === "active"
                      ? "text-emerald-600"
                      : props.queueStatus === "paused"
                        ? "text-amber-600"
                        : "text-rose-600"
                  }`}
                >
                  {String(props.queueStatus || "closed").toUpperCase()}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Active Counter
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {props.selectedCounterId ? "Selected" : "Not selected"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="SERVING NOW"
          value={props.currentToken?.ticket || "-"}
          icon={BarChart3}
        />
        <StatCard
          label="WAITING IN LINE"
          value={String(props.totalInQueue || 0)}
          icon={Users}
        />
        <StatCard
          label="AVERAGE SERVICE"
          value={`${props.avgServiceMinutes || 0}m`}
          icon={Clock3}
          valueColor="text-amber-600"
        />
        <StatCard
          label="COUNTERS ACTIVE"
          value={String(counterCount)}
          icon={CircleSlash2}
          valueColor="text-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <CurrentlyServing {...props} />
        <div className="grid gap-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Summary
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Today
                </h2>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Served today
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {props.servedToday || 0}
                </p>
              </div>
            </div>
          </div>
          <UpcomingQueue {...props} />
        </div>
      </div>
    </div>
  );
}
