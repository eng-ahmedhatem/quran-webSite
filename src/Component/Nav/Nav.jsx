import { useContext, useEffect, useState } from "react";
import { CgTime } from "react-icons/cg";
import { FaBookmark, FaBookReader, FaEllipsisH, FaHeadphones, FaHome, FaRegHeart, FaTimes } from "react-icons/fa";
import { FaRadio } from "react-icons/fa6";
import { ImTv } from "react-icons/im";
import { NavLink, useLocation } from "react-router-dom";
import { MyContext } from "../../App";
import "./nav.css";

const primaryItems = [
  { to: "/", label: "الرئيسية", icon: FaHome, end: true },
  { to: "/read", label: "القراءة", icon: FaBookReader },
  { to: "/listen", label: "الاستماع", icon: FaHeadphones },
  { to: "/adhkar", label: "الأذكار", icon: FaRegHeart },
];
const secondaryItems = [
  { to: "/radio", label: "الإذاعات", icon: FaRadio },
  { to: "/tv", label: "التلفزيون", icon: ImTv },
  { to: "/timings", label: "الصلاة", icon: CgTime },
  { to: "/bookmarks", label: "المحفوظات", icon: FaBookmark },
];
const navigationItems = [...primaryItems, ...secondaryItems];

const NavigationLink = ({ item, onClick }) => {
  const Icon = item.icon;
  return <NavLink to={item.to} end={item.end} onClick={onClick} aria-label={item.label} title={item.label}><i aria-hidden="true"><Icon /></i><span>{item.label}</span></NavLink>;
};

export default function Nav() {
  const [theme, setTheme] = useContext(MyContext);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  useEffect(() => setMoreOpen(false), [location.pathname]);
  useEffect(() => {
    const close = (event) => { if (event.key === "Escape") setMoreOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return <>
    <nav className="desktop-nav" aria-label="التنقل الرئيسي">
      <div className="nav-links">{navigationItems.map((item) => <NavigationLink item={item} key={item.to} />)}</div>
      <div className="nav-mode"><button type="button" onClick={toggleTheme} aria-label={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}><img src={theme === "light" ? "/img/moon.png" : "/img/sun.png"} alt="" /><span>{theme === "light" ? "ليلي" : "نهاري"}</span></button></div>
    </nav>

    {moreOpen && <button className="mobile-more-backdrop" type="button" onClick={() => setMoreOpen(false)} aria-label="إغلاق قائمة المزيد" />}
    <nav className="mobile-navigation" aria-label="التنقل السريع">
      {primaryItems.map((item) => <NavigationLink item={item} key={item.to} />)}
      <button className={moreOpen ? "active" : ""} type="button" onClick={() => setMoreOpen((current) => !current)} aria-expanded={moreOpen} aria-controls="mobile-more-menu"><i aria-hidden="true">{moreOpen ? <FaTimes /> : <FaEllipsisH />}</i><span>المزيد</span></button>
    </nav>
    {moreOpen && <aside className="mobile-more-menu open" id="mobile-more-menu">
      <header><div><small>خدمات التطبيق</small><strong>المزيد</strong></div><button type="button" onClick={() => setMoreOpen(false)} aria-label="إغلاق"><FaTimes /></button></header>
      <div>{secondaryItems.map((item) => <NavigationLink item={item} onClick={() => setMoreOpen(false)} key={item.to} />)}</div>
      <button className="mobile-theme" type="button" onClick={toggleTheme}><img src={theme === "light" ? "/img/moon.png" : "/img/sun.png"} alt="" /><span>{theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}</span></button>
    </aside>}
  </>;
}
