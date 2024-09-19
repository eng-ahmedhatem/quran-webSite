import { useState, useEffect } from "react";
import * as React from "react";
import moment from "moment-hijri";
import moment_2 from "moment";
import "moment/locale/ar-sa";
import "./timing.css";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { MyContext } from "../../App";
import { FaRegCalendarAlt } from "react-icons/fa";
import axios from "axios";
import SalahCard from "./SalahCard";
// function SalahCard({ name, time, next }) {
//   return (
//     <div className={`salah-card ${next && "next"}`}>
//       {next && <span className="nextSalah">الصلاة التالية</span>}
//       <h2>{name}</h2>
//       {next && <span className="timeNext">{next && next.timeLeft}</span>}
//       <p>{time}</p>
//     </div>
//   );
// }
export default function Timing() {

  const capitals = [
    { displayName: "القاهرة", apiName: "Cairo" },
    { displayName: "الجيزة", apiName: "Giza" },
    { displayName: "الإسكندرية", apiName: "Alexandria" },
    { displayName: "المنصورة", apiName: "Mansoura" },
    { displayName: "الغردقة", apiName: "Hurghada" },
    { displayName: "دمنهور", apiName: "Damanhur" },
    { displayName: "الفيوم", apiName: "Fayoum" },
    { displayName: "طنطا", apiName: "Tanta" },
    { displayName: "الإسماعيلية", apiName: "Ismailia" },
    { displayName: "شبين الكوم", apiName: "Shibin El Kom" },
    { displayName: "المنيا", apiName: "Minya" },
    { displayName: "بنها", apiName: "Banha" },
    { displayName: "الخارجة", apiName: "Kharga" },
    { displayName: "السويس", apiName: "Suez" },
    { displayName: "أسوان", apiName: "Aswan" },
    { displayName: "أسيوط", apiName: "Assiut" },
    { displayName: "بني سويف", apiName: "Beni Suef" },
    { displayName: "بورسعيد", apiName: "Port Said" },
    { displayName: "دمياط", apiName: "Damietta" },
    { displayName: "الزقازيق", apiName: "Zagazig" },
    { displayName: "الطور", apiName: "El Tor" },
    { displayName: "كفر الشيخ", apiName: "Kafr El Sheikh" },
    { displayName: "مرسى مطروح", apiName: "Marsa Matrouh" },
    { displayName: "الأقصر", apiName: "Luxor" },
    { displayName: "قنا", apiName: "Qena" },
    { displayName: "العريش", apiName: "Arish" },
    { displayName: "سوهاج", apiName: "Sohag" },
  ];
  const [apiReq_cityTarget, setApiReq_cityTarget] = useState("Cairo");
  const [timeNow, setTimeNow] = useState("");
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState({});
const [left,setLeft] = useState("")
const[isLoading,setIsLoading] = useState(true)
  const handleChange = (event) => {
    setApiReq_cityTarget((prev) => (prev = event.target.value));
  };
  useEffect(() => {
    setInterval(() => {
      const interval = setTimeNow(
        (prev) => (prev = moment().format("ss : mm : hh"))
      );
      return () => {
        clearInterval(interval);
      };
    }, 1000);
  }, []);
  async function getPrayer(city) {
    try {
      let url = `https://api.aladhan.com/v1/timingsByCity/{date}?city=${city}&country=eg`;
      const req = await axios.get(url);
      setPrayerTimes((prev) => (prev = req.data.data.timings));
      console.log(req.data.data.timings)
      setTimeout(() => {
        setIsLoading(false)
      }, 300);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getPrayer(apiReq_cityTarget);
  }, [apiReq_cityTarget]);

  useEffect(()=>{
    if(nextPrayer.name){
      const interval = setInterval(() => {
        const currentTime_ = moment_2()
        let duration
        if(nextPrayer.name == "Fajr"){
          const fromNow_toMidNight = moment_2("23:59:59","HH:mm:ss").diff(currentTime_)
          const fromMidNight_toFajer = moment_2(prayerTimes[nextPrayer.name], "HH:mm").diff(moment_2("00:00:00","HH:mm:ss"))
          let results = fromMidNight_toFajer + fromNow_toMidNight + 2000
          duration = moment_2.duration(results)

        }else {
          duration = moment_2.duration(
            moment_2(prayerTimes[nextPrayer.name], "HH:mm").diff(currentTime_)
          );
        }
        setLeft(prev => prev = `${duration.hours()} : ${duration.minutes()} : ${duration.seconds()}`)
      }, 1000);
      return ()=> {
        clearInterval(interval)
      }
    }
  },[nextPrayer])
  function theNext_prayer() {
    const currentTime = moment_2();
    if (
      currentTime.isAfter(moment_2(prayerTimes.Fajr, "HH:mm")) &&
      currentTime.isBefore(moment_2(prayerTimes.Dhuhr, "HH:mm"))
    ) {
      setNextPrayer({
        name: "Dhuhr",
        timeLeft: left
      });
    } else if (
      currentTime.isAfter(moment_2(prayerTimes.Dhuhr, "HH:mm")) &&
      currentTime.isBefore(moment_2(prayerTimes.Asr, "HH:mm"))
    ) {
      setNextPrayer({
        name: "Asr",
        timeLeft: left
      });
    } else if (
      currentTime.isAfter(moment_2(prayerTimes.Asr, "HH:mm")) &&
      currentTime.isBefore(moment_2(prayerTimes.Maghrib, "HH:mm"))
    ) {
      setNextPrayer({
        name: "Maghrib",
        timeLeft:  left
      });
    } else if (
      currentTime.isAfter(moment_2(prayerTimes.Maghrib, "HH:mm")) &&
      currentTime.isBefore(moment_2(prayerTimes.Isha, "HH:mm"))
    ) {
      setNextPrayer({
        name: "Isha",
        timeLeft: left
      });
    } else {
      setNextPrayer({
        name: "Fajr",
        timeLeft:  left
      });
    }
  }

  useEffect(() => {
    if (Object.keys(prayerTimes).length > 0) {
      theNext_prayer();
    }
  }, [prayerTimes,left]);
  if (isLoading){
    return(
      <div className={"loading_section"}>
      <span className="loader_section"></span>
      </div>
    )
  }
  return (
    <>
    <div className="Timing">
      <div className="row-1">
        <div className="text-day">
          <h4>
            اليوم
            <FaRegCalendarAlt />
          </h4>
          <p>
            <span>{moment().format("iD")}</span>{" "}
            <span>{moment().format("iMMMM")}</span>
            <span>{moment().format("iYYYY")} هجرياً</span>
          </p>
          <p>
            <span>{moment().format("D")}</span>{" "}
            <span>{moment().format("MMMM")}</span>
            <span>{moment().format("YYYY")} ميلادياً</span>
          </p>
          <p>
            {" "}
            {parseInt(moment().locale("en").format("hh")) <= 12
              ? "ص"
              : "م"}{" "}
            {timeNow}
          </p>
        </div>
        <div className="text-location">
          <h1>
            اوقات الصلاة في{" "}
            <span>
              {
                capitals.filter((city) => city.apiName == apiReq_cityTarget)[0]
                  .displayName
              }
            </span>
          </h1>
          <Box>
            <FormControl fullWidth variant="filled" sx={{ fontSize: "16px" }}>
              <InputLabel
                sx={{
                  borderRadius: "10px",
                  fontFamily: "Readex-light",
                  fontSize: "16px",
                  color: "var(--main-text-color)",
                }}
                id="selectCountry"
              >
                اختر المدينة
              </InputLabel>
              <Select
                sx={{
                  fontSize: "16px",
                  color: "var(--main-text-color)",
                  fontFamily: "Readex-light",
                }}
                labelId="selectCountry"
                id="selectCountry_id"
                value={apiReq_cityTarget}
                onChange={handleChange}
              >
                {capitals.map((city, id) => (
                  <MenuItem
                    sx={{ fontSize: "16px", fontFamily: "Readex-light" }}
                    value={city.apiName}
                    key={id}
                  >
                    {city.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </div>
      </div>
      <div className="row-2">
        <div className="cards">
          <SalahCard
            name={"الفجر"}
            time={" ص " + prayerTimes.Fajr}
            next={nextPrayer.name == "Fajr" ? nextPrayer : false}
          />
          <SalahCard name={"الشروق"} time={" ص " + moment_2(prayerTimes.Sunrise,"hh:mm").format("hh:mm")} />
          <SalahCard
            name={"الظهر"}
            time={" م " + moment_2( prayerTimes.Dhuhr,"hh:mm").format("hh:mm")}
            next={nextPrayer.name == "Dhuhr" ? nextPrayer : false}
          />
          <SalahCard
            name={"العصر"}
            time={
              " م " +
              moment_2(prayerTimes.Asr,"hh:mm").format("hh:mm")
              }
            next={nextPrayer.name == "Asr" ? nextPrayer : false}
          />
          <SalahCard
            name={"المغرب"}
            time={
              " م " +
              moment_2(prayerTimes.Maghrib,"hh:mm").format("hh:mm")
            }
            next={nextPrayer.name == "Maghrib" ? nextPrayer : false}
          />
          <SalahCard
            name={"العشاء"}
            time={
              " م " +
              moment_2(prayerTimes.Isha,"hh:mm").format("hh:mm")
            }
            next={nextPrayer.name == "Isha" ? nextPrayer : false}
          />
        </div>
      </div>
    </div>
    </>
  );

}
