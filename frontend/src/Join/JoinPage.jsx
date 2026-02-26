import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import JoinHeader from "./components/JoinHeader";
import JoinFooter from "./components/JoinFooter";
import LiveQueueStats from "./components/LiveQueueStats";
import CheckInCard from "./components/CheckInCard";
import TokenSuccessCard from "./components/TokenSuccessCard";
import ErrorBanner from "./components/ErrorBanner";
import apiClient from "../api/apiClient";

const TOKEN_STORAGE_KEY = "meropaalo_customer_token";
const CUSTOMER_LOGIN_KEY = "meropaalo_customer_username";

export const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const department = searchParams.get("department") || "";
  const canQuery = Boolean(department);

  const customerLogin = useMemo(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_LOGIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!customerLogin) {
      navigate(`/customer-login?department=${department}`);
    }
  }, [customerLogin, navigate, department]);

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [queueInfo, setQueueInfo] = useState(null);
  const [token, setToken] = useState(null);

  const queueOpen = queueInfo?.queueStatus === "active";
  const sessionId = useMemo(
    () => (department ? department.slice(-6).toUpperCase() : ""),
    [department],
  );

  useEffect(() => {
    const fetchQueueInfo = async () => {
      // If no params are provided, do not fetch or set queue info
      if (!canQuery) {
        setQueueInfo(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await apiClient.get(`/public/queue/${department}/info`);
        setQueueInfo(data);
      } catch (err) {
        const errorMsg = err.message || "Could not load queue information";
        toast.error(errorMsg);
        setError(errorMsg);
        setQueueInfo(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueueInfo();
  }, [canQuery, department]);

  const handleJoin = async () => {
    if (!canQuery || isJoining || !queueOpen) return;
    setIsJoining(true);
    setError("");
    const loadingToast = toast.loading("Joining queue...");
    try {
      const issuedToken = await apiClient.post("/tokens/issue", {
        department,
        customer: customerLogin
          ? {
              name: customerLogin.name,
              email: customerLogin.email,
            }
          : undefined,
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
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JoinHeader />

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
                  : queueInfo?.institutionName || "Service Center"}
              </h1>
            </div>
            <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-slate-100 pl-4 md:pl-0 md:pr-4 py-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Department
              </p>
              <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                {queueInfo?.queueName || "General Intake"}
              </p>
            </div>
          </div>
          <div className="h-0.5 bg-slate-100/50 w-full rounded-full" />
        </div>

        <ErrorBanner message={error} />

        <LiveQueueStats queueInfo={queueInfo} isLoading={isLoading} />

        {/* Action Center */}
        <div className="flex justify-center mt-4">
          {token ? (
            <TokenSuccessCard
              token={token}
              institution={null}
              customerName={customerLogin?.name}
            />
          ) : (
            <CheckInCard
              onJoin={handleJoin}
              isJoining={isJoining}
              canJoin={queueOpen && !isLoading}
              sessionId={sessionId}
              customerName={customerLogin?.name}
            />
          )}
        </div>
      </main>

      <JoinFooter />
    </div>
  );
};
