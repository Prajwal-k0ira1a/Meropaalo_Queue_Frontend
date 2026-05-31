import { Lock, Mail } from "lucide-react";
import LottieLoader from "../../components/LottieLoader";
import { Button } from "../../Authentication/components/Button";
import { Input } from "../../Authentication/components/Input";

export default function JoinLoginCard({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isSubmitting,
  departmentName,
  error,
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-[#fbfcff] px-4 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-6 sm:py-7">
      <div className="absolute inset-x-0 top-0 h-1 bg-teal-500" />

      <div className="mx-auto max-w-md">
        <div className="mb-5 space-y-2 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-teal-600">
            Department Access
          </p>
          <h2 className="font-display text-[28px] font-black tracking-tight text-slate-950 sm:text-[30px]">
            Sign in to continue
          </h2>
          <p className="text-[13px] leading-6 text-slate-500">
            {departmentName
              ? `Authenticate for ${departmentName} and continue to your queue dashboard.`
              : "Authenticate to continue to your queue dashboard."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="jane@example.com"
            icon={Mail}
            autoComplete="email"
            required
            disabled={isSubmitting}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            autoComplete="current-password"
            required
            disabled={isSubmitting}
          />

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LottieLoader size={18} className="shrink-0" ariaLabel="Signing in" />
                Signing in...
              </>
            ) : (
              "Continue to Queue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
