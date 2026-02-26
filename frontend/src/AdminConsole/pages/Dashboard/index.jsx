import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import StatCards from "./StatCards";
import LiveQueueTable from "./LiveQueueTable";
import PeakHoursChart from "./PeakHoursChart";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

const EMPTY_DASHBOARD = {
  queueStatus: "closed",
  currentServingNumber: null,
  totalWaitingTokens: 0,
  tokensToday: 0,
  averageWaitTimeMinutes: 0,
  totalCompletedToday: 0,
  institution: null,
  department: null,
};

const hourLabel = (hour24) => {
  if (hour24 === 0) return "12am";
  if (hour24 < 12) return `${hour24}am`;
  if (hour24 === 12) return "12pm";
  return `${hour24 - 12}pm`;
};

const isSameDay = (value, base) => {
  const d = new Date(value);
  return (
    d.getFullYear() === base.getFullYear() &&
    d.getMonth() === base.getMonth() &&
    d.getDate() === base.getDate()
  );
};

const toLocalDateOnly = (value = new Date()) => {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toApiDateOnly = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

export default function DashboardPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [tokens, setTokens] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const queueActive = dashboard.queueStatus === "active";

  const loadDepartments = useCallback(async () => {
    const list = await adminApi.getDepartments();
    const departmentsArr = Array.isArray(list)
      ? list
      : Array.isArray(list?.departments)
        ? list.departments
        : [];
    setDepartments(departmentsArr);
    if (!selectedDepartmentId && departmentsArr.length) {
      setSelectedDepartmentId(departmentsArr[0]._id);
    }
  }, [selectedDepartmentId]);

  const loadDepartmentData = useCallback(async (departmentId) => {
    if (!departmentId) return;

    const [dashboardData, tokenData, counterData] = await Promise.all([
      adminApi.getDashboard(departmentId),
      adminApi.getTokens(departmentId),
      adminApi.getCounters(departmentId),
    ]);

    setDashboard(dashboardData || EMPTY_DASHBOARD);
    setTokens(tokenData || []);
    setCounters(counterData || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        await loadDepartments();
      } catch (err) {
        const errorMsg = err.message || "Failed to load departments";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [loadDepartments]);

  useEffect(() => {
    const run = async () => {
      if (!selectedDepartmentId) return;

      setLoading(true);
      setError("");
      try {
        await loadDepartmentData(selectedDepartmentId);
      } catch (err) {
        const errorMsg = err.message || "Failed to load dashboard data";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [loadDepartmentData, selectedDepartmentId]);

  const waitingRows = useMemo(() => {
    const today = new Date();

    return tokens
      .filter((token) => token.status === "waiting")
      .filter((token) => {
        const queueDayDate = token.queueDay?.date;
        return queueDayDate ? isSameDay(queueDayDate, today) : true;
      })
      .sort(
        (a, b) =>
          new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime(),
      )
      .slice(0, 15)
      .map((token) => {
        const waitMinutes = Math.max(
          0,
          Math.floor((Date.now() - new Date(token.issuedAt).getTime()) / 60000),
        );

        return {
          id: token._id,
          token: token.tokenNumber,
          name: token.customer?.name || "Walk-in Customer",
          service: token.department?.name || "General Service",
          wait: `${waitMinutes}m`,
          urgent: waitMinutes >= 20,
        };
      });
  }, [tokens]);

  const peakHoursData = useMemo(() => {
    const bins = [];
    for (let hour = 8; hour <= 17; hour += 1) {
      bins.push({
        hour: hourLabel(hour),
        hour24: hour,
        value: 0,
        active: false,
      });
    }

    const today = new Date();

    tokens
      .filter((token) => isSameDay(token.issuedAt, today))
      .forEach((token) => {
        const issued = new Date(token.issuedAt);
        const issuedHour = issued.getHours();
        const index = bins.findIndex((bin) => bin.hour24 === issuedHour);
        if (index >= 0) {
          bins[index].value += 1;
        }
      });

    let max = 0;
    bins.forEach((bin) => {
      if (bin.value > max) max = bin.value;
    });
    bins.forEach((bin) => {
      bin.active = max > 0 && bin.value === max;
    });

    return bins;
  }, [tokens]);

  const handleRefresh = useCallback(async () => {
    if (!selectedDepartmentId) return;
    setLoading(true);
    setError("");
    const loadingToast = toast.loading("Refreshing dashboard...");
    try {
      await loadDepartmentData(selectedDepartmentId);
      toast.dismiss(loadingToast);
      toast.success("Dashboard refreshed!");
    } catch (err) {
      const errorMsg = err.message || "Failed to refresh dashboard";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [loadDepartmentData, selectedDepartmentId]);

  const handleServeNext = useCallback(async () => {
    if (!selectedDepartmentId) return;
    if (!queueActive) {
      toast.error("Queue is not active. Activate queue first.");
      setError("Queue is not active. Activate queue first.");
      return;
    }

    const firstOpenCounter = counters.find(
      (counter) => counter.status === "open",
    );
    const fallbackCounter = counters[0];
    const counterId = firstOpenCounter?._id || fallbackCounter?._id;

    if (!counterId) {
      toast.error("No counter available. Create/open a counter first.");
      setError("No counter available. Create/open a counter first.");
      return;
    }

    setActionLoading(true);
    setError("");
    const loadingToast = toast.loading("Serving next token...");
    try {
      await adminApi.serveNext(selectedDepartmentId, counterId);
      toast.dismiss(loadingToast);
      toast.success("Token served!");
      await loadDepartmentData(selectedDepartmentId);
    } catch (err) {
      const errorMsg = err.message || "Failed to serve next token";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  }, [counters, loadDepartmentData, queueActive, selectedDepartmentId]);

  const handleIssueToken = useCallback(async () => {
    if (!selectedDepartmentId) return;
    if (!queueActive) {
      toast.error("Queue is not active. Activate queue first.");
      setError("Queue is not active. Activate queue first.");
      return;
    }

    setActionLoading(true);
    setError("");
    const loadingToast = toast.loading("Issuing token...");
    try {
      await adminApi.issueToken(null, selectedDepartmentId);
      toast.dismiss(loadingToast);
      toast.success("Token issued successfully!");
      await loadDepartmentData(selectedDepartmentId);
    } catch (err) {
      const errorMsg = err.message || "Failed to issue token";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  }, [loadDepartmentData, queueActive, selectedDepartmentId]);

  const handleActivateQueue = useCallback(async () => {
    if (!selectedDepartmentId) return;
    const today = toLocalDateOnly();
    const startTime = "10:00";
    const endTime = "16:00";

    setActionLoading(true);
    setError("");
    const loadingToast = toast.loading("Activating queue...");
    try {
      await adminApi.openQueueDay(
        null,
        selectedDepartmentId,
        today,
        startTime,
        endTime,
      );
      toast.dismiss(loadingToast);
      toast.success("Queue activated!");
      await loadDepartmentData(selectedDepartmentId);
    } catch (err) {
      const errorMsg = err.message || "Failed to activate queue";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  }, [loadDepartmentData, selectedDepartmentId]);

  const handleCloseQueue = useCallback(async () => {
    if (!selectedDepartmentId) return;
    if (dashboard.queueStatus === "closed") {
      toast.error("Queue is already closed.");
      setError("Queue is already closed.");
      return;
    }

    setActionLoading(true);
    setError("");
    const loadingToast = toast.loading("Closing queue...");
    try {
      const today = toLocalDateOnly();
      const queueDays = await adminApi.getQueueDays(selectedDepartmentId);
      const activeToday = (queueDays || []).find(
        (qd) =>
          toApiDateOnly(qd?.date) === today &&
          (qd?.status === "active" || qd?.status === "paused"),
      );

      if (!activeToday?._id) {
        throw new Error("No active queue-day found for today.");
      }

      await adminApi.closeQueueDay(activeToday._id);
      toast.dismiss(loadingToast);
      toast.success("Queue closed!");
      await loadDepartmentData(selectedDepartmentId);
    } catch (err) {
      const errorMsg = err.message || "Failed to close queue";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  }, [dashboard.queueStatus, loadDepartmentData, selectedDepartmentId]);

  const handleResetQueue = useCallback(async () => {
    if (!selectedDepartmentId) return;
    if (
      !window.confirm(
        "Regenerate queue for today? This will cancel waiting/called/serving tokens.",
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError("");
    const loadingToast = toast.loading("Resetting queue...");
    try {
      const today = toLocalDateOnly();
      const queueDays = await adminApi.getQueueDays(selectedDepartmentId);
      const todayQueueDay = (queueDays || []).find(
        (qd) => toApiDateOnly(qd?.date) === today,
      );

      if (!todayQueueDay?._id) {
        throw new Error("No queue-day found for today.");
      }

      await adminApi.resetQueueDay(todayQueueDay._id);
      toast.dismiss(loadingToast);
      toast.success("Queue regenerated!");
      await loadDepartmentData(selectedDepartmentId);
    } catch (err) {
      const errorMsg = err.message || "Failed to regenerate queue";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  }, [loadDepartmentData, selectedDepartmentId]);

  if (!loading && departments.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
        No departments found for your institution.
      </div>
    );
  }

  return (
    <div className="flex h-full max-w-350 flex-col gap-4">
      <DashboardHeader
        departments={departments}
        selectedDepartmentId={selectedDepartmentId}
        onDepartmentChange={setSelectedDepartmentId}
        onIssueToken={handleIssueToken}
        onActivateQueue={handleActivateQueue}
        onCloseQueue={handleCloseQueue}
        onResetQueue={handleResetQueue}
        onRefresh={handleRefresh}
        queueStatus={dashboard.queueStatus}
        loading={loading || actionLoading}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <StatCards dashboard={dashboard} counters={counters} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
        <LiveQueueTable
          rows={waitingRows}
          totalWaiting={dashboard.totalWaitingTokens ?? waitingRows.length}
          serving={dashboard.currentServingNumber}
          onServeNext={handleServeNext}
          queueActive={queueActive}
          loading={loading || actionLoading}
        />
        <PeakHoursChart dataPoints={peakHoursData} />
      </div>
    </div>
  );
}
