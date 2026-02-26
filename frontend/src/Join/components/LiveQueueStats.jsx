/**
 * LiveQueueStats — High Precision
 * A technical metrics grid for high-density information display.
 * Avoids "AI-style" flourishes for a strictly professional, industrial look.
 */
export default function LiveQueueStats({ queueInfo, isLoading }) {
    const isQueueActive = !isLoading && queueInfo?.queueStatus === "active";

    return (
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Wait Time */}
            <StatBlock
                label="Estimated Wait"
                value={
                    isLoading
                        ? "—"
                        : queueInfo?.estimatedWaitMinutes !== undefined &&
                            queueInfo?.estimatedWaitMinutes !== null
                          ? String(queueInfo.estimatedWaitMinutes)
                          : "—"
                }
                unit="min"
                highlight={isQueueActive}
            />

            {/* People Ahead */}
            <StatBlock
                label="Pending Tokens"
                value={
                    isLoading
                        ? "—"
                        : queueInfo?.aheadCount !== undefined &&
                            queueInfo?.aheadCount !== null
                          ? String(queueInfo.aheadCount)
                          : "—"
                }
                unit="total"
            />

            {/* Status Indicator */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-32">
                <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase font-display">
                    System State
                </p>
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isQueueActive ? 'bg-teal-500' : 'bg-slate-300'}`} />
                    <span className={`text-base font-semibold tracking-tight ${isQueueActive ? 'text-slate-900' : 'text-slate-500'}`}>
                        {isQueueActive ? "Processing" : (isLoading ? "Syncing..." : "Standby")}
                    </span>
                </div>
            </div>

        </section>
    );
}

function StatBlock({ label, value, unit, highlight = false }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-32 transition-colors duration-300">
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase font-display">
                {label}
            </p>
            <div className="flex items-baseline gap-1.5">
                <span className={`text-4xl font-semibold tracking-tighter ${highlight ? 'text-teal-600' : 'text-slate-900'}`}>
                    {value}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {unit}
                </span>
            </div>
        </div>
    );
}
