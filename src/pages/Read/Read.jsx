import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FaBookmark, FaCopy, FaFont, FaPause, FaPlay, FaRegBookmark, FaSearch, FaShareAlt } from "react-icons/fa";
import SectionHeader from "../../Component/Section_header/Section_header";
import Status from "../../Component/Status/Status";
import { usePlayer } from "../../Component/Audio_track/PlayerContext";
import { getSurah } from "../../services/api";
import { normalizeArabic } from "../Listen/Functions";
import "./read.css";

const readBookmarks = () => { try { return JSON.parse(localStorage.getItem("quran:bookmarks")) || []; } catch { return []; } };

export default function Read() {
  const { surahNumber = "1", ayahNumber } = useParams();
  const player = usePlayer();
  const [surah, setSurah] = useState(null);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  const [query, setQuery] = useState("");
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("quran:font-size") || 34));
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem("quran:line-height") || 2.2));
  const [mode, setMode] = useState(() => localStorage.getItem("quran:reading-mode") || "continuous");

  useEffect(() => {
    let active = true;
    setSurah(null); setError("");
    getSurah(surahNumber).then((data) => active && setSurah(data)).catch(() => active && setError("تعذر تحميل السورة. تحقق من اتصالك ثم حاول مجددًا."));
    return () => { active = false; };
  }, [surahNumber, requestKey]);

  useEffect(() => {
    if (!surah) return;
    const target = document.getElementById(`ayah-${ayahNumber || 1}`);
    target?.scrollIntoView({ block: "center" });
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const current = Number(visible.target.dataset.ayah);
      localStorage.setItem("quran:last-read", JSON.stringify({ surahNumber: surah.number, surahName: surah.name, ayahNumber: current }));
    }, { root: document.querySelector("main"), threshold: [.55] });
    document.querySelectorAll(".ayah-card").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ayahNumber, surah]);

  const shownAyahs = useMemo(() => !surah ? [] : surah.ayahs.filter((ayah) => normalizeArabic(ayah.text).includes(normalizeArabic(query))), [query, surah]);
  const setPreference = (key, value, setter) => { setter(value); localStorage.setItem(key, String(value)); };
  const isBookmarked = (ayah) => bookmarks.some((item) => item.number === ayah.number);
  const toggleBookmark = (ayah) => {
    const exists = isBookmarked(ayah);
    const next = exists ? bookmarks.filter((item) => item.number !== ayah.number) : [...bookmarks, { number: ayah.number, surahNumber: surah.number, surahName: surah.name, ayahNumber: ayah.numberInSurah, text: ayah.text }];
    setBookmarks(next); localStorage.setItem("quran:bookmarks", JSON.stringify(next));
  };
  const ayahTrack = (ayah) => ({ id: `ayah-${ayah.number}`, name: `${surah.name} • الآية ${ayah.numberInSurah}`, writer: "مشاري راشد العفاسي", src: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`, img: "/img/logo.png", isLive: false });
  const playAyah = (ayah) => { const track = ayahTrack(ayah); player.track?.id === track.id ? player.toggle() : player.playTrack(track); };
  const copyAyah = (ayah) => navigator.clipboard.writeText(`${ayah.text} — ${surah.name} (${ayah.numberInSurah})`);
  const shareAyah = (ayah) => { const text = `${ayah.text} — ${surah.name} (${ayah.numberInSurah})`; if (navigator.share) navigator.share({ title: surah.name, text, url: `${location.origin}/read/${surah.number}/${ayah.numberInSurah}` }).catch(() => {}); else copyAyah(ayah); };

  if (error) return <Status message={error} action={() => setRequestKey((key) => key + 1)} />;
  if (!surah) return <div className="loading_section"><span className="loader_section" /></div>;

  return <section className={`reader-page mode-${mode}`}>
    <div className="reader-title"><SectionHeader title={surah.name} /><div className="surah-meta"><span>{surah.revelationType === "Meccan" ? "مكية" : "مدنية"}</span><span>{surah.numberOfAyahs} آية</span></div></div>
    <div className="reader-toolbar" aria-label="إعدادات القراءة">
      <label className="reader-search"><FaSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في السورة" /></label>
      <label><FaFont /> الحجم <input type="range" min="24" max="48" value={fontSize} onChange={(event) => setPreference("quran:font-size", Number(event.target.value), setFontSize)} /></label>
      <label>التباعد <input type="range" min="1.7" max="3" step=".1" value={lineHeight} onChange={(event) => setPreference("quran:line-height", Number(event.target.value), setLineHeight)} /></label>
      <button className={mode === "continuous" ? "active" : ""} type="button" onClick={() => setPreference("quran:reading-mode", "continuous", setMode)}>مصحف</button><button className={mode === "focus" ? "active" : ""} type="button" onClick={() => setPreference("quran:reading-mode", "focus", setMode)}>حفظ ومراجعة</button>
    </div>
    {surah.number !== 1 && surah.number !== 9 && <p className="basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>}
    <article className="ayahs" aria-label={`نص ${surah.name}`} style={{ "--reader-font-size": `${fontSize}px`, "--reader-line-height": lineHeight }}>
      {shownAyahs.map((ayah) => <section className="ayah-card" id={`ayah-${ayah.numberInSurah}`} data-ayah={ayah.numberInSurah} key={ayah.number}>
        <p><span className="ayah-text">{ayah.text}</span> <b aria-label={`الآية ${ayah.numberInSurah}`}>{ayah.numberInSurah.toLocaleString("ar-EG")}</b></p>
        <div className="ayah-actions"><button type="button" onClick={() => playAyah(ayah)} aria-label="تشغيل الآية">{player.track?.id === `ayah-${ayah.number}` && player.playing ? <FaPause /> : <FaPlay />}</button><button type="button" onClick={() => toggleBookmark(ayah)} aria-label="حفظ علامة">{isBookmarked(ayah) ? <FaBookmark /> : <FaRegBookmark />}</button><button type="button" onClick={() => copyAyah(ayah)} aria-label="نسخ الآية"><FaCopy /></button><button type="button" onClick={() => shareAyah(ayah)} aria-label="مشاركة الآية"><FaShareAlt /></button></div>
      </section>)}
      {!shownAyahs.length && <Status message="لم يُعثر على النص داخل هذه السورة." />}
    </article>
  </section>;
}
