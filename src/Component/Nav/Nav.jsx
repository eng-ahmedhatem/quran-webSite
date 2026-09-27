import { useContext } from "react";
import { CgTime } from "react-icons/cg";
import { FaBookReader, FaHeadphones, FaHome } from "react-icons/fa";
import { FaRadio } from "react-icons/fa6";
import { ImTv } from "react-icons/im";
import { NavLink } from "react-router-dom";
import { MyContext } from "../../App";
import "./nav.css";

const navigationItems = [
  { to: "/", label: "الرئيسية", icon: FaHome, end: true },
  { to: "/listen", label: "الاستماع", icon: FaHeadphones },
  { to: "/read", label: "القراءة", icon: FaBookReader },
  { to: "/radio", label: "الإذاعات", icon: FaRadio },
  { to: "/tv", label: "التلفزيون", icon: ImTv },
  { to: "/timings", label: "الصلاة", icon: CgTime },
];

export default function Nav() {
  const [theme, setTheme] = useContext(MyContext);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <nav aria-label="التنقل الرئيسي">
      <div className="link">
        {navigationItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} aria-label={label} title={label}>
            <i aria-hidden="true"><Icon /></i>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
      <div className="mode">
        <button type="button" onClick={toggleTheme} aria-label={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"} title={theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}>
          <img src={theme === "light" ? "/img/moon.png" : "/img/sun.png"} alt="" />
          <span>{theme === "light" ? "ليلي" : "نهاري"}</span>
        </button>
      </div>
    </nav>
  );
}
