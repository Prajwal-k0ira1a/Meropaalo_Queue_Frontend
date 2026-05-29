import CurrentlyServing from "./CurrentlyServing";
import UpcomingQueue from "./UpcomingQueue";

export default function DashboardPage(props) {
  return (
    <div className="flex flex-1 flex-col gap-4 xl:gap-5">
      <CurrentlyServing {...props} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 text-xs font-semibold tracking-wide text-teal-700">
              SESSION SUMMARY
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500">
                  SERVED TODAY
                </p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">
                  {props.servedToday || 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500">
                  AVG. SERVICE
                </p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">
                  {props.avgServiceMinutes || 0}m
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500">
                  QUEUE IN
                </p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">
                  {props.totalInQueue || 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500">
                  ERROR STATUS
                </p>
                <p className="mt-1 text-lg font-extrabold text-emerald-600">
                  OK
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
            QUEUE SUMMARY
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500">
                SERVED TODAY
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">
                {props.servedToday || 0}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500">
                AVG. SERVICE
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">
                {props.avgServiceMinutes || 0}m
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500">
                QUEUE IN
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">
                {props.totalInQueue || 0}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500">
                ERROR STATUS
              </p>
              <p className="mt-1 text-lg font-extrabold text-emerald-600">
                OK
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
              UPCOMING QUEUE
            </div>
            <UpcomingQueue {...props} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
            QUEUE STATS
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Next in queue</span>
              <span className="font-semibold text-slate-900">
                #{props.upcomingQueue?.[0]?.ticket?.replace("#", "") || "-"}
              </span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total waiting</span>
              <span className="font-semibold text-slate-900">
                {props.totalInQueue || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
