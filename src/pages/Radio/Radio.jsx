import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../../Component/Section_header/Section_header";
import Status from "../../Component/Status/Status";
import { CAIRO_RADIO, getRadios } from "../../services/api";
import { usePlayer } from "../../Component/Audio_track/PlayerContext";
import { FaHeart, FaPause, FaPlay, FaRegHeart, FaSearch } from "react-icons/fa";
import { normalizeArabic } from "../Listen/Functions";
import "./radio.css";

export default function Radio() {
  const [radios, setRadios] = useState([]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const player = usePlayer();
  useEffect(() => {
    let active = true;
    setError("");
    getRadios().then((items) => active && setRadios(items.filter((item) => !item.name.includes("ترجمة")).map((item) => ({ ...item, src: item.url, img: "/img/radio.png", writer: "إذاعة قرآن دولية", isLive: true, country: "دولي", category: /تفسير|سيرة|حديث|فتاوى|أذكار|قصص/.test(item.name) ? "علوم القرآن" : "تلاوات" }))))
      .catch(() => active && setError("تعذر تحميل محطات الراديو. تحقق من اتصالك ثم أعد المحاولة."));
    return () => { active = false; };
  }, [retry]);
  const allRadios = useMemo(() => [CAIRO_RADIO, ...radios.filter((item) => item.id !== CAIRO_RADIO.id)], [radios]);
  const recentRadios = useMemo(() => { try { return JSON.parse(localStorage.getItem("quran:recent-radios")) || []; } catch { return []; } }, [player.track]);
  const visibleRadios = useMemo(() => allRadios.filter((radio) => {
    const matchesQuery = normalizeArabic(radio.name).includes(normalizeArabic(query.trim()));
    const matchesCategory = category === "الكل" || radio.category === category || radio.country === category;
    const matchesFavorite = !favoritesOnly || player.favorites.some((item) => item.id === radio.id);
    return matchesQuery && matchesCategory && matchesFavorite;
  }), [allRadios, category, favoritesOnly, player.favorites, query]);
  const play = (radio) => player.track?.id === radio.id ? player.toggle() : player.playTrack(radio);
  const isPlaying = (radio) => player.track?.id === radio.id && player.playing;
  const isFavorite = (radio) => player.favorites.some((item) => item.id === radio.id);
  return <div className="radio"><SectionHeader title="إذاعات القرآن الكريم" />
    <section className="cairo-feature"><div><span className="eyebrow">البث الرئيسي • مباشر</span><h2>{CAIRO_RADIO.name}</h2><p>البث المصري الأصيل للتلاوات والبرامج الدينية على مدار الساعة.</p><button type="button" onClick={() => play(CAIRO_RADIO)}>{isPlaying(CAIRO_RADIO) ? <FaPause /> : <FaPlay />} {isPlaying(CAIRO_RADIO) ? "إيقاف مؤقت" : "استمع الآن"}</button></div><img src="/img/radio.png" alt="" /></section>
    <div className="radio-tools"><label><FaSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن إذاعة أو قارئ" /></label><div className="radio-filters">{["الكل", "مصر", "تلاوات", "علوم القرآن"].map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item} type="button">{item}</button>)}<button className={favoritesOnly ? "active" : ""} onClick={() => setFavoritesOnly(!favoritesOnly)} type="button"><FaHeart /> المفضلة</button></div></div>
    {recentRadios.length > 0 && <div className="recent-radios"><span>استمعت مؤخرًا</span>{recentRadios.slice(0, 4).map((radio) => <button type="button" key={radio.id} onClick={() => play(radio)}><FaPlay /> {radio.name}</button>)}</div>}
    {error ? <Status message={error} action={() => setRetry((value) => value + 1)} /> : !radios.length ? <div className="loading_section"><span className="loader_section" /></div> : <div className="content-audio">
      <div className="cards">{visibleRadios.map((radio) => <article key={radio.id} className={`card ${player.track?.id === radio.id ? "playing" : ""}`}><header><span className="live"><i /> مباشر</span><button className="favorite-radio" type="button" aria-label={isFavorite(radio) ? "إزالة من المفضلة" : "إضافة للمفضلة"} onClick={() => player.toggleFavorite(radio)}>{isFavorite(radio) ? <FaHeart /> : <FaRegHeart />}</button></header><div className="station-body"><div><small>{radio.country} • {radio.category}</small><h2>{radio.name}</h2></div><button className="play-radio" onClick={() => play(radio)} type="button" aria-label={`تشغيل ${radio.name}`}>{isPlaying(radio) ? <FaPause /> : <FaPlay />}</button></div></article>)}</div>
      {!visibleRadios.length && <Status message="لا توجد إذاعات مطابقة. غيّر البحث أو التصنيف." />}
    </div>}
  </div>;
}
