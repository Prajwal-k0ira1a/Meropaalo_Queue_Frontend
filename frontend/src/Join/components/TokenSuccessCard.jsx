import { Link } from "react-router-dom";

export default function TokenSuccessCard({ token, customerName }) {
  const tokenId = token?.id || token?._id || "";
  const trackingUrl = `/token-status?tokenId=${encodeURIComponent(tokenId)}&department=${encodeURIComponent(token.department || "")}&tokenNumber=${encodeURIComponent(token.tokenNumber)}`;

  return (
    <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm text-center relative overflow-hidden">
        {/* Technical Design Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-teal-500" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest font-display">
              Confirmation Token Issued
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 font-display">
            Assigned Number
          </p>

          <h2 className="text-7xl md:text-8xl font-semibold text-slate-900 tracking-tighter mb-6 font-display">
            {token.tokenNumber}
          </h2>

          <div className="flex flex-col gap-2 mb-8">
            <p className="text-sm font-semibold text-slate-800 tracking-tight">
              Your spot is reserved.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">
              Electronic confirmation has been stored. Track your status below.
            </p>
          </div>

          <Link
            to={trackingUrl}
            className="group flex items-center justify-center gap-2 w-full py-4 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-md hover:bg-slate-800 active:scale-95"
          >
            Monitor Live Status
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
          </Link>

          <p className="mt-8 text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] font-display">
            System ID: {tokenId.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
