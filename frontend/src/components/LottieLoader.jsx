import { useEffect, useState } from "react";
import Lottie from "lottie-react";

const LOADER_PATH = "/assets/Loader.json";

export default function LottieLoader({
  size = 64,
  className = "",
  ariaLabel = "Loading",
}) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadAnimation = async () => {
      try {
        const response = await fetch(LOADER_PATH);
        const data = await response.json();
        if (!cancelled) {
          setAnimationData(data);
        }
      } catch {
        if (!cancelled) {
          setAnimationData(null);
        }
      }
    };

    loadAnimation();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!animationData) {
    return (
      <div
        className={`animate-pulse rounded-full bg-slate-200 ${className}`}
        style={{ width: size, height: size }}
        aria-label={ariaLabel}
        role="status"
      />
    );
  }

  return (
    <div
      className={className}
      role="status"
      aria-label={ariaLabel}
      style={{ width: size, height: size }}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
}
