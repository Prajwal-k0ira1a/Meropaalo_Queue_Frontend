import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import JoinHeader from "./components/JoinHeader";
import JoinFooter from "./components/JoinFooter";
import apiClient from "../api/apiClient";

export const QRGeneratorPage = () => {
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiClient.get("/public/departments");
        setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        const errorMsg = "Failed to load departments";
        setError(errorMsg);
        toast.error(errorMsg);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const canGenerate = Boolean(department.trim());

  const selectedDepartmentName = useMemo(() => {
    const dept = departments.find((d) => d._id === department);
    return dept?.name || "";
  }, [department, departments]);

  const qrImageUrl = useMemo(() => {
    if (!canGenerate) return "";
    const params = new URLSearchParams({
      department: department.trim(),
    });
    return `${apiClient.defaults.baseURL}/qr?${params.toString()}`;
  }, [canGenerate, department]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JoinHeader showNav={false} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-6 md:py-12 flex flex-col gap-8">
        {/* Page Header — Technical & Clear */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em] leading-none mb-1 font-display">
              Infrastructure Tools
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none font-display">
              Access Point <span className="text-slate-400">QR Generator</span>
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Configure system parameters to generate secure access tokens. This
            QR code allows customers to join the virtual queue flow instantly.
          </p>
          <div className="h-0.5 bg-slate-100/50 w-full rounded-full" />
        </div>

        {/* Configuration Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Form Side */}
          <div className="flex-1 p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest font-display">
                Configuration Parameters
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {loading
                        ? "Loading departments..."
                        : "Choose a department"}
                    </option>
                    {error && <option disabled>{error}</option>}
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {selectedDepartmentName && (
                    <p className="text-xs text-teal-600 font-semibold mt-2">
                      Selected:{" "}
                      <span className="text-teal-700">
                        {selectedDepartmentName}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QR Side */}
          <div className="w-full md:w-80 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center gap-6">
            {!canGenerate ? (
              <div className="flex flex-col items-center gap-4 text-slate-300">
                <div className="w-48 h-48 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">
                  Waiting for Input
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <img
                    src={qrImageUrl}
                    alt="Access QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-display">
                  Access Point QR
                </p>
                <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-teal-100/50 text-teal-600 border border-teal-200 rounded-full">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  <span className="text-[9px] font-bold uppercase tracking-widest font-display">
                    Ready to Scan
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Guidance */}
        <div className="p-6 bg-slate-100/50 border border-slate-200 rounded-2xl flex items-start gap-4">
          <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center shrink-0 bg-white">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
              How It Works for Customers
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              1. Customers scan the QR code with their phone
              <br />
              2. They enter their name and email to verify their identity
              <br />
              3. They join the queue and receive a token number
              <br />
              4. They can monitor their position in the queue in real-time
              <br />
              5. They will be notified when it's their turn to be served
            </p>
          </div>
        </div>
      </main>

      <JoinFooter />
    </div>
  );
};
