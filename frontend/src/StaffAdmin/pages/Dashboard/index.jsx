import { Play, Check, RotateCcw, X, AlertCircle, ChevronDown } from "lucide-react";

export default function DashboardPage({
  loading,
  actionLoading,
  error,
  queueStatus,
  queueItems = [],
  upcomingQueue = [],
  currentToken,
  servedToday = 0,
  avgServiceMinutes = 0,
  totalInQueue = 0,
  counters = [],
  selectedCounterId,
  onCounterChange,
  onServeNext,
  onCallCurrent,
  onCompleteCurrent,
  onResetQueue,
  onActivateQueue,
  onCloseQueue,
  departmentName,
}) {
  const isQueueActive = queueStatus === "active";
  
  // Format stats with leading zero if needed
  const padZero = (num) => (num < 10 && num >= 0 ? `0${num}` : num);
  
  // Get active counter name
  const activeCounterName = selectedCounterId
    ? counters.find((c) => c._id === selectedCounterId)?.counterName || "Counter 1"
    : "Counter 1";

  // Calculate mock or real next ticket number
  const hasWaitingTokens = upcomingQueue.length > 0;
  const nextTicketNumber = hasWaitingTokens ? upcomingQueue[0]?.ticket : "Nobody waiting";

  // Calculate estimated wait
  const estWait = totalInQueue > 0 ? totalInQueue * 5 : 0;
  const hasCurrentToken = Boolean(currentToken);
  const ringStrokeOffset = hasCurrentToken ? "90" : "377";
  const ringStrokeClass = hasCurrentToken
    ? "stroke-[#10b981]"
    : "stroke-slate-300";

  // Toggle active switch handler
  const handleActiveToggle = () => {
    if (isQueueActive) {
      onCloseQueue();
    } else {
      onActivateQueue();
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a]">{departmentName}</h1>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Staff Queue Panel
          </p>
        </div>
        
        {/* Counter Selection Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Active Desk:</span>
          <select
            value={selectedCounterId}
            onChange={(e) => onCounterChange(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-all focus:border-slate-400"
          >
            <option value="">Select counter</option>
            {counters.map((counter) => (
              <option key={counter._id} value={counter._id}>
                {counter.counterName} ({counter.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Main Grid: Live Status & Queue Controls */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Live Status Circular Progress Widget */}
        <div className="lg:col-span-2 rounded-[20px] border border-slate-100 bg-white p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col justify-between relative overflow-hidden min-h-[290px]">
          {/* Active status indicator */}
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isQueueActive ? "bg-[#10b981] animate-pulse" : "bg-rose-500"}`} />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              LIVE STATUS: {queueStatus.toUpperCase()}
            </span>
          </div>

          {/* Breathtaking Circular Ring Serving Widget */}
          <div className="flex flex-col items-center justify-center my-4 flex-1">
            <div className="relative flex items-center justify-center h-36 w-36">
              {/* Outer SVG ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                {/* Background track circle */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className="stroke-slate-100"
                  strokeWidth="5"
                  fill="transparent"
                />
                {/* Colorful dynamic active circle */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className={`${ringStrokeClass} transition-all duration-500`}
                  strokeWidth="6"
                  strokeDasharray="377"
                  strokeDashoffset={ringStrokeOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Central Text Details */}
              <div className="text-center z-10 flex flex-col items-center px-3">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  CURRENTLY SERVING
                </p>
                <h2 className="text-3xl font-black text-[#0f172a] tracking-tight mt-0.5 leading-none">
                  {currentToken?.ticket || "Nobody waiting"}
                </h2>
                {currentToken && (
                  <span className="mt-2 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold bg-emerald-50 text-[#10b981] border border-emerald-100 uppercase tracking-widest leading-none">
                    {currentToken.category || "VIP SERVICE"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Card Statistics row */}
          <div className="grid grid-cols-3 border-t border-slate-100 pt-4 mt-1 text-center">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Estimated Wait
              </p>
              <p className="text-sm font-black text-slate-800 mt-0.5">
                {estWait} mins
              </p>
            </div>
            <div className="border-x border-slate-100">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Tickets in Line
              </p>
              <p className="text-sm font-black text-slate-800 mt-0.5">
                {padZero(totalInQueue)}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Avg. Service Time
              </p>
              <p className="text-sm font-black text-slate-800 mt-0.5">
                {padZero(avgServiceMinutes)}:00
              </p>
            </div>
          </div>
        </div>

        {/* Queue Controls panel */}
        <div className="rounded-[20px] border border-slate-100 bg-white p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Queue Controls</h2>
            
            {/* Toggle Switch */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isQueueActive ? "bg-[#10b981]" : "bg-slate-300"}`} />
                <span className="text-xs font-semibold text-slate-700">Queue Active</span>
              </div>
              <button
                onClick={handleActiveToggle}
                disabled={actionLoading}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isQueueActive ? "bg-[#10b981]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isQueueActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Close Queue Button */}
            <button
              onClick={onCloseQueue}
              disabled={actionLoading || !isQueueActive}
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-left transition-all hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 group"
            >
              <div className="flex items-center gap-2.5">
                <X size={14} className="text-rose-500 stroke-[2.5]" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-rose-600">Close Queue</span>
              </div>
            </button>

            {/* Regenerate Queue Button */}
            <button
              onClick={onResetQueue}
              disabled={actionLoading}
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-left transition-all hover:bg-slate-50 disabled:opacity-50 group"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw size={14} className="text-slate-500 group-hover:text-slate-800" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-800">Regenerate Queue</span>
              </div>
            </button>

          </div>

          {/* Operator Tip Card */}
          <div className="mt-4 rounded-xl border border-slate-100 bg-sky-50/50 p-3 flex gap-2">
            <AlertCircle size={15} className="text-sky-500 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <p className="font-extrabold uppercase tracking-wider text-sky-700">OPERATOR TIP</p>
              <p className="mt-0.5 text-sky-600 leading-relaxed font-medium">
                Consider activating secondary counters if wait times exceed 15 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Quick Actions (Serve Next, Complete, Recall) */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {/* Serve Next Card */}
        <button
          onClick={onServeNext}
          disabled={actionLoading || !selectedCounterId}
          className="rounded-[20px] bg-[#1e293b] p-4.5 text-white text-left shadow-sm transition-all hover:bg-[#27354a] hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white mb-4">
            <Play size={14} className="fill-white translate-x-0.5" />
          </div>
          <h3 className="text-lg font-bold tracking-tight">Serve Next</h3>
          <p className="mt-1 text-[11px] text-slate-300 leading-normal font-medium">
            {hasWaitingTokens
              ? `Call ticket ${nextTicketNumber} to ${activeCounterName}`
              : "Nobody is waiting right now"}
          </p>
        </button>

        {/* Complete Card */}
        <button
          onClick={onCompleteCurrent}
          disabled={actionLoading || !currentToken || !selectedCounterId}
          className="rounded-[20px] border border-slate-100 bg-white p-4.5 text-left shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all hover:bg-slate-50 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[#10b981] mb-4">
            <Check size={16} className="stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-slate-800">Complete</h3>
          <p className="mt-1 text-[11px] text-slate-400 leading-normal font-medium">
            Mark current ticket as served
          </p>
        </button>

        {/* Recall Card */}
        <button
          onClick={onCallCurrent}
          disabled={actionLoading || !currentToken || !selectedCounterId}
          className="rounded-[20px] bg-[#f97316] p-4.5 text-white text-left shadow-sm transition-all hover:bg-[#ea580c] hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white mb-4">
            <RotateCcw size={14} className="stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-bold tracking-tight">Recall</h3>
          <p className="mt-1 text-[11px] text-slate-100 leading-normal font-medium">
            {currentToken
              ? `Repeat announcement for ${currentToken.ticket}`
              : "Nobody is currently waiting"}
          </p>
        </button>
      </div>

      {/* Bottom Grid: Upcoming Queue & Today's Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Upcoming Queue List */}
        <div className="rounded-[20px] border border-slate-100 bg-white p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Upcoming Queue</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-600 uppercase tracking-wider">
                {totalInQueue} TOTAL
              </span>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {upcomingQueue.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No upcoming tokens in queue.
                </div>
              ) : (
                upcomingQueue.map((item, index) => {
                  const isVip = item.ticket.includes("A") || index % 3 === 2; // Simple mockup categorizer
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-3 transition-all hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        {/* Custom index badge */}
                        <div
                          className={`flex h-8 w-10 items-center justify-center rounded-lg font-black text-xs tracking-tight ${
                            isVip
                              ? "bg-emerald-50 text-[#10b981] border border-emerald-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}
                        >
                          {item.ticket}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[9px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                            {isVip ? "VIP Consultation" : "General Inquiry"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-500">
                          Wait: {item.wait}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Today's Activity Custom Line Chart */}
        <div className="rounded-[20px] border border-slate-100 bg-white p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[290px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Today's Activity</h3>
              
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider transition-all hover:bg-slate-50">
                <span>Last 6 Hours</span>
                <ChevronDown size={11} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative w-full h-36 mt-2">
              <svg className="w-full h-full" viewBox="0 0 500 150">
                {/* Gradients */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cffafe" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#cffafe" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="50" y1="120" x2="450" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="50" y1="80" x2="450" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="40" x2="450" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                {/* Gradient Fill under Path */}
                <path
                  d="M 50 120 C 100 110, 150 90, 200 30 C 250 100, 300 70, 350 110 C 400 115, 450 120, 450 120 Z"
                  fill="url(#chartGradient)"
                />

                {/* Line Path */}
                <path
                  d="M 50 120 C 100 110, 150 90, 200 30 C 250 100, 300 70, 350 110 C 400 115, 450 120, 450 120"
                  fill="none"
                  stroke="#0891b2"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Highlight/Interactive dot for Peak Traffic (200, 30) */}
                <circle cx="200" cy="30" r="7" fill="#0f172a" />
                <circle cx="200" cy="30" r="14" fill="#0f172a" fillOpacity="0.1" />
                
                {/* Regular dot for traffic */}
                <circle cx="300" cy="70" r="5" fill="#0891b2" fillOpacity="0.5" />

                {/* X Axis Labels */}
                <text x="50" y="140" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">09:00</text>
                <text x="125" y="140" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">10:00</text>
                <text x="200" y="140" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">11:00</text>
                <text x="275" y="140" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">12:00</text>
                <text x="350" y="140" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">13:00</text>
                <text x="425" y="140" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">14:00</text>
              </svg>
            </div>
          </div>

          {/* Chart Legends */}
          <div className="flex items-center justify-start gap-4 border-t border-slate-100 pt-3 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f172a]" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                Peak Hour (11:00)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-100 border border-cyan-400" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                Average Traffic
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
