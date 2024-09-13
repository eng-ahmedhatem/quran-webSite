import axios from "axios";
import React from "react";

export function Sorah_card({ sorahId, title, ayaCount, theClass, transform }) {
  return (
    <div
      title={title}
      onClick={(e) => transform(e)}
      className={`card-sorah ${theClass}`}
      id={sorahId}
    >
      <span className="sorahId">{sorahId}</span>
      <h5 className="title">{title}</h5>
      <span className="ayaCount">{ayaCount} أيه</span>
    </div>
  );
}
export function get_SorahData(setSorah,set_sorah_forSearch) {
  async function getData(url) {
    try {
      axios.get("https://quranapi.pages.dev/api/surah.json").then((res) => {
        set_sorah_forSearch(res.data);
      });
      await axios.get(url).then((res) => {
        setSorah(res.data.data);
      });
    } catch (error) {
      console.log(error);
    }
  }
  if (localStorage.getItem("soraData"))
    setSorah((prev) => (prev = JSON.parse(localStorage.getItem("soraData"))));
  else getData("https://api.alquran.cloud/v1/surah");
}

export function handelData_sorah(sorah,sorahName_foreSearch,setFillterSorah,handelClick) {
  if (sorah.length > 0) {
    if (sorahName_foreSearch) {
      sorahName_foreSearch[0].surahNameArabicLong = "سورة الفاتحة"
      console.log(sorahName_foreSearch)
      sorah.map((ele) => {
        ele.name_2 = sorahName_foreSearch[ele.number - 1].surahNameArabicLong;
      });
      localStorage.setItem("soraData", JSON.stringify(sorah));
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
  }

  }


