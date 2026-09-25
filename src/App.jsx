import { createContext, lazy, Suspense, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Header from "./Component/Header/Header";
import Nav from "./Component/Nav/Nav";
import Main from "./Component/Main/Main";
import Footer from "./Component/Footer/Footer";
import Home from "./pages/Home/Home";

const ListenLayout = lazy(() => import("./pages/Listen/ListenLayout"));
const Audio = lazy(() => import("./pages/Listen/Audio"));
const Radio = lazy(() => import("./pages/Radio/Radio"));
const Tv = lazy(() => import("./pages/Tv/Tv"));
const Timing = lazy(() => import("./pages/Timing/Timing"));
const Read = lazy(() => import("./pages/Read/Read"));

export const MyContext = createContext(null);

function RouteLayout() {
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
    <MyContext.Provider value={value}>
      <BrowserRouter>
        <Suspense fallback={<div className="loading_section"><span className="loader_section" /></div>}><Routes>
          <Route path="/" element={<RouteLayout />}>
            <Route index element={<Home />} />
            <Route path="listen" element={<ListenLayout />}><Route path="audio" element={<Audio />} /></Route>
            <Route path="read/:surahNumber?" element={<Read />} />
            <Route path="radio" element={<Radio />} />
            <Route path="tv" element={<Tv />} />
            <Route path="timings" element={<Timing />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes></Suspense>
      </BrowserRouter>
    </MyContext.Provider>
  );
}
