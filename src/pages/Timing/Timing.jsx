import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { FaRegCalendarAlt } from "react-icons/fa";
import SalahCard from "./SalahCard";
import Status from "../../Component/Status/Status";
import { getPrayerTimes } from "../../services/api";
import "./timing.css";

const cities = [
  ["القاهرة", "Cairo"], ["الجيزة", "Giza"], ["الإسكندرية", "Alexandria"],
  ["المنصورة", "Mansoura"], ["الغردقة", "Hurghada"], ["دمنهور", "Damanhur"],
  ["الفيوم", "Fayoum"], ["طنطا", "Tanta"], ["الإسماعيلية", "Ismailia"],
  ["شبين الكوم", "Shibin El Kom"], ["المنيا", "Minya"], ["بنها", "Banha"],
  ["الخارجة", "Kharga"], ["السويس", "Suez"], ["أسوان", "Aswan"],
  ["أسيوط", "Assiut"], ["بني سويف", "Beni Suef"], ["بورسعيد", "Port Said"],
  ["دمياط", "Damietta"], ["الزقازيق", "Zagazig"], ["الطور", "El Tor"],
  ["كفر الشيخ", "Kafr El Sheikh"], ["مرسى مطروح", "Marsa Matrouh"],
  ["الأقصر", "Luxor"], ["قنا", "Qena"], ["العريش", "Arish"], ["سوهاج", "Sohag"],
].map(([displayName, apiName]) => ({ displayName, apiName }));

const prayers = [
  ["Fajr", "الفجر"], ["Sunrise", "الشروق"], ["Dhuhr", "الظهر"],
  ["Asr", "العصر"], ["Maghrib", "المغرب"], ["Isha", "العشاء"],
];

function dateParts(date, calendar) {
  const formatter = new Intl.DateTimeFormat(`ar-EG-u-ca-${calendar}`, { day: "numeric", month: "long", year: "numeric" });
  const parts = formatter.formatToParts(date);
  return ["day", "month", "year"].map((type) => parts.find((part) => part.type === type)?.value);
}

function prayerDate(time, baseDate, tomorrow = false) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  if (tomorrow) date.setDate(date.getDate() + 1);
  return date;
}

function displayPrayer(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours < 12 ? "ص" : "م"} ${String(hours % 12 || 12).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default function Timing() {
  const [city, setCity] = useState("Cairo");
  const [now, setNow] = useState(new Date());
  const [timings, setTimings] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    setTimings(null);
    setError("");
    getPrayerTimes(city).then((data) => active && setTimings(data.timings))
      .catch(() => active && setError("تعذر تحميل مواقيت الصلاة. تحقق من اتصالك ثم أعد المحاولة."));
    return () => { active = false; };
  }, [city, retry]);

  const nextPrayer = useMemo(() => {
    if (!timings) return null;
    const obligatory = prayers.filter(([key]) => key !== "Sunrise");
    let match = obligatory.map(([name]) => ({ name, at: prayerDate(timings[name], now) })).find((item) => item.at > now);
    if (!match) match = { name: "Fajr", at: prayerDate(timings.Fajr, now, true) };
    const seconds = Math.max(0, Math.floor((match.at - now) / 1000));
    return { name: match.name, timeLeft: `${String(Math.floor(seconds / 3600)).padStart(2, "0")} : ${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")} : ${String(seconds % 60).padStart(2, "0")}` };
  }, [now, timings]);

  if (error) return <Status message={error} action={() => setRetry((value) => value + 1)} />;
  if (!timings) return <div className="loading_section"><span className="loader_section" /></div>;

  const hijri = dateParts(now, "islamic");
  const gregorian = dateParts(now, "gregory");
  const cityName = cities.find((item) => item.apiName === city)?.displayName;

  return (
    <div className="Timing">
      <div className="row-1">
        <div className="text-day">
          <h4>اليوم <FaRegCalendarAlt /></h4>
          <p><span>{hijri[0]}</span><span>{hijri[1]}</span><span>{hijri[2]} هجرياً</span></p>
          <p><span>{gregorian[0]}</span><span>{gregorian[1]}</span><span>{gregorian[2]} ميلادياً</span></p>
          <p>{now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
        </div>
        <div className="text-location">
          <h1>أوقات الصلاة في <span>{cityName}</span></h1>
          <Box><FormControl fullWidth variant="filled">
            <InputLabel id="select-city">اختر المدينة</InputLabel>
            <Select labelId="select-city" value={city} onChange={(event) => setCity(event.target.value)}>
              {cities.map((item) => <MenuItem value={item.apiName} key={item.apiName}>{item.displayName}</MenuItem>)}
            </Select>
          </FormControl></Box>
        </div>
      </div>
      <div className="row-2"><div className="cards">
        {prayers.map(([key, name]) => <SalahCard key={key} name={name} time={displayPrayer(timings[key])} next={nextPrayer?.name === key ? nextPrayer : false} />)}
      </div></div>
    </div>
  );
}
