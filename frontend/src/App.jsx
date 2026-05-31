import LandingPage from "./Landing Page/LandingPage";
import DashboardPage from "./StaffAdmin/DashboardPage";
import AdminConsolePage from "./AdminConsole/AdminConsolePage";
import { Login } from "./Authentication/Login";
import { SignUp } from "./Authentication/SignUp";
import { ForgotPassword } from "./Authentication/ForgotPassword";
import { JoinPage } from "./Join/JoinPage";
import { QRGeneratorPage } from "./Join/QRGeneratorPage";
import TokenPage from "./Token/TokenPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const AUTH_USER_STORAGE_KEY = "meropaalo_auth_user";

function RequireRole({ allowedRoles, children }) {
  let user = null;
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10b981",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#10b981",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#ef4444",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#ef4444",
            },
          },
        }}
      />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/token-status" element={<TokenPage />} />

      <Route path="/qr-generator" element={<QRGeneratorPage />} />
      <Route
        path="/staff-admin"
        element={
          <RequireRole allowedRoles={["staff", "admin"]}>
            <DashboardPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <AdminConsolePage />
          </RequireRole>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
    </>)
}

export default App;
