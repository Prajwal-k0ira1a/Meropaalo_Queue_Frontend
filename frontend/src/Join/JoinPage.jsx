import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import JoinHeader from "./components/JoinHeader";
import JoinFooter from "./components/JoinFooter";
import LiveQueueStats from "./components/LiveQueueStats";
import CheckInCard from "./components/CheckInCard";
import TokenSuccessCard from "./components/TokenSuccessCard";
import JoinLoginCard from "./components/JoinLoginCard";
import apiClient from "../api/apiClient";
import { authService } from "../Authentication/authService";
import LoadingScreen from "../components/LoadingScreen";

const TOKEN_STORAGE_KEY = "meropaalo_customer_token";
const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

const readStoredAuthUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readStoredToken = () => {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const toLocalDateOnly = (value = new Date()) => {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const departmentId = searchParams.get("department") || "";
  const takeTokenRequested = searchParams.get("takeToken") === "1";

  const persistedAuthUser = useMemo(() => readStoredAuthUser(), []);
  const persistedToken = useMemo(() => readStoredToken(), []);

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
    takeTokenRequested || queueInfo?.takeTokenEnabled || next?.takeTokenEnabled,
  );

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

  const joinQueueState = useMemo(
    () => ({
      departmentId: departmentId || null,
      isAuthenticated,
      queueStatus,
      takeTokenEnabled,
      next,
      user: joinUser
        ? {
            id: joinUser.id || joinUser._id || "",
            name: joinUser.name || "",
            email: joinUser.email || "",
            role: joinUser.role || "customer",
            department: joinUser.department || null,
          }
        : null,
      token: token
        ? {
            id: token.id || token._id || "",
            tokenNumber: token.tokenNumber || "",
            status: token.status || "waiting",
          }
        : null,
    }),
    [departmentId, isAuthenticated, joinUser, next, queueStatus, takeTokenEnabled, token],
  );

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
    if (!departmentId || isJoining || !canJoin) return;

    setIsJoining(true);
    setError("");
    const loadingToast = toast.loading("Issuing token...");
    try {
      const issuedToken = await apiClient.post("/tokens/issue", {
        department: departmentId,
        date: toLocalDateOnly(),
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

  if (isLoading && !queueInfo && !token) {
    return (
      <LoadingScreen
        title="Loading queue"
        subtitle="Checking your department status and preparing the queue view."
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JoinHeader showLogout={isAuthenticated || Boolean(persistedAuthUser)} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-3 md:py-5 flex flex-col gap-6 md:gap-8">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em] leading-none mb-1 font-display">
                Service Protocol 5.0
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none font-display">
                {isLoading ? "Loading..." : departmentName}
              </h1>
            </div>
            <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-slate-100 pl-4 md:pl-0 md:pr-4 py-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Department
              </p>
              <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                {departmentDescription}
              </p>
            </div>
          </div>
          <div className="h-0.5 bg-slate-100/50 w-full rounded-full" />
        </div>

        {!departmentId && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
            No department context was provided. Re-open the queue from the QR
            code so we can show the live join controls.
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <LiveQueueStats queueInfo={queueInfo} isLoading={isLoading} />

        <div className="flex justify-center mt-4">
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
            <CheckInCard
              onJoin={handleJoin}
              isJoining={isJoining}
              canJoin={canJoin}
              sessionId={departmentId.slice(-6).toUpperCase()}
              customerName={joinUser?.name || joinUser?.email || null}
            />
          )}
        </div>

        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {joinQueueState.takeTokenEnabled
            ? "Take My Token is enabled for this session"
            : "Take My Token will unlock after validation"}
        </div>
      </main>

      <JoinFooter />
    </div>
  );
};
