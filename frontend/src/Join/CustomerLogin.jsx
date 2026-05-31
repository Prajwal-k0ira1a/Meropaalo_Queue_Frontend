import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const CustomerLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const department = searchParams.get("department") || "";
  const takeToken = searchParams.get("takeToken") === "1";

  useEffect(() => {
    const returnTo = department
      ? `/join?department=${encodeURIComponent(department)}${takeToken ? "&takeToken=1" : ""}`
      : "/join";
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, {
      replace: true,
    });
  }, [department, navigate, takeToken]);

  return null;
};
