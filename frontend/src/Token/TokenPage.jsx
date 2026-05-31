import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

import JoinHeader from "../Join/components/JoinHeader";
import TokenProgress from "./components/TokenProgress";
import TokenMainInfo from "./components/TokenMainInfo";
import TokenActions from "./components/TokenActions";
import JoinFooter from "../Join/components/JoinFooter";
import apiClient from "../api/apiClient";
import LoadingScreen from "../components/LoadingScreen";

const TOKEN_STORAGE_KEY = "meropaalo_customer_token";

const toProgressStatus = (backendStatus) => {
  if (backendStatus === "called") return "next";
  if (backendStatus === "serving" || backendStatus === "completed")
    return "serving";
  return "queue";
};

export default function TokenPage() {
  const [searchParams] = useSearchParams();

  const persistedToken = useMemo(() => {
    try {
      const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const tokenId = searchParams.get("tokenId") || persistedToken?.tokenId || "";
  const departmentId =
    searchParams.get("department") || persistedToken?.departmentId || "";

  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTokenStatus = async () => {
      if (!tokenId) {
        if (!cancelled) {
          const errorMsg =
            "Missing tokenId. Please re-open from the issued token link.";
          toast.error(errorMsg);
          setIsLoading(false);
        }
        return;
      }

      try {
        const statusData = await apiClient.get(`/tokens/${tokenId}/status`);
        if (cancelled) return;
        setTokenData({
          _id: statusData.tokenId,
          tokenNumber: statusData.tokenNumber,
          aheadCount: Math.max((statusData.positionInLine || 1) - 1, 0),
          estimatedWaitMinutes: statusData.estimatedWaitTimeMinutes || 0,
          status: toProgressStatus(statusData.status),
          backendStatus: statusData.status,
          currentServingNumber: statusData.currentServing?.tokenNumber || null,
        });
        setError("");
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err.message || "Failed to fetch token status.";
          toast.error(errorMsg);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchTokenStatus();
    const timer = setInterval(fetchTokenStatus, 10000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tokenId]);

  useEffect(() => {
    let cancelled = false;

    const fetchQueueInfo = async () => {
      if (!departmentId) {
        setQueueInfo((prev) => ({
          institutionName: prev?.institutionName || "MeroPaalo Queue",
          queueName: prev?.queueName || "General Service",
          queueStatus: prev?.queueStatus || "active",
        }));
        return;
      }

      try {
        const queueData = await apiClient.get(
          `/public/queue/${departmentId}/info`,
        );
        if (!cancelled) {
          setQueueInfo(queueData || null);
        }
      } catch {
        if (!cancelled) {
          setQueueInfo({
            institutionName: "MeroPaalo Queue",
            queueName: "General Service",
            queueStatus: "active",
          });
        }
      }
    };

    fetchQueueInfo();

    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  const params = searchParams.toString() ? `?${searchParams.toString()}` : "";

  if (isLoading && !tokenData) {
    return (
      <LoadingScreen
        title="Loading token status"
        subtitle="Checking your position in the queue and current serving details."
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JoinHeader showTimer={true} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-2 md:py-4 flex flex-col gap-5 md:gap-6">
        {/* Navigation Breadcrumb — Ultra-Compact */}
        <div className="flex items-center justify-between">
          <Link
            to={`/join${params}`}
            className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-teal-600 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            >
              <line x1="19" y1="12" x2="5" y2="12" strokeLinecap="round" />
              <polyline points="12 19 5 12 12 5" strokeLinecap="round" />
            </svg>
            Back to Queue
          </Link>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] font-display">
            <span className="opacity-50 text-[9px]">Dashboard</span>
            <span className="opacity-20">/</span>
            <span className="text-slate-400">Live Status</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 md:gap-6">
          <TokenProgress status={tokenData?.status || "queue"} />

          <TokenMainInfo
            token={tokenData}
            queueInfo={queueInfo}
            isLoading={isLoading}
          />

          <div className="pt-0.5">
            <TokenActions />
          </div>
        </div>
      </main>

      <JoinFooter />
    </div>
  );
}
