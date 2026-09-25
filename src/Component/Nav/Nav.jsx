import { useContext } from "react";
import "./nav.css";
import { MyContext } from "../../App";
import { FaHome } from "react-icons/fa";
import {  NavLink } from "react-router-dom";
import { FaHeadphones } from "react-icons/fa";
import { FaBookReader } from "react-icons/fa";
import { FaRadio } from "react-icons/fa6";
import { CgTime } from "react-icons/cg";

import { ImTv } from "react-icons/im";

export default function Nav() {
  const [them, setThem] = useContext(MyContext);
  function handelThem() {
    if (them === "light") {
      setThem("dark");
      localStorage.setItem("them", "dark");
    } else {
      setThem("light");
      localStorage.setItem("them", "light");
    }
  }
  return (
    <nav>
      <div className="link">
        <NavLink to={"/"} aria-label="الرئيسية" title="الرئيسية">
          <i>
            <FaHome />
          </i>
        </NavLink>
        <NavLink to={"listen"} aria-label="الاستماع" title="الاستماع">
          <i>
            <FaHeadphones />{" "}
          </i>
        </NavLink>
        <NavLink to={"read/1"} aria-label="قراءة القرآن" title="قراءة القرآن">
          <i><FaBookReader />
          </i>
        </NavLink>
        <NavLink to={"radio"} aria-label="الإذاعات" title="الإذاعات">
          <i>
            <FaRadio />{" "}
          </i>
        </NavLink>
        <NavLink to={"tv"} aria-label="البث التلفزيوني" title="البث التلفزيوني">
          <i>
            <ImTv />{" "}
          </i>
        </NavLink>
        <NavLink to={"timings"} aria-label="مواقيت الصلاة" title="مواقيت الصلاة">
          <i>
            <CgTime />{" "}
          </i>
        </NavLink>
      </div>
      <div className="mode">
        <button type="button" onClick={handelThem} aria-label={them === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}><img
          src={them === "light" ? "/img/moon.png" : "/img/sun.png"}
          alt={them === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
        /></button>
      </div>
    </nav>
  );
}
