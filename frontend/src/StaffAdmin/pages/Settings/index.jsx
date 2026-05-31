import { useState, useEffect } from "react";
import { User, Shield, Globe, Bell, Volume2, Plus, GripVertical, Check, RefreshCw, Layers } from "lucide-react";
import toast from "react-hot-toast";

const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

export default function SettingsPage({
  user,
  counters = [],
  onRefresh,
}) {
  // Load user data from props or storage
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Preferences State
  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState(true);
  const [audioAlerts, setAudioAlerts] = useState(false);

  // Load user details
  useEffect(() => {
    const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    const parsed = rawUser ? JSON.parse(rawUser) : user;
    if (parsed) {
      setFullName(parsed.name || parsed.email?.split("@")[0] || "Arjun Koirala");
      setEmailAddress(parsed.email || "arjun.k@meropaalo.com");
    }
  }, [user]);

  // Mock list of categories matching mockup
  const [categories, setCategories] = useState([
    { id: "1", name: "Standard Queue", priority: "Priority 3", color: "border-l-[#10b981]" },
    { id: "2", name: "VIP Service", priority: "Priority 1", color: "border-l-[#f97316]" },
    { id: "3", name: "Consultation", priority: "Priority 2", color: "border-l-[#1e293b]" },
  ]);

  // Handle Save Configuration
  const handleSaveConfig = () => {
    try {
      const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (rawUser) {
        const u = JSON.parse(rawUser);
        u.name = fullName;
        u.email = emailAddress;
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(u));
      }
      toast.success("Configuration saved successfully!");
      if (onRefresh) onRefresh();
      
      // Instantly trigger window reload or event to synchronize Topbar/Sidebar details
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      toast.error("Failed to update profile configurations");
    }
  };

  // Handle Discard Changes
  const handleDiscardChanges = () => {
    const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    const parsed = rawUser ? JSON.parse(rawUser) : user;
    if (parsed) {
      setFullName(parsed.name || "Arjun Koirala");
      setEmailAddress(parsed.email || "arjun.k@meropaalo.com");
    }
    setLanguage("English (US)");
    setNotifications(true);
    setAudioAlerts(false);
    toast.success("Changes discarded");
  };

  // Mock handlers for adding categories/counters
  const handleAddCounter = () => {
    toast.success("Assign new counter slot triggered");
  };

  const handleAddCategory = () => {
    toast.success("Add category dialog triggered");
  };

  return (
    <div className="space-y-6">
      {/* Title Header with Breadcrumbs */}
      <div>
        <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span>MeroPaalo</span>
          <span>/</span>
          <span className="text-slate-600">Settings</span>
        </div>
        <h1 className="text-3xl font-black text-[#0f172a] mt-1">Settings</h1>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Left: Profile Settings */}
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <User size={18} className="text-slate-500" />
                <span>Profile Settings</span>
              </h2>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-extrabold uppercase text-slate-500 hover:text-slate-900 transition-colors"
              >
                {isEditingProfile ? "Lock Info" : "Edit Info"}
              </button>
            </div>

            {/* Profile Avatar Grid */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6 mb-6">
              <div className="flex flex-col items-center">
                {/* Simulated Avatar Photo */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400 border border-slate-200 shadow-sm overflow-hidden group cursor-pointer">
                  <span className="text-2xl font-black text-slate-600 select-none">
                    {fullName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                    UPDATE
                  </div>
                </div>
                <button className="mt-2 text-[10px] font-bold text-slate-400 hover:text-slate-600">
                  Click to update photo
                </button>
              </div>

              {/* Form Input fields */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditingProfile}
                    className="mt-1 w-full h-11 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-slate-200 focus:bg-white disabled:opacity-70"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    disabled={!isEditingProfile}
                    className="mt-1 w-full h-11 rounded-xl border border-slate-100 bg-slate-50/50 px-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-slate-200 focus:bg-white disabled:opacity-70"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Change Password option */}
          <div className="border-t border-slate-100 pt-4 flex items-center">
            <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
              <RefreshCw size={13} className="stroke-[2.5]" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Top Right: Preferences Panel */}
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between min-h-[380px]">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Globe size={18} className="text-slate-500" />
              <span>Preferences</span>
            </h2>

            {/* Language Selector Dropdown */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Interface Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1.5 w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-all focus:border-slate-400"
              >
                <option value="English (US)">English (US)</option>
                <option value="Nepali">Nepali (नेपाली)</option>
                <option value="Spanish">Spanish (Español)</option>
              </select>
            </div>

            {/* Desktop Notifications Toggle */}
            <div className="flex items-center justify-between rounded-xl p-3 border border-slate-50">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-slate-400" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Desktop Notifications</p>
                  <p className="text-[10px] text-slate-400 font-medium">Alert for new arrivals</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications ? "bg-[#1e293b]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Audio Alerts Toggle */}
            <div className="flex items-center justify-between rounded-xl p-3 border border-slate-50">
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-slate-400" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Audio Alerts</p>
                  <p className="text-[10px] text-slate-400 font-medium">Chime on ticket call</p>
                </div>
              </div>
              <button
                onClick={() => setAudioAlerts(!audioAlerts)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  audioAlerts ? "bg-[#1e293b]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    audioAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Left: Counter Management */}
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[360px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Shield size={18} className="text-slate-500" />
                <span>Counter Management</span>
              </h2>
              
              <button
                onClick={handleAddCounter}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e293b] text-white hover:bg-slate-800 shadow-sm transition-colors"
              >
                <Plus size={15} className="stroke-[2.5]" />
              </button>
            </div>

            {/* List of active desk counters */}
            <div className="space-y-3">
              {counters.slice(0, 2).map((c, idx) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-4 transition-all hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    {/* Circle index */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">
                        {c.counterName}
                      </p>
                      <p className="text-[10px] font-bold text-[#10b981] mt-1 uppercase tracking-wider">
                        Active • Service: General
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Counter card outline */}
              <button
                onClick={handleAddCounter}
                className="w-full flex items-center justify-center rounded-2xl border border-dashed border-slate-200 py-4 text-xs font-bold text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
              >
                Assign a new counter...
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Right: Service Categories list */}
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[360px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Layers size={18} className="text-slate-500" />
                <span>Service Categories</span>
              </h2>
              <button className="text-xs font-extrabold uppercase text-slate-400 hover:text-slate-700 transition-colors">
                Reorder
              </button>
            </div>

            {/* List of categories */}
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50/50 p-4 border-l-4 ${cat.color}`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-slate-300 shrink-0 cursor-grab" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">
                        {cat.name}
                      </p>
                      <p className="text-[9px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full inline-block">
                        {cat.priority}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddCategory}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-3.5 text-xs font-bold text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
              >
                <Plus size={14} className="stroke-[2.5]" />
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Global Settings Actions Row */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <button
          onClick={handleDiscardChanges}
          className="rounded-full px-6 py-3.5 text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          Discard Changes
        </button>
        <button
          onClick={handleSaveConfig}
          className="inline-flex items-center gap-2 rounded-full bg-[#1e293b] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:bg-slate-800 transition-colors"
        >
          <Check size={14} className="stroke-[2.5]" />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
}
