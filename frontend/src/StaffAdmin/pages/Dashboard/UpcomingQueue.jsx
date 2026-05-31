import { Link } from "react-router-dom";

export default function UpcomingQueue({
  upcomingQueue = [],
  totalInQueue = 0,
  departmentId = "",
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Upcoming Queue
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Next tickets
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {totalInQueue} waiting
          </span>
        </div>
      </div>

      <div className="space-y-2 p-5 sm:p-6">
        {upcomingQueue.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
            No waiting tokens in queue right now.
          </div>
        )}

        {upcomingQueue.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-4 transition-colors ${
              item.next
                ? "border border-teal-200 bg-teal-50/80"
                : "border border-slate-100 bg-slate-50/80 hover:bg-slate-100/70"
            }`}
          >
            <div className="min-w-0">
              <Link
                to={`/token-status?tokenId=${encodeURIComponent(item.id)}&department=${encodeURIComponent(departmentId)}`}
                className="text-base font-bold tracking-tight text-slate-950 underline-offset-2 hover:text-teal-700 hover:underline"
              >
                {item.ticket}
              </Link>
              <p className="mt-1 truncate text-sm text-slate-500">
                {item.name}
              </p>
            </div>

            <div className="text-right">
              {item.next && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Next
                </p>
              )}
              <p
                className={`mt-1 text-sm font-semibold ${
                  item.next ? "text-teal-700" : "text-slate-700"
                }`}
              >
                {item.wait}
              </p>
              <p className="text-xs text-slate-400">waiting</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
