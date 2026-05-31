export default function LiveQueueStats({ queueInfo, isLoading }) {
  const isQueueActive = !isLoading && queueInfo?.queueStatus === "active";

  return (
    <section className="w-full space-y-3">
      <StatCard
        label="Estimated Wait"
        value={
          isLoading
            ? "--"
            : queueInfo?.estimatedWaitMinutes !== undefined &&
                queueInfo?.estimatedWaitMinutes !== null
              ? String(queueInfo.estimatedWaitMinutes)
              : "--"
        }
        unit="min"
        highlight={isQueueActive}
      />

      <StatCard
        label="Pending Tokens"
        value={
          isLoading
            ? "--"
            : queueInfo?.aheadCount !== undefined && queueInfo?.aheadCount !== null
              ? String(queueInfo.aheadCount)
              : "--"
        }
        unit="total"
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <p className="text-[10px] font-black uppercase tracking-[0.32em] text-slate-400">
          System State
        </p>
        <div className="mt-8 flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isQueueActive ? "bg-teal-500" : "bg-slate-300"
            }`}
          />
          <span className="text-lg font-semibold tracking-tight text-slate-700">
            {isQueueActive ? "Processing" : isLoading ? "Syncing" : "Standby"}
          </span>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, unit, highlight = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <p className="text-[10px] font-black uppercase tracking-[0.32em] text-slate-400">
        {label}
      </p>
      <div className="mt-6 flex items-end gap-2">
        <span
          className={`text-4xl font-black tracking-tight ${
            highlight ? "text-teal-600" : "text-slate-900"
          }`}
        >
          {value}
        </span>
        <span className="pb-1 text-[11px] font-bold uppercase tracking-[0.3em] text-slate-300">
          {unit}
        </span>
      </div>
    </div>
  );
}
