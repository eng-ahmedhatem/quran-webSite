import React, { useEffect, useState } from "react";
import "./Header.css";
import { CiSearch } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { memo } from "react";
import {
  get_SorahData,
  Sorah_card,
  handelData_sorah,
} from "../../pages/Listen/Functions";
export function Search_component({ change, value, id }) {
  function handelFocus(e) {
    e.target.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <div className="search">
      <input
        onFocus={(e) => handelFocus(e)}
        onChange={change}
        value={value}
        type="text"
        placeholder="البحث عن سورة"
        name=""
        id={id}
      />
      <label htmlFor={id}>
        <CiSearch />
      </label>
    </div>
  );
}
export default memo(function Header() {
  const navigate = useNavigate()
  const [searchVal, setSearchVal] = useState("");
  const [sorah, setSorah] = useState([]);
  const [sorahName_foreSearch, set_sorahName_foreSearch] = useState([]);
  const [fillterSorah,setFillterSorah]=useState([])
  useEffect(()=>{
    get_SorahData(setSorah,set_sorahName_foreSearch)
  },[])
  useEffect(()=>{
    if (sorah.length > 0 && sorahName_foreSearch.length > 0) {
      handelData_sorah(sorah,sorahName_foreSearch,setFillterSorah,handelClick)
    }
    setFillterSorah(
      (prev) =>
        (prev = sorah.map((ele) => (
          <Sorah_card
            transform={handelClick}
            key={ele.number}
            sorahId={ele.number}
            title={ele.name}
            ayaCount={ele.numberOfAyahs}
            theClass={"show"}
          />
        )))
    );
  },[sorah,sorahName_foreSearch])
  function handelClick(e) {
    setSearchVal("")
    document.querySelector(".search-home").style.cssText = `display:none`
    if (innerWidth < 1600) {
      document.querySelector("main").scrollTop = 0;
    }
    const state = {
      title: e.currentTarget.title,
      sorah_id: e.currentTarget.id,
      id: 112,
      ro: 112,
    };
    navigate("/listen/audio", { state: state });
  }
  let handelChange = (e) => {
    if (e.target.value.length > 0) {
      document.querySelector(".search-home").style.cssText = `
      z-index: 50;
      opacity:1;
        transform: translate(-50%,-50%) !important;
        `;
      } else {
        document.querySelector(".search-home").style.cssText = `
        z-index: -50;
          transform: translate(-50%,-60%);
          opacity:0
          `;
          setTimeout(() => {
            document.querySelector(".search-home").style.cssText = `display:none`
      }, 300);
    }
    setSearchVal((val) => (val = e.target.value));
    const newData = sorah.map((ele) => {
      if (ele.name_2.includes(e.target.value)) {
        return (
          <Sorah_card
            key={ele.number}
            transform={handelClick}
            sorahId={ele.number}
            title={ele.name}
            ayaCount={ele.numberOfAyahs}
            theClass={"show"}
          />
        );
      }
      return (
        <Sorah_card
          key={ele.number}
          transform={handelClick}
          sorahId={ele.number}
          title={ele.name}
          ayaCount={ele.numberOfAyahs}
          theClass={"hidden"}
          />
      );
    });
    setFillterSorah(prev => prev = newData);

  };
let l = fillterSorah.filter((ele) => ele.props.theClass == "hidden");
  return (
    <>

            <div className="search-home">
    <div className="cards">
    {sorah.length > 0 && fillterSorah}
            {l.length == 114 && (
              <div className="noResults">
                <h4>مفيش حاجة بالإسم دا 🙂</h4>
              </div>
            )}
    </div>
      </div>
    <header>
      <div className="container">
        <Link to={"/"}>
          <div className="logo">
            <img src="/img/logo.png" alt="" />
            <h2>القرآن الكريم</h2>
          </div>
        </Link>
        <Search_component value={searchVal} change={handelChange} id={"search-1"} />
      </div>
    </header>
    </>
  );
});
