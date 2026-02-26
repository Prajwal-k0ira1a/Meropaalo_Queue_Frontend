/**
 * CheckInCard — Simplified & Professional
 * Minimalist design focusing on the primary call to action.
 * Uses consistent brand colors and clean typography.
 */
export default function CheckInCard({
  onJoin,
  isJoining,
  canJoin,
  sessionId,
  customerName,
}) {
  return (
    <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
      {/* Design Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500/20 via-teal-500 to-teal-500/20" />

      {/* Header section */}
      <div className="space-y-2 mb-8 mt-2">
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight font-display">
          Ready to join?
        </h2>
        {customerName && (
          <p className="text-sm text-teal-600 font-semibold">
            Welcome, {customerName}
          </p>
        )}
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          Reserve your virtual spot. We will notify you when it's time for your
          visit.
        </p>
      </div>

      {/* Action area */}
      <div className="space-y-6">
        <button
          onClick={onJoin}
          disabled={!canJoin || isJoining}
          className="w-full py-4 px-6 bg-teal-600 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-md shadow-teal-500/10 hover:bg-teal-700 hover:shadow-teal-500/20 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          {isJoining ? (
            <>
              <LoadingSpinner />
              Processing...
            </>
          ) : (
            <>
              Take My Token
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>

        {/* System Info — Technical & Precise */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold font-display">
              Session ID
            </span>
            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-tighter mt-0.5">
              {sessionId || "—"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold font-display block">
              Verification
            </span>
            <span className="text-[10px] text-teal-600 font-bold flex items-center gap-1 justify-end mt-0.5">
              <ShieldIcon /> Validated
            </span>
          </div>
        </div>
      </div>

      {/* Overlay for Closed State */}
      {!canJoin && !isJoining && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center p-6 text-center z-20">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-lg max-w-[200px]">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              Service Standby
            </p>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">
              Remote token issuance is temporarily inactive.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}
