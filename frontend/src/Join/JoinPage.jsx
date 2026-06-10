import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import JoinHeader from "./components/JoinHeader";
import TokenSuccessCard from "./components/TokenSuccessCard";
import JoinLoginCard from "./components/JoinLoginCard";
import apiClient from "../api/apiClient";
import { authService } from "../Authentication/authService";

const TOKEN_STORAGE_KEY = "meropaalo_customer_token";
const JOIN_DEPARTMENT_STORAGE_KEY = "meropaalo_join_department";
const JOIN_TAKE_TOKEN_STORAGE_KEY = "meropaalo_join_take_token";
const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

const readJsonStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readStoredDepartment = () => {
  try {
    return localStorage.getItem(JOIN_DEPARTMENT_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const readStoredTakeTokenFlag = () => {
  try {
    return localStorage.getItem(JOIN_TAKE_TOKEN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const toLocalDateOnly = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function DashboardStatCard({ label, value, unit, highlight = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      <div className="mt-5 flex items-end gap-2">
        <span
          className={`text-[24px] font-black tracking-tight sm:text-[30px] ${
            highlight ? "text-teal-600" : "text-slate-900"
          }`}
        >
          {value}
        </span>
        <span className="pb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-slate-300">
          {unit}
        </span>
      </div>
    </div>
  );
}

export const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const queryDepartmentId = searchParams.get("department") || "";
  const takeTokenRequested = searchParams.get("takeToken") === "1";

  const persistedAuthUser = useMemo(() => readJsonStorage(AUTH_USER_STORAGE_KEY), []);
  const persistedToken = useMemo(() => readJsonStorage(TOKEN_STORAGE_KEY), []);
  const persistedDepartment = useMemo(() => readStoredDepartment(), []);
  const persistedTakeToken = useMemo(() => readStoredTakeTokenFlag(), []);

  const departmentId =
    queryDepartmentId ||
    persistedDepartment ||
    persistedToken?.departmentId ||
    persistedAuthUser?.department?._id ||
    persistedAuthUser?.department ||
    "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [queueInfo, setQueueInfo] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [joinUser, setJoinUser] = useState(persistedAuthUser);
  const [next, setNext] = useState(null);
  const [token, setToken] = useState(null);

  const queueStatus = queueInfo?.queueStatus || null;
  const takeTokenEnabled = Boolean(
    takeTokenRequested ||
      persistedTakeToken ||
      queueInfo?.takeTokenEnabled ||
      next?.takeTokenEnabled,
  );

  useEffect(() => {
    if (queryDepartmentId) {
      try {
        localStorage.setItem(JOIN_DEPARTMENT_STORAGE_KEY, queryDepartmentId);
      } catch {
        // Ignore storage failures.
      }
    }
  }, [queryDepartmentId]);

  useEffect(() => {
    if (searchParams.has("takeToken")) {
      try {
        localStorage.setItem(
          JOIN_TAKE_TOKEN_STORAGE_KEY,
          takeTokenRequested ? "1" : "0",
        );
      } catch {
        // Ignore storage failures.
      }
    }
  }, [searchParams, takeTokenRequested]);

  useEffect(() => {
    let cancelled = false;

    const hydrateToken = async () => {
      if (token) return;
      if (!persistedToken?.tokenId) return;
      if (!departmentId) return;
      if (
        persistedToken?.departmentId &&
        String(persistedToken.departmentId || "") !== String(departmentId)
      ) {
        return;
      }

      try {
        const statusData = await apiClient.get(
          `/tokens/${persistedToken.tokenId}/status`,
        );
        if (cancelled) return;

        setToken({
          id: statusData.tokenId || persistedToken.tokenId,
          tokenNumber: statusData.tokenNumber || persistedToken.tokenNumber || "",
          status: statusData.status || "waiting",
          department: departmentId,
        });
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
    };

    hydrateToken();

    return () => {
      cancelled = true;
    };
  }, [departmentId, persistedToken?.departmentId, persistedToken?.tokenId, token]);

  useEffect(() => {
    let cancelled = false;

    const fetchQueueInfo = async () => {
      if (!departmentId) {
        setQueueInfo(null);
        setError("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await apiClient.get(
          `/qr/validate?department=${encodeURIComponent(departmentId)}`,
        );

        if (cancelled) return;

        setQueueInfo(data || null);
        setJoinUser(data?.user || persistedAuthUser || null);
        setNext(data?.next || null);
      } catch (err) {
        const errorMsg = err.message || "Could not load queue information";
        if (!cancelled) {
          setQueueInfo(null);
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchQueueInfo();

    return () => {
      cancelled = true;
    };
  }, [departmentId, persistedAuthUser]);

  const departmentName =
    queueInfo?.department?.name || joinUser?.department?.name || "Service Center";
  const departmentDescription =
    queueInfo?.department?.description || "General Intake";
  const isAuthenticated = Boolean(joinUser);
  const queueOpen = queueStatus === "active";
  const canJoin = queueOpen && isAuthenticated && takeTokenEnabled && !isLoading;
  const showLogin = !isAuthenticated;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!departmentId || isSigningIn) return;

    setIsSigningIn(true);
    setError("");
    const loadingToast = toast.loading("Signing in...");

    try {
      const response = await authService.login(
        loginForm.email,
        loginForm.password,
        departmentId,
      );

      const user = response?.user || null;
      const nextStep = response?.next || null;

      if (!user) {
        throw new Error("Login did not return a user profile.");
      }

      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      setJoinUser(user);
      setNext(nextStep);

      if (nextStep?.department) {
        try {
          localStorage.setItem(JOIN_DEPARTMENT_STORAGE_KEY, nextStep.department);
        } catch {
          // Ignore storage failures.
        }
      }

      if (nextStep?.takeTokenEnabled) {
        try {
          localStorage.setItem(JOIN_TAKE_TOKEN_STORAGE_KEY, "1");
        } catch {
          // Ignore storage failures.
        }
      }

      toast.dismiss(loadingToast);
      toast.success("Login successful");

      if (nextStep?.redirectUrl) {
        window.location.assign(nextStep.redirectUrl);
        return;
      }

      throw new Error("Missing redirectUrl in login response.");
    } catch (err) {
      const errorMsg = err.message || "Could not sign you in.";
      toast.dismiss(loadingToast);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleJoin = async () => {
    if (!departmentId || isJoining) return;

    if (!takeTokenEnabled) {
      const errorMsg =
        "Take My Token is not enabled for this session yet. Please complete validation first.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!queueOpen || !isAuthenticated || isLoading) return;

    setIsJoining(true);
    setError("");
    const loadingToast = toast.loading("Issuing token...");
    const customerId = joinUser?._id || joinUser?.id || joinUser?.userId || "";

    try {
      const issuedToken = await apiClient.post("/tokens/issue", {
        department: departmentId,
        date: toLocalDateOnly(),
        ...(customerId
          ? {
              customerId,
              userId: customerId,
            }
          : {}),
      });

      const normalizedToken = {
        id: issuedToken?._id || issuedToken?.id || "",
        tokenNumber: issuedToken?.tokenNumber || "",
        status: issuedToken?.status || "waiting",
        department: departmentId,
      };

      setToken(normalizedToken);
      localStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({
          tokenId: normalizedToken.id,
          departmentId,
          tokenNumber: normalizedToken.tokenNumber,
        }),
      );

      try {
        localStorage.setItem(JOIN_TAKE_TOKEN_STORAGE_KEY, "0");
      } catch {
        // Ignore storage failures.
      }

      toast.dismiss(loadingToast);
      toast.success("Token issued successfully");
    } catch (err) {
      const errorMsg = err.message || "Could not reserve your spot.";
      toast.dismiss(loadingToast);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsJoining(false);
    }
  };

  const systemStateLabel = queueOpen ? "Processing" : isLoading ? "Syncing" : "Standby";

  return (
    <div className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#f7f8fd] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.05),transparent_28%)]" />
      <JoinHeader showLogout={isAuthenticated || Boolean(persistedAuthUser)} />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 pb-8 sm:px-6 sm:pb-10 lg:px-8 lg:py-6">
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="h-3 w-48 rounded-full bg-slate-200/80" />
              <div className="h-10 w-72 rounded-xl bg-slate-200/80" />
              <div className="space-y-3 pt-2">
                <div className="h-28 rounded-2xl bg-slate-200/70" />
                <div className="h-28 rounded-2xl bg-slate-200/70" />
                <div className="h-28 rounded-2xl bg-slate-200/70" />
              </div>
            </div>
            <div className="h-[420px] rounded-[28px] bg-slate-200/70" />
          </div>
        ) : (
          <>
            <section className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
              
              </div>

              <div className="flex flex-col items-start gap-2 lg:items-end">
               
              </div>
            </section>

            {!departmentId && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
                No department context was provided. Re-open the queue from your issued
                service link so we can show the live join controls.
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
                {error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
              <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <DashboardStatCard
                  label="Estimated Wait"
                  value={
                    queueInfo?.estimatedWaitMinutes !== undefined &&
                    queueInfo?.estimatedWaitMinutes !== null
                      ? queueInfo.estimatedWaitMinutes
                      : "--"
                  }
                  unit="min"
                  highlight={queueOpen}
                />
                <DashboardStatCard
                  label="Pending Tokens"
                  value={
                    queueInfo?.aheadCount !== undefined && queueInfo?.aheadCount !== null
                      ? queueInfo.aheadCount
                      : "--"
                  }
                  unit="total"
                />
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:col-span-2 lg:col-span-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                    System State
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        queueOpen ? "bg-teal-500" : "bg-slate-300"
                      }`}
                    />
                    <span className="text-[15px] font-semibold tracking-tight text-slate-700">
                      {systemStateLabel}
                    </span>
                  </div>
                </div>
              </aside>

              <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <div className="h-1 bg-teal-500" />
                <div className="p-4 sm:p-6 lg:p-8">
                  {token ? (
                    <TokenSuccessCard
                      token={token}
                      customerName={joinUser?.name || joinUser?.email || null}
                    />
                  ) : showLogin ? (
                    <JoinLoginCard
                      email={loginForm.email}
                      password={loginForm.password}
                      onEmailChange={(value) =>
                        setLoginForm((prev) => ({ ...prev, email: value }))
                      }
                      onPasswordChange={(value) =>
                        setLoginForm((prev) => ({ ...prev, password: value }))
                      }
                      onSubmit={handleLogin}
                      isSubmitting={isSigningIn}
                      departmentName={departmentName}
                      error={error}
                    />
                  ) : (
                    <div className="relative min-h-[400px] overflow-hidden rounded-[24px] border border-slate-200 bg-[#fbfcff] px-4 py-5 sm:px-6 sm:py-8">
                      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.32em] text-teal-700">
                          Queue Dashboard
                        </div>
                        <p className="mt-7 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
                          Ready to join?
                        </p>
                        <h2 className="mt-3 font-display text-[32px] font-black tracking-tight text-slate-950 sm:text-[40px]">
                          {joinUser?.name ? `Welcome, ${joinUser.name}` : "Reserve your spot"}
                        </h2>
                        <p className="mt-4 max-w-md text-[13px] leading-6 text-slate-500">
                          {queueOpen
                            ? "Electronic confirmation is ready. Tap the action below to issue your queue token and start tracking live status."
                            : "Remote token issuance is temporarily inactive. The counter will unlock once the queue reopens."}
                        </p>

                        <button
                          onClick={handleJoin}
                          disabled={!canJoin || isJoining}
                          className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-slate-950 px-5 py-3 text-[12px] font-black uppercase tracking-[0.22em] text-white shadow-lg shadow-slate-950/10 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:text-[13px] sm:tracking-[0.26em]"
                        >
                          {isJoining ? "Issuing Token..." : "Take My Token"}
                          <span className="text-sm">-&gt;</span>
                        </button>

                        <p className="mt-7 text-[9px] font-black uppercase tracking-[0.32em] text-slate-400">
                          Confirmation will appear after issuance
                        </p>
                      </div>

                      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
                      <div className="pointer-events-none absolute inset-x-12 bottom-8 h-24 rounded-full bg-teal-100/40 blur-3xl" />
                    </div>
                  )}
                </div>
              </section>
            </div>

            {!token && queueOpen && isAuthenticated && takeTokenEnabled && (
              <div className="mt-4 text-center text-[11px] font-black uppercase tracking-[0.35em] text-slate-400">
                Take My Token will unlock after validation
              </div>
            )}

            {!queueOpen && !token && isAuthenticated && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
                Service standby. Remote token issuance is temporarily inactive.
              </div>
            )}

            <div className="mt-5 overflow-hidden rounded-full border border-slate-200 bg-white/70 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <img
                    src="/assets/MeroPaaloLogo.png"
                    alt="MeroPaalo"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-black text-slate-900">MeroPaalo</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-slate-400">
                    Virtual queue network
                  </p>
                </div>
                <div className="hidden items-center gap-6 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 sm:flex">
                  <span>Privacy</span>
                  <span>Support</span>
                  <span>Reset</span>
                  <span>2026</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
