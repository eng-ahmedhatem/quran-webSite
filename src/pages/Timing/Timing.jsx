import { useEffect, useMemo, useState } from "react";
import { FaBell, FaBellSlash, FaClock, FaMapMarkerAlt, FaRegCalendarAlt } from "react-icons/fa";
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
  const [notificationStatus, setNotificationStatus] = useState(() => {
    if (!("Notification" in window)) return "unsupported";
    return localStorage.getItem("quran:prayer-notifications") === "enabled" && Notification.permission === "granted" ? "enabled" : "disabled";
  });

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
    return { name: match.name, label: prayers.find(([key]) => key === match.name)?.[1], at: match.at, timeLeft: `${String(Math.floor(seconds / 3600)).padStart(2, "0")} : ${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")} : ${String(seconds % 60).padStart(2, "0")}` };
  }, [now, timings]);

  const enableNotifications = async () => {
    if (!("Notification" in window)) return setNotificationStatus("unsupported");
    const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (permission === "granted") { localStorage.setItem("quran:prayer-notifications", "enabled"); setNotificationStatus("enabled"); }
    else setNotificationStatus("denied");
  };
  const disableNotifications = () => { localStorage.removeItem("quran:prayer-notifications"); setNotificationStatus("disabled"); };

  useEffect(() => {
    if (!timings || notificationStatus !== "enabled" || Notification.permission !== "granted") return undefined;
    const cityLabel = cities.find((item) => item.apiName === city)?.displayName;
    const notify = async (label) => {
      const options = { body: `حان الآن وقت صلاة ${label} في ${cityLabel}`, icon: "/img/logo.png", badge: "/img/logo.png", tag: `prayer-${label}`, dir: "rtl", lang: "ar" };
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) registration.showNotification(`موعد صلاة ${label}`, options);
      else new Notification(`موعد صلاة ${label}`, options);
    };
    const timers = prayers.filter(([key]) => key !== "Sunrise").map(([key, label]) => {
      const at = prayerDate(timings[key], new Date(), key === "Fajr" && prayerDate(timings[key], new Date()) <= new Date());
      const delay = at.getTime() - Date.now();
      return delay > 0 ? window.setTimeout(() => notify(label), delay) : null;
    }).filter(Boolean);
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [city, notificationStatus, timings]);

  if (error) return <Status message={error} action={() => setRetry((value) => value + 1)} />;
  if (!timings) return <div className="loading_section"><span className="loader_section" /></div>;

  const hijri = dateParts(now, "islamic");
  const gregorian = dateParts(now, "gregory");
  const cityName = cities.find((item) => item.apiName === city)?.displayName;

  return (
    <div className="Timing">
      <section className={`prayer-hero prayer-${nextPrayer?.name || "day"}`}>
        <div className="prayer-heading"><span><FaRegCalendarAlt /> مواقيت اليوم</span><h1>أوقات الصلاة في <em>{cityName}</em></h1><p>مواقيت محسوبة لمدينتك مع تنبيه اختياري عند دخول وقت الصلاة.</p><label className="city-select"><FaMapMarkerAlt /><select aria-label="اختر المدينة" value={city} onChange={(event) => setCity(event.target.value)}>{cities.map((item) => <option value={item.apiName} key={item.apiName}>{item.displayName}</option>)}</select></label></div>
        <div className="next-prayer-panel"><small>الصلاة التالية</small><strong>{nextPrayer?.label}</strong><time><FaClock /> {nextPrayer?.timeLeft}</time><span>الوقت المتبقي</span></div>
        <div className="prayer-date"><div><span>{hijri[0]}</span><strong>{hijri[1]}</strong><small>{hijri[2]} هـ</small></div><p>{gregorian.join(" ")}</p><time>{now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time></div>
      </section>
      <section className="prayer-notifications"><div className="notification-icon">{notificationStatus === "enabled" ? <FaBell /> : <FaBellSlash />}</div><div><strong>تنبيهات مواقيت الصلاة</strong><p>{notificationStatus === "enabled" ? `مفعّلة لمواقيت ${cityName} ما دام التطبيق مفتوحًا.` : notificationStatus === "denied" ? "الإشعارات محظورة من المتصفح. فعّلها من إعدادات الموقع." : notificationStatus === "unsupported" ? "هذا المتصفح لا يدعم إشعارات الويب." : "فعّلها ليصلك تنبيه عند دخول وقت كل صلاة."}</p></div>{notificationStatus === "enabled" ? <button type="button" onClick={disableNotifications}>إيقاف التنبيهات</button> : <button type="button" disabled={notificationStatus === "unsupported" || notificationStatus === "denied"} onClick={enableNotifications}>تفعيل التنبيهات</button>}</section>
      <section className="prayer-times"><div className="prayer-section-head"><div><small>اليوم</small><h2>جدول الصلوات</h2></div><span>التوقيت المحلي لمدينة {cityName}</span></div><div className="cards">
        {prayers.map(([key, name]) => <SalahCard key={key} name={name} time={displayPrayer(timings[key])} next={nextPrayer?.name === key ? nextPrayer : false} />)}
      </div></section>
    </div>
  );
}
