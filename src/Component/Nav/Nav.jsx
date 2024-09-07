import React, { useContext } from "react";
import "./nav.css";
import { MyContext } from "../../App";
import { FaHome } from "react-icons/fa";
import {  NavLink } from "react-router-dom";
import { FaHeadphones } from "react-icons/fa";
import { FaBookReader } from "react-icons/fa";

export default function Nav() {
  const [them, setThem] = useContext(MyContext);
  function handelThem() {
    if (them == "light") {
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
        <NavLink to={"/"}>
          <i>
            <FaHome />
          </i>
        </NavLink>
        <NavLink to={"listen"}>
          <i>
            <FaHeadphones />{" "}
          </i>
        </NavLink>
        <a>
          <i><FaBookReader />
          </i>
        </a>
      </div>
      <div className="mode">
        <img
          src={them == "light" ? "/img/moon.png" : "/img/sun.png"}
          alt=""
          onClick={handelThem}
        />
      </div>
    </nav>
  );
}
