import React, { useEffect, useRef, useState } from "react";
import Section_header from "../../Component/Section_header/Section_header";
import axios from "axios";
import "./radio.css";
import Audio_track from "../../Component/Audio_track/Audio_track";
export default function Radio() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading_compo, setIsLoading_compo] = useState(true);
  const audio_ui = useRef(null);
  useEffect(() => {
    async function getData() {
      axios
        .get("https://data-rosy.vercel.app/radio.json")
        .then((res) => {
          const moreData = [
            {
              id: "25",
              name: "محمد متولي الشعراوي",
              url: `https://server3.quraan.us:8014/;*.mp3`,
            },
            {
              id: 80,
              name: " إذاعة مصطفى إسماعيل",
              url: "https://backup.qurango.net/radio/mustafa_ismail",
              recent_date: "2020-04-25 16:04:05",
            },
            {
              id: 21114,
              name: "في ظلال السيرة النبوية - 400 حلقة عن سيرة نبينا محمد صلى الله عليه وسلم",
              url: "https://backup.qurango.net/radio/fi_zilal_alsiyra",
              recent_date: "2021-09-26 19:36:41",
            },
            {
              id: 21116,
              name: "كتاب الاختيارات الفقهية في مسائل العبادات والمعاملات من فتاوى الشيخ ابن باز",
              url: "https://backup.qurango.net/radio/alaikhtiarat_alfiqhayh_bin_baz",
              recent_date: "2022-02-13 17:48:06",
            },
            {
              id: 21117,
              name: "تفسير القران الكريم-الخلاصة من تفسير الطبري",
              url: "https://backup.qurango.net/radio/tabri",
              recent_date: "2023-12-02 14:42:00",
            },
            {
              id: 180,
              name: "إذاعة سعود الشريم",
              url: "https://backup.qurango.net/radio/saud_alshuraim",
              recent_date: "2020-04-25 16:04:04",
            },
            {
              id: 115,
              name: "إذاعة-سورة البقرة  لعدد من القراء",
              url: "https://backup.qurango.net/radio/albaqarah",
              recent_date: "2020-04-25 16:04:05",
            },
            {
              id: 113,
              name: "إذاعة الفتاوى العامة",
              url: "https://backup.qurango.net/radio/fatwa",
              recent_date: "2020-06-26 20:39:55",
            },
            {
              id: 109061,
              name: "فضل شهر رمضان",
              url: "https://backup.qurango.net/radio/ramadan",
              recent_date: "2024-04-12 23:33:01",
            },
            {
              id: 10907,
              name: "أذكار المساء",
              url: "https://backup.qurango.net/radio/athkar_masa",
              recent_date: "2021-08-27 06:49:07",
            },
            {
              id: 10902,
              name: "آيات السكينة",
              url: "https://backup.qurango.net/radio/sakeenah",
              recent_date: "2020-07-17 08:39:15",
            },
            {
              id: 10903,
              name: "---إذاعة صور من حياة الصحابة والتابعين رضوان الله عليهم---",
              url: "https://backup.qurango.net/radio/sahabah",
              recent_date: "2020-07-17 08:40:45",
            },
          ];
          setData((prev) => (prev = [...res.data.radios, ...moreData]));
          sessionStorage.setItem(
            "radio",
            JSON.stringify([...res.data.radios, ...moreData])
          );
          setTimeout(() => {
            // setIsLoading_compo(false)
          }, 300);
        })
        .catch((error) => console.log(error));
    }
    if (sessionStorage.getItem("radio")) {
      setData(JSON.parse(sessionStorage.getItem("radio")));
      setTimeout(() => {
        // setIsLoading_compo(false)
      }, 1000);
    } else {
      getData();
    }
  }, []);
  const [playList, setPlayList] = useState();
  function handelClick(ele) {
    audio_ui.current.style.cssText = "  transform: translate(-50%,0);";
    setIsLoading(true);
    setPlayList([
      {
        name: ele.name,
        writer: "text",
        img: "text",
        src: ele.url,
        id: 1,
      },
    ]);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }
  useEffect(()=>{
    setTimeout(() => {
      document.readyState == "complete" ? setIsLoading_compo(false) : document.addEventListener("load",()=>{
        setIsLoading_compo(false)})
    }, 500);
console.log(document.readyState)
return () => {
  document.removeEventListener("load",()=>{
    setIsLoading_compo(true)})
}
  },[document.readyState])
  // if (isLoading_compo){
  //   return(
  //     <div className={"loading_section"}>
  //     <span className="loader_section"></span>
  //     </div>
  //   )
  // }
  return (
    <div className="radio">
      {isLoading_compo && <div className={"loading_section"}>
      <span className="loader_section"></span>
      </div>}
      <Section_header title={"المحطات المتاحة"} />
      <div className="content-audio">
        <div className="audio-ui" ref={audio_ui}>
          <div
            className={isLoading ? "loading_section" : "loading_section end"}
          >
            <span className="loader_section"></span>
          </div>
          {!isLoading && (
            <Audio_track  thePlayList={playList} from_radio={true} />
          )}
        </div>
        <div className="cards">
          {data.length > 0 &&
            data
              .filter((ele) => !ele.name.includes("ترجمة"))
              .map((ele) => (
                <div
                  onClick={() => handelClick(ele)}
                  key={ele.id}
                  className="card"
                >
                  <div className="live">
                    <span>مباشر</span>
                    <i></i>
                  </div>
                  <h2>{ele.name}</h2>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
