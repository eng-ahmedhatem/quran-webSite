import App from "./App";
import { createRoot } from "react-dom/client";
import "aos/dist/aos.css"
import "./main.css"
createRoot(document.getElementById("root")).render(<App />)

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}
