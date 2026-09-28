import { createContext, lazy, Suspense, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import Header from "./Component/Header/Header";
import Nav from "./Component/Nav/Nav";
import Main from "./Component/Main/Main";
import Footer from "./Component/Footer/Footer";
import Home from "./pages/Home/Home";
import { PlayerProvider } from "./Component/Audio_track/PlayerContext";
import { routeTitleFor } from "./routes";
import NetworkStatus from "./Component/NetworkStatus/NetworkStatus";
import Onboarding from "./Component/Onboarding/Onboarding";
import PageSkeleton from "./Component/Skeleton/PageSkeleton";

const ListenLayout = lazy(() => import("./pages/Listen/ListenLayout"));
const Audio = lazy(() => import("./pages/Listen/Audio"));
const Radio = lazy(() => import("./pages/Radio/Radio"));
const Tv = lazy(() => import("./pages/Tv/Tv"));
const Timing = lazy(() => import("./pages/Timing/Timing"));
const Read = lazy(() => import("./pages/Read/ReadBySelection"));
const Adhkar = lazy(() => import("./pages/Adhkar/Adhkar"));
const Bookmarks = lazy(() => import("./pages/Bookmarks/Bookmarks"));

export const MyContext = createContext(null);
const WHATSAPP_SUPPORT_URL = `https://wa.me/201090665351?text=${encodeURIComponent("السلام عليكم، أواجه مشكلة في تطبيق القرآن الكريم وأحتاج إلى مساعدة.")}`;

function RouteLayout() {
  const location = useLocation();
  const skeletonVariant = location.pathname.startsWith("/read") ? "reader" : location.pathname.startsWith("/timings") ? "timing" : "page";

  useEffect(() => {
    document.title = routeTitleFor(location.pathname);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = new URL(location.pathname, window.location.origin).href;
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return <><a className="skip-link" href="#main">انتقل إلى المحتوى</a><Header /><Nav /><Main><div className="route-stage" key={location.pathname}><Suspense fallback={<PageSkeleton variant={skeletonVariant} />}><Outlet /></Suspense></div></Main><Onboarding /><NetworkStatus /><a className="whatsapp-support" href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noopener noreferrer" aria-label="تواصل مع الدعم عبر واتساب" title="الدعم عبر واتساب"><FaWhatsapp aria-hidden="true" /><span>تحتاج مساعدة؟</span></a><Footer /></>;
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
        <Routes>
          <Route path="/" element={<RouteLayout />}>
            <Route index element={<Home />} />
            <Route path="listen" element={<ListenLayout />}><Route path="audio" element={<Audio />} /></Route>
            <Route path="read/juz/:juzNumber" element={<Read />} />
            <Route path="read/:surahNumber?/:ayahNumber?" element={<Read />} />
            <Route path="adhkar" element={<Adhkar />} />
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="radio" element={<Radio />} />
            <Route path="tv" element={<Tv />} />
            <Route path="timings" element={<Timing />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PlayerProvider></MyContext.Provider>
  );
}
