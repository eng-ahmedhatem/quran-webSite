import React from "react";
import "./Header.css";
import { CiSearch } from "react-icons/ci";
import { Link } from "react-router-dom";
import { memo } from "react";
export function Search_component({change , value ,id}){
  function handelFocus(e){
    e.target.scrollIntoView({ behavior: "smooth" })
  }
  return (
    <div className="search">
          <input onFocus={(e)=> handelFocus(e)} onChange={change} value={value} type="text" placeholder="البحث عن سورة" name="" id={id} />
          <label htmlFor={id}><CiSearch/></label>
        </div>
  );
}
export default memo(function Header() {
  return (
    <header>
      <div className="container">
        <Link to={"/"}>
        <div className="logo">
          <img src="/img/logo.png" alt="" />
          <h2>القرآن الكريم</h2>
        </div>
        </Link>
        <Search_component id={"search-1"}/>
      </div>
    </header>
  );
})
