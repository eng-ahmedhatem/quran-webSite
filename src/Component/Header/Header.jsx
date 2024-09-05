import React from "react";
import "./Header.css";
import { CiSearch } from "react-icons/ci";
export default function Header() {
  return (
    <header>
      <div className="container">
        <div className="logo">
          <img src="/img/logo.png" alt="" />
          <h2>القرآن الكريم</h2>
        </div>
        <div className="search">
          <input type="text" placeholder="البحث عن سورة" name="" id="search" />
          <label htmlFor="search"><CiSearch/></label>
        </div>
      </div>
    </header>
  );
}
