import { Link } from "react-router-dom";

export default function TokenSuccessCard({ token, customerName }) {
  const tokenId = token?.id || token?._id || "";
  const trackingUrl = `/token-status?tokenId=${encodeURIComponent(
    tokenId,
  )}&department=${encodeURIComponent(token.department || "")}&tokenNumber=${encodeURIComponent(
    token.tokenNumber || "",
  )}`;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative overflow-hidden rounded-[12px] border border-slate-200 bg-[#fbfcff] px-4 py-5 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-6 sm:py-8">
        <p className="mt-7 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
          Assigned Number
        </p>

        <h2 className="mt-2 font-display text-[42px] font-black tracking-tight text-slate-950 sm:text-[56px] lg:text-[68px]">
          {token.tokenNumber}
        </h2>

        <div className="mx-auto mt-4 max-w-md space-y-2">
          <p className="text-[13px] font-semibold text-slate-800">
            Your spot is reserved.
          </p>
          <p className="text-[13px] leading-6 text-slate-500">
            Electronic confirmation has been stored. Track your live status below.
          </p>
          {customerName ? (
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
              {customerName}
            </p>
          ) : null}
        </div>

        <Link
          to={trackingUrl}
          className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-slate-950 px-5 py-3 text-[12px] font-black uppercase tracking-[0.22em] text-white shadow-lg shadow-slate-950/10 transition-all hover:bg-slate-800 active:scale-[0.99] sm:w-auto sm:text-[13px] sm:tracking-[0.28em]"
        >
          Monitor Live Status
          
        </Link>

        <p className="mt-7 text-[9px] font-black uppercase tracking-[0.32em] text-slate-400">
          System ID: {tokenId.slice(-8).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
