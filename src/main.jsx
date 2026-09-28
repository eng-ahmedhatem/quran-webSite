import App from "./App";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./Component/ErrorBoundary/ErrorBoundary";
import "./main.css";

createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}
