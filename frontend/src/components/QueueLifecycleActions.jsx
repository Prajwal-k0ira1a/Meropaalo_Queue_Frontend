import { Play, RefreshCw, RotateCcw, Square } from "lucide-react";

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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[action.tone]}`}
          >
            <Icon size={14} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
