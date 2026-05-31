import LottieLoader from "./LottieLoader";

export default function LoadingScreen({
  title = "Loading",
  subtitle = "Please wait while we prepare your view.",
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.28),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.16),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#134e4a_100%)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px] sm:bg-[size:40px_40px] lg:bg-[size:48px_48px]" />

      <div className="relative z-10 flex h-screen w-screen flex-col items-center justify-center px-4 text-center sm:px-6">
        <div className="flex w-full max-w-[96vw] flex-col items-center justify-center">
          <div className="flex min-h-[54vh] w-full max-w-[1400px] items-center justify-center sm:min-h-[62vh] lg:min-h-[72vh]">
            <LottieLoader
              size="clamp(190px, 50vw, 620px)"
              className="max-w-full drop-shadow-[0_0_50px_rgba(45,212,191,0.22)]"
              ariaLabel={title}
            />
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.5em] text-teal-200/80 sm:text-xs">
            MeroPaalo
          </p>
          <p className="mt-3 text-xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {title}
          </p>
          <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-slate-200/90 sm:text-sm">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
