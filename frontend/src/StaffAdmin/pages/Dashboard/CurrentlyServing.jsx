import { Clock3, Megaphone, PlayCircle, CheckCircle2, MonitorSmartphone } from "lucide-react";
import LottieLoader from "../../../components/LottieLoader";
import StatusBadge from "../../components/StatusBadge";

const formatStatus = (status) => {
  if (!status) return "WAITING";
  return String(status).toUpperCase();
};

export default function CurrentlyServing({
  currentToken,
  actionLoading,
  onServeNext,
  onCompleteCurrent,
  onCallCurrent,
  selectedCounterId,
  counters = [],
  onCounterChange,
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Current Service
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          Active token and counter controls
        </h2>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Serving ticket
              </span>
              <StatusBadge status={currentToken?.status} />
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-5xl font-black leading-none tracking-tight text-slate-950 sm:text-7xl">
                  {currentToken?.ticket || "-"}
                </div>
                <div className="mt-4 text-lg font-semibold text-slate-800">
                  {currentToken?.name || "No token is currently active"}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock3 size={14} />
                  Waiting time: {currentToken?.waitMins ?? 0} mins
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Selected counter
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MonitorSmartphone size={15} />
                  {selectedCounterId
                    ? counters.find((counter) => counter._id === selectedCounterId)
                        ?.counterName || "Assigned counter"
                    : "Select a counter"}
                </div>
              </div>
            </div>

            <div className="mt-5 max-w-xs">
              <select
                value={selectedCounterId}
                onChange={(e) => onCounterChange(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-500"
              >
                <option value="">Select counter</option>
                {counters.map((counter) => (
                  <option key={counter._id} value={counter._id}>
                    {counter.counterName} ({counter.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              Session status
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Current ticket
                </p>
                <p className="mt-2 text-2xl font-black">
                  {formatStatus(currentToken?.status)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Next action
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-100">
                  Serve, recall, or complete using the controls below.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={onServeNext}
            disabled={actionLoading || !selectedCounterId}
            className="rounded-2xl bg-slate-900 px-4 py-5 text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              {actionLoading ? (
                <LottieLoader
                  size={18}
                  className="shrink-0"
                  ariaLabel="Serving next token"
                />
              ) : (
                <PlayCircle size={18} />
              )}
              <span className="text-xs font-semibold tracking-[0.22em]">
                {actionLoading ? "PROCESSING" : "SERVE NEXT"}
              </span>
            </div>
          </button>
          <button
            onClick={onCompleteCurrent}
            disabled={actionLoading || !currentToken || !selectedCounterId}
            className="rounded-2xl bg-slate-700 px-4 py-5 text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              {actionLoading ? (
                <LottieLoader
                  size={18}
                  className="shrink-0"
                  ariaLabel="Processing current token"
                />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span className="text-xs font-semibold tracking-[0.22em]">
                COMPLETE
              </span>
            </div>
          </button>
          <button
            onClick={onCallCurrent}
            disabled={actionLoading || !currentToken || !selectedCounterId}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-slate-800 transition-transform hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              {actionLoading ? (
                <LottieLoader
                  size={18}
                  className="shrink-0"
                  ariaLabel="Processing current token"
                />
              ) : (
                <Megaphone size={18} />
              )}
              <span className="text-xs font-semibold tracking-[0.22em]">
                RECALL
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
