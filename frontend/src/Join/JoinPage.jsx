import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import JoinHeader from "./components/JoinHeader";
import JoinFooter from "./components/JoinFooter";
import LiveQueueStats from "./components/LiveQueueStats";
import CheckInCard from "./components/CheckInCard";
import TokenSuccessCard from "./components/TokenSuccessCard";
import apiClient from "../api/apiClient";
import LoadingScreen from "../components/LoadingScreen";

const TOKEN_STORAGE_KEY = "meropaalo_customer_token";

export const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const department = searchParams.get("department") || "";
  const canQuery = Boolean(department);
  const returnTo = useMemo(() => {
    if (!department) return "/login";
    return `/join?department=${encodeURIComponent(department)}`;
  }, [department]);

  const persistedToken = useMemo(() => {
    try {
      const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [, setError] = useState("");
  const [queueInfo, setQueueInfo] = useState(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userName: null,
    message: "",
  });
  const [token, setToken] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const hydrateToken = async () => {
      if (token) return;
      if (!persistedToken?.tokenId) return;
      if (!department) return;
      if (String(persistedToken.departmentId || "") !== String(department))
        return;

      try {
        const statusData = await apiClient.get(
          `/tokens/${persistedToken.tokenId}/status`,
        );
        if (cancelled) return;

        setToken({
          _id: statusData.tokenId,
          tokenNumber: statusData.tokenNumber,
          department,
          status: statusData.status,
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
  }, [department, persistedToken?.departmentId, persistedToken?.tokenId, token]);

  const queueOpen = queueInfo?.queueStatus === "active";
  const sessionId = useMemo(
    () => (department ? department.slice(-6).toUpperCase() : ""),
    [department],
  );

  useEffect(() => {
    const fetchQueueInfo = async () => {
      if (!canQuery) {
        setQueueInfo(null);
        setAuthState({
          isAuthenticated: false,
          userName: null,
          message: "",
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await apiClient.get(
          `/qr/validate?department=${encodeURIComponent(department)}`,
        );

        if (data?.department) {
          setQueueInfo({
            ...data,
            queueStatus: data.queueStatus || "inactive",
          });
        } else {
          setQueueInfo(data);
        }

        setAuthState({
          isAuthenticated: Boolean(data?.isAuthenticated),
          userName: data?.userName || null,
          message: data?.message || "",
        });

        if (data?.queueStatus === "active" && !data?.isAuthenticated) {
          toast.dismiss();
          navigate(
            `/login?returnTo=${encodeURIComponent(returnTo)}&department=${encodeURIComponent(department)}`,
            { replace: true },
          );
          return;
        }
      } catch (err) {
        const errorMsg = err.message || "Could not load queue information";
        toast.error(errorMsg);
        setQueueInfo(null);
        setAuthState({
          isAuthenticated: false,
          userName: null,
          message: errorMsg,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueueInfo();
  }, [canQuery, department, navigate, returnTo]);

  if (isLoading && !queueInfo && !token) {
    return (
      <LoadingScreen
        title="Loading queue"
        subtitle="Checking your department status and preparing the queue view."
      />
    );
  }

  const handleJoin = async () => {
    if (!canQuery || isJoining || !queueOpen || !authState.isAuthenticated)
      return;
    setIsJoining(true);
    const loadingToast = toast.loading("Joining queue...");
    try {
      const issuedToken = await apiClient.post("/tokens/issue", {
        department,
      });

      setToken(issuedToken);
      localStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({
          tokenId: issuedToken?._id,
          departmentId: department,
          tokenNumber: issuedToken?.tokenNumber,
        }),
      );
      toast.dismiss(loadingToast);
      toast.success("Successfully joined queue!");
    } catch (err) {
      const errorMsg = err.message || "Could not reserve spot.";
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JoinHeader showLogout />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-3 md:py-5 flex flex-col gap-6 md:gap-8">
        {/* Standardized Header / Breadcrumb Area — Restored MeroPaalo Style */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em] leading-none mb-1 font-display">
                Service Protocol 5.0
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none font-display">
                {isLoading
                  ? "••••••••"
                  : queueInfo?.department?.name || "Service Center"}
              </h1>
            </div>
            <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-slate-100 pl-4 md:pl-0 md:pr-4 py-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Department
              </p>
              <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                {queueInfo?.department?.description || "General Intake"}
              </p>
            </div>
          </div>
          <div className="h-0.5 bg-slate-100/50 w-full rounded-full" />
        </div>

        <LiveQueueStats queueInfo={queueInfo} isLoading={isLoading} />

        {/* Action Center */}
        <div className="flex justify-center mt-4">
          {token ? (
            <TokenSuccessCard
              token={token}
              institution={null}
              customerName={authState.userName}
            />
          ) : (
            <CheckInCard
              onJoin={handleJoin}
              isJoining={isJoining}
              canJoin={queueOpen && !isLoading && authState.isAuthenticated}
              sessionId={sessionId}
              customerName={authState.userName}
            />
          )}
        </div>
      </main>

      <JoinFooter />
    </div>
  );
};
