import { Play, RefreshCw, RotateCcw, Square } from "lucide-react";
import LottieLoader from "./LottieLoader";

export default function QueueLifecycleActions({
  queueStatus,
  loading = false,
  onRefresh,
  onActivateQueue,
  onCloseQueue,
  onResetQueue,
}) {
  const queueClosable = queueStatus === "active" || queueStatus === "paused";

  const actions = [
    {
      icon: RefreshCw,
      label: "Refresh",
      onClick: onRefresh,
      disabled: loading || !onRefresh,
      tone: "neutral",
    },
    {
      icon: Play,
      label: queueStatus === "active" ? "Queue Active" : "Activate Queue",
      onClick: onActivateQueue,
      disabled: loading || !onActivateQueue,
      tone: "accent",
    },
    {
      icon: Square,
      label: "Close Queue",
      onClick: onCloseQueue,
      disabled: loading || !onCloseQueue || !queueClosable,
      tone: "danger",
    },
    {
      icon: RotateCcw,
      label: "Regenerate Queue",
      onClick: onResetQueue,
      disabled: loading || !onResetQueue,
      tone: "warning",
    },
  ];

  const toneClasses = {
    neutral: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    accent: "border-teal-600 bg-teal-600 text-white hover:bg-teal-700",
    danger: "border-red-600 bg-white text-red-700 hover:bg-red-50",
    warning: "border-amber-600 bg-white text-amber-700 hover:bg-amber-50",
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Queue Controls
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Open, close, refresh, or regenerate today&apos;s queue.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {String(queueStatus || "closed").toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[action.tone]}`}
            >
              {loading ? (
                <>
                  <LottieLoader
                    size={14}
                    className="shrink-0"
                    ariaLabel={action.label}
                  />
                  {action.label}
                </>
              ) : (
                <>
                  <Icon size={14} />
                  {action.label}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
