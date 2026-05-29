import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const CustomerLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const department = searchParams.get("department") || "";

  useEffect(() => {
    const returnTo = department
      ? `/join?department=${encodeURIComponent(department)}`
      : "/join";
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, {
      replace: true,
    });
  }, [department, navigate]);

  return null;
};
