import { useEffect, useState } from "react";
import { FaCloudArrowDown, FaWifi } from "react-icons/fa6";
import "./network-status.css";

export default function NetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    let restoredTimer;
    const handleOffline = () => {
      window.clearTimeout(restoredTimer);
      setShowRestored(false);
      setOnline(false);
    };
    const handleOnline = () => {
      setOnline(true);
      setShowRestored(true);
      restoredTimer = window.setTimeout(() => setShowRestored(false), 3500);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.clearTimeout(restoredTimer);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (online && !showRestored) return null;

  return (
    <div className={`network-status ${online ? "is-online" : "is-offline"}`} role="status" aria-live="polite">
      {online ? <FaWifi aria-hidden="true" /> : <FaCloudArrowDown aria-hidden="true" />}
      <div>
        <strong>{online ? "عاد الاتصال بالإنترنت" : "أنت الآن دون إنترنت"}</strong>
        <span>{online ? "يمكن تحديث المحتوى والاستماع من الشبكة." : "سيظل المحتوى الذي فتحته سابقًا متاحًا قدر الإمكان."}</span>
      </div>
    </div>
  );
}
