import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/Dashboard";
import QueueListPage from "./pages/QueueList";
import { staffApi } from "./api/staffApi";
import { adminApi } from "../AdminConsole/api/adminApi";

const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

const toClockTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

const minutesSince = (value) => {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
};

export default function MeroPaaloStaffApp() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counters, setCounters] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [queueStatus, setQueueStatus] = useState("closed");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCounterId, setSelectedCounterId] = useState("");

  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const departmentId = String(
    authUser?.department?._id || authUser?.department || "",
  );

  useEffect(() => {
    let isMounted = true;

    const resolveDepartmentName = async () => {
      const storedDepartmentName = authUser?.department?.name || "";
      if (storedDepartmentName) {
        setDepartmentName(storedDepartmentName);
        return;
      }

      if (!departmentId) {
        setDepartmentName("");
        return;
      }

      try {
        const response = await adminApi.getDepartments();
        const payload = response?.data ?? response;
        const departments = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.departments)
            ? payload.departments
            : Array.isArray(payload?.data)
              ? payload.data
              : [];
        const match = departments.find(
          (department) => String(department?._id) === departmentId,
        );
        if (isMounted) {
          setDepartmentName(match?.name || "");
        }
      } catch {
        if (isMounted) {
          setDepartmentName("");
        }
      }
    };

    resolveDepartmentName();

    return () => {
      isMounted = false;
    };
  }, [authUser?.department?.name, departmentId]);

  const loadData = useCallback(async () => {
    if (!departmentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [counterList, tokenList, queueDays] = await Promise.all([
        staffApi.getCounters(departmentId),
        staffApi.getTokens(departmentId),
        staffApi.getQueueDays(departmentId),
      ]);
      setCounters(counterList || []);
      setTokens(tokenList || []);
      const today = toLocalDateOnly();
      const todayQueueDay = (queueDays || []).find(
        (queueDay) => toApiDateOnly(queueDay?.date) === today,
      );
      setQueueStatus(todayQueueDay?.status || "closed");
    } catch (err) {
      const errorMsg = err.message || "Failed to load staff panel";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!departmentId) return undefined;
    const timer = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(timer);
  }, [departmentId, loadData]);

  useEffect(() => {
    if (selectedCounterId || !counters.length) return;
    const ownId = String(authUser?._id || authUser?.id || "");
    const mine = counters.find(
      (c) => String(c.staff?._id || c.staff || "") === ownId,
    );
    const openMine = mine && mine.status === "open" ? mine : null;
    setSelectedCounterId(
      (openMine || counters.find((c) => c.status === "open") || counters[0])
        ._id,
    );
  }, [authUser?._id, authUser?.id, counters, selectedCounterId]);

  const waitingTokens = tokens.filter((t) => t.status === "waiting");
  const calledOrServingTokens = tokens.filter(
    (t) => t.status === "called" || t.status === "serving",
  );
  const completedTokens = tokens.filter((t) => t.status === "completed");
  const visibleQueueTokens = tokens.filter((t) =>
    ["waiting", "called", "serving", "missed"].includes(t.status),
  );

  const currentToken =
    calledOrServingTokens.find((t) => t.status === "serving") ||
    calledOrServingTokens.find((t) => t.status === "called") ||
    null;

  const avgServiceMinutes = completedTokens.length
    ? Math.max(
        1,
        Math.round(
          completedTokens.reduce((sum, token) => {
            const calledAt = token.calledAt
              ? new Date(token.calledAt).getTime()
              : null;
            const completedAt = token.completedAt
              ? new Date(token.completedAt).getTime()
              : null;
            if (!calledAt || !completedAt || completedAt <= calledAt)
              return sum;
            return sum + (completedAt - calledAt) / 60000;
          }, 0) / completedTokens.length,
        ),
      )
    : 0;

  const queueItems = visibleQueueTokens.map((token, index) => ({
    id: token._id,
    ticket: `#${token.tokenNumber}`,
    name: token.customer?.name || "Walk-in Customer",
    initials: (token.customer?.name || "WC")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(""),
    checkIn: toClockTime(token.issuedAt),
    waitMins: minutesSince(token.issuedAt),
    wait: `${minutesSince(token.issuedAt)} mins`,
    status: token.status,
    isCurrent: currentToken
      ? String(currentToken._id) === String(token._id)
      : index === 0,
  }));

  const upcomingQueue = waitingTokens.slice(0, 10).map((token, index) => ({
    id: token._id,
    ticket: `#${token.tokenNumber}`,
    name: token.customer?.name || "Walk-in Customer",
    wait: `${minutesSince(token.issuedAt)} min`,
    next: index === 0,
  }));

  const historyRecords = completedTokens
    .slice()
    .reverse()
    .map((token) => ({
      id: token._id,
      ticket: `#${token.tokenNumber}`,
      patient: token.customer?.name || "Walk-in Customer",
      durationMinutes:
        token.calledAt && token.completedAt
          ? Math.max(
              1,
              Math.round(
                (new Date(token.completedAt).getTime() -
                  new Date(token.calledAt).getTime()) /
                  60000,
              ),
            )
          : null,
      completedAt: toClockTime(token.completedAt),
      provider: authUser?.name || "Staff",
    }));

  const runAction = async (fn, defaultError) => {
    if (actionLoading) return;
    setActionLoading(true);
    setError("");
    const loadingToast = toast.loading("Processing...");
    try {
      await fn();
      toast.dismiss(loadingToast);
      toast.success("Operation completed successfully!");
      await loadData();
    } catch (err) {
      const errorMsg = err.message || defaultError;
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const onServeNext = () =>
    runAction(async () => {
      if (!departmentId || !selectedCounterId) {
        throw new Error("Select an active counter first");
      }
      await staffApi.serveNext(departmentId, selectedCounterId);
    }, "Failed to serve next token");

  const onCallCurrent = () =>
    runAction(async () => {
      if (!currentToken || !selectedCounterId) {
        throw new Error("No active token to recall");
      }
      await staffApi.callToken(currentToken._id, selectedCounterId);
    }, "Failed to recall token");

  const onCompleteCurrent = () =>
    runAction(async () => {
      if (!currentToken || !selectedCounterId) {
        throw new Error("No active token to complete");
      }
      await staffApi.completeToken(currentToken._id, selectedCounterId);
    }, "Failed to complete token");

  const onResetQueue = () =>
    runAction(async () => {
      if (
        !window.confirm(
          "Regenerate queue for today? This will cancel waiting/called/serving tokens.",
        )
      ) {
        return;
      }
      if (!departmentId) {
        throw new Error("Department information is missing");
      }
      const today = toLocalDateOnly();
      const queueDays = await staffApi.getQueueDays(departmentId);
      const todayQueueDay = (queueDays || []).find(
        (qd) => toApiDateOnly(qd?.date) === today,
      );

      if (!todayQueueDay?._id) {
        throw new Error("No queue-day found for today.");
      }

      await staffApi.resetQueueDay(todayQueueDay._id);
    }, "Failed to regenerate queue");

  const onActivateQueue = () =>
    runAction(async () => {
      if (!departmentId) {
        throw new Error("Department information is missing");
      }
      const today = toLocalDateOnly();
      const startTime = "10:00";
      const endTime = "16:00";
      await staffApi.openQueueDay(departmentId, today, startTime, endTime);
    }, "Failed to activate queue");

  const onCloseQueue = () =>
    runAction(async () => {
      if (!departmentId) {
        throw new Error("Department information is missing");
      }
      const today = toLocalDateOnly();
      const queueDays = await staffApi.getQueueDays(departmentId);
      const activeToday = (queueDays || []).find(
        (qd) =>
          toApiDateOnly(qd?.date) === today &&
          (qd?.status === "active" || qd?.status === "paused"),
      );

      if (!activeToday?._id) {
        throw new Error("No active queue-day found for today.");
      }

      await staffApi.closeQueueDay(activeToday._id);
    }, "Failed to close queue");

  const pageProps = {
    loading,
    actionLoading,
    error,
    queueStatus,
    queueItems,
    upcomingQueue,
    historyRecords,
    currentToken: currentToken
      ? {
          id: currentToken._id,
          ticket: `#${currentToken.tokenNumber}`,
          name: currentToken.customer?.name || "Walk-in Customer",
          waitMins: minutesSince(currentToken.issuedAt),
          status: currentToken.status,
          category: currentToken.serviceCategory?.name || currentToken.category || "VIP Service", // Default mockup value
        }
      : null,
    servedToday: completedTokens.length,
    avgServiceMinutes,
    totalInQueue: waitingTokens.length,
    departmentId,
    departmentName: departmentName || authUser?.department?.name || "MeroPaalo",
    selectedCounterId,
    counters,
    onCounterChange: setSelectedCounterId,
    onServeNext,
    onCallCurrent,
    onCompleteCurrent,
    onResetQueue,
    onActivateQueue,
    onCloseQueue,
    onRefresh: loadData,
  };

  const pages = {
    dashboard: <DashboardPage {...pageProps} />,
    queue: <QueueListPage {...pageProps} />,
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={(nav) => {
          setActiveNav(nav);
          setSidebarOpen(false);
        }}
        sidebarOpen={sidebarOpen}
        hasError={Boolean(error)}
        department={departmentName || authUser?.department?.name}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Transparent top header */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          user={authUser}
          department={departmentName || authUser?.department?.name}
          departmentId={departmentId}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto px-6 pb-6">
          {!departmentId ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your account has no department assignment. Ask an admin to assign
              your staff account to a department.
            </div>
          ) : (
            pages[activeNav]
          )}
        </main>
      </div>
    </div>
  );
}
