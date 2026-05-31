export default function StatCard({ label, value, icon: Icon, valueColor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-3xl font-bold ${valueColor || "text-slate-900"}`}>
          {value}
        </span>
        {Icon ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <Icon size={18} className="text-slate-600" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
