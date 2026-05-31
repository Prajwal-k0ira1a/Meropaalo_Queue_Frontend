import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LottieLoader from "../../../components/LottieLoader";

function tokenColor(token) {
  const prefix = token.charAt(0);
  if (prefix === "A") return "bg-teal-100 text-teal-700";
  if (prefix === "B") return "bg-rose-100 text-rose-600";
  if (prefix === "C") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

export default function LiveQueueTable({
  rows,
  totalWaiting,
  serving,
  onServeNext,
  queueActive,
  loading,
}) {
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Live Queue Management</h2>
        <div className="flex items-center gap-2">
          <button className="rounded-lg p-2 hover:bg-gray-100" disabled>
            <Search size={16} className="text-gray-400" />
          </button>
          <button className="rounded-lg p-2 hover:bg-gray-100" disabled>
            <SlidersHorizontal size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="-mx-4 min-h-0 flex-1 overflow-auto sm:-mx-5">
        <table className="min-w-130 w-full">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-4 pb-2 sm:px-5">Token #</th>
              <th className="pb-2">Customer Name</th>
              <th className="hidden pb-2 sm:table-cell">Service</th>
              <th className="pb-2">Wait Time</th>
              <th className="pb-2 pr-4 sm:pr-5"></th>
            </tr>
          </thead>
          <tbody>
            {!queueActive && (
              <tr className="border-t border-gray-100">
                <td className="px-4 py-4 text-sm text-amber-700 sm:px-5" colSpan={5}>
                  Queue is not active. Activate queue first to serve tokens.
                </td>
              </tr>
            )}
            {rows.length === 0 && (
              <tr className="border-t border-gray-100">
                <td className="px-4 py-4 text-sm text-gray-500 sm:px-5" colSpan={5}>
                  No waiting tokens in this department.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-4 py-2.5 sm:px-5">
                  <span
                    className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold ${tokenColor(row.token)}`}
                  >
                    {row.token}
                  </span>
                </td>
                <td className="py-2.5 text-sm font-medium text-gray-800">{row.name}</td>
                <td className="hidden py-2.5 text-sm text-gray-500 sm:table-cell">{row.service}</td>
                <td className="py-2.5">
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${row.urgent ? "text-red-500" : "text-green-600"}`}
                  >
                    {row.urgent && <AlertTriangle size={13} />}
                    {row.wait}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right sm:pr-5">
                  <button
                    onClick={onServeNext}
                    disabled={loading || !queueActive}
                    className="rounded-lg border border-teal-600 px-3 py-1 text-xs font-semibold text-teal-600 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-1.5">
                        <LottieLoader
                          size={14}
                          className="shrink-0"
                          ariaLabel="Serving next token"
                        />
                        Processing...
                      </span>
                    ) : (
                      "Serve Next"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
        <p className="text-xs font-medium text-teal-600">
          Showing {rows.length} of {totalWaiting} waiting
          {serving ? ` | Serving ${serving}` : ""}
        </p>
        <div className="flex items-center gap-1">
          <button className="rounded-md p-1 hover:bg-gray-100" disabled>
            <ChevronLeft size={15} className="text-gray-400" />
          </button>
          <button className="rounded-md p-1 hover:bg-gray-100" disabled>
            <ChevronRight size={15} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
