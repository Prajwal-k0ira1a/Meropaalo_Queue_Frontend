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
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-teal-600">
          Department Access
        </p>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Sign in to continue
        </h2>
        <p className="text-sm text-slate-500">
          {departmentName
            ? `Authenticate for ${departmentName} and continue to your QR queue.`
            : "Authenticate to continue to your QR queue."}
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
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
  );
}
