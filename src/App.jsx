import { createContext, lazy, Suspense, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Header from "./Component/Header/Header";
import Nav from "./Component/Nav/Nav";
import Main from "./Component/Main/Main";
import Footer from "./Component/Footer/Footer";
import Home from "./pages/Home/Home";
import { PlayerProvider } from "./Component/Audio_track/PlayerContext";

const ListenLayout = lazy(() => import("./pages/Listen/ListenLayout"));
const Audio = lazy(() => import("./pages/Listen/Audio"));
const Radio = lazy(() => import("./pages/Radio/Radio"));
const Tv = lazy(() => import("./pages/Tv/Tv"));
const Timing = lazy(() => import("./pages/Timing/Timing"));
const Read = lazy(() => import("./pages/Read/Read"));

export const MyContext = createContext(null);

function RouteLayout() {
  const location = useLocation();

  useEffect(() => {
    const routeTitles = {
      listen: "الاستماع للقرآن الكريم",
      read: "قراءة القرآن الكريم",
      radio: "إذاعات القرآن الكريم",
      tv: "البث القرآني المباشر",
      timings: "مواقيت الصلاة",
    };
    const section = location.pathname.split("/").filter(Boolean)[0];
    document.title = section ? `${routeTitles[section] || "القرآن الكريم"} — القرآن الكريم` : "القرآن الكريم — قراءة واستماع وإذاعات مباشرة";

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = new URL(location.pathname, "https://quran-website-app.netlify.app").href;
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return <><Header /><Nav /><Main><Outlet /></Main><Footer /></>;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || localStorage.getItem("them") || "light");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo(() => [theme, setTheme, isLoading, setIsLoading], [theme, isLoading]);

  return (
    <MyContext.Provider value={value}><PlayerProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="loading_section"><span className="loader_section" /></div>}><Routes>
          <Route path="/" element={<RouteLayout />}>
            <Route index element={<Home />} />
            <Route path="listen" element={<ListenLayout />}><Route path="audio" element={<Audio />} /></Route>
            <Route path="read/:surahNumber?/:ayahNumber?" element={<Read />} />
            <Route path="radio" element={<Radio />} />
            <Route path="tv" element={<Tv />} />
            <Route path="timings" element={<Timing />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes></Suspense>
      </BrowserRouter>
    </PlayerProvider></MyContext.Provider>
  );
}
