import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] bg-red-600 px-4 py-2 text-center shadow-lg transition-all">
      <div className="flex items-center justify-center gap-2 text-sm font-bold text-white">
        <WifiOff className="h-4 w-4" />
        You are offline. Some features may be unavailable.
      </div>
    </div>
  );
};

export default OfflineIndicator;
