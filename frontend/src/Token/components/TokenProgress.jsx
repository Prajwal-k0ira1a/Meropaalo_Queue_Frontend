import { useMemo } from "react";

/**
 * TokenProgress — Clean Completion Bar
 * Shows a percentage-based progress bar with a teal fill and a checkmark icon.
 * Matches the clean MeroPaalo white design system.
 *
 * @param {string} status - One of: "queue", "next", "serving", "completed"
 */
export default function TokenProgress({ status = "queue" }) {
  const { percent, label, isComplete } = useMemo(() => {
    switch (status) {
      case "serving":
        return { percent: 100, label: "Completed", isComplete: true };
      case "next":
        return { percent: 75, label: "Almost there", isComplete: false };
      case "queue":
        return { percent: 35, label: "In Queue", isComplete: false };
      default:
        return { percent: 10, label: "Registered", isComplete: false };
    }
  }, [status]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* Top Row: Icon + Percentage + Label */}
      <div className="flex items-center gap-3 mb-4">
        {/* Status Icon */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${
            isComplete
              ? "bg-teal-500 text-white"
              : "bg-teal-50 border border-teal-200 text-teal-600"
          }`}
        >
          {isComplete ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin-slow"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
        </div>

        {/* Percentage and Label */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
            {percent}%
          </span>
          <span className="text-sm font-semibold text-slate-500">{label}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percent}%`,
            background: isComplete
              ? "#14b8a6"
              : "linear-gradient(90deg, #14b8a6, #2dd4bf)",
          }}
        />
      </div>

      {/* Step indicators below bar */}
      <div className="flex justify-between mt-3">
        {["Registered", "In Queue", "Next Up", "Serving"].map((stepLabel, idx) => {
          const stepPercent = [0, 35, 75, 100][idx];
          const isDone = percent >= stepPercent;
          return (
            <span
              key={stepLabel}
              className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-500 ${
                isDone ? "text-teal-600" : "text-slate-300"
              }`}
            >
              {stepLabel}
            </span>
          );
        })}
      </div>
    </div>
  );
}
