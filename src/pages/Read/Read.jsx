import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaBookmark, FaBookOpen, FaCheck, FaCopy, FaEllipsisH, FaFont, FaHeadphones, FaPause, FaPlay, FaRegBookmark, FaSearch, FaShareAlt } from "react-icons/fa";
import SectionHeader from "../../Component/Section_header/Section_header";
import Status from "../../Component/Status/Status";
import { usePlayer } from "../../Component/Audio_track/PlayerContext";
import { getSurah, getSurahs } from "../../services/api";
import { normalizeArabic } from "../Listen/Functions";
import "./read.css";

const readBookmarks = () => { try { return JSON.parse(localStorage.getItem("quran:bookmarks")) || []; } catch { return []; } };
const BASMALA_PREFIX = /^\s*ب\p{M}*س\p{M}*م\p{M}*\s+[ٱا]\p{M}*ل\p{M}*ل\p{M}*ه\p{M}*\s+[ٱا]\p{M}*ل\p{M}*ر\p{M}*ح\p{M}*م\p{M}*ن\p{M}*\s+[ٱا]\p{M}*ل\p{M}*ر\p{M}*ح\p{M}*ي\p{M}*م\p{M}*\s*/u;
const displayAyahText = (ayah, surah) => (
  ayah.numberInSurah === 1 && surah.number !== 1 && surah.number !== 9
    ? ayah.text.replace(BASMALA_PREFIX, "").trim()
    : ayah.text
);

export default function Read() {
  const { surahNumber = "1", ayahNumber } = useParams();
  const navigate = useNavigate();
  const player = usePlayer();
  const [surah, setSurah] = useState(null);
  const [surahs, setSurahs] = useState([]);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  const [query, setQuery] = useState("");
  const [activeTools, setActiveTools] = useState(null);
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("quran:font-size") || 34));
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem("quran:line-height-v2") || 2.05));
  const [mode, setMode] = useState(() => localStorage.getItem("quran:reading-mode") || "continuous");
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  const showNotice = useCallback((message) => {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2200);
  }, []);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  useEffect(() => {
    let active = true;
    setSurah(null); setError("");
    getSurah(surahNumber).then((data) => active && setSurah(data)).catch(() => active && setError("تعذر تحميل السورة. تحقق من اتصالك ثم حاول مجددًا."));
    return () => { active = false; };
  }, [surahNumber, requestKey]);

  useEffect(() => {
    let active = true;
    getSurahs().then((items) => active && setSurahs(items)).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!surah) return;
    if (ayahNumber) document.getElementById(`ayah-${ayahNumber}`)?.scrollIntoView({ block: "center" });
    else document.querySelector("main")?.scrollTo({ top: 0, behavior: "auto" });
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const current = Number(visible.target.dataset.ayah);
      localStorage.setItem("quran:last-read", JSON.stringify({ surahNumber: surah.number, surahName: surah.name, ayahNumber: current }));
    }, { root: document.querySelector("main"), threshold: [.55] });
    document.querySelectorAll(".ayah-card").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ayahNumber, surah]);

  useEffect(() => {
    if (!surah || !player.playing || player.track?.surahNumber !== surah.number) return;
    document.getElementById(`ayah-${player.track.ayahNumber}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [player.playing, player.track?.id, surah]);

  const shownAyahs = useMemo(() => !surah ? [] : surah.ayahs.filter((ayah) => normalizeArabic(ayah.text).includes(normalizeArabic(query))), [query, surah]);
  const juzNumbers = useMemo(() => !surah ? [] : [...new Set(surah.ayahs.map((ayah) => ayah.juz))], [surah]);
  const previousSurah = surahs.find((item) => item.number === surah?.number - 1);
  const nextSurah = surahs.find((item) => item.number === surah?.number + 1);
  const setPreference = (key, value, setter) => { setter(value); localStorage.setItem(key, String(value)); };
  const isBookmarked = (ayah) => bookmarks.some((item) => item.number === ayah.number);
  const toggleBookmark = (ayah) => {
    const exists = isBookmarked(ayah);
    const next = exists ? bookmarks.filter((item) => item.number !== ayah.number) : [...bookmarks, { number: ayah.number, surahNumber: surah.number, surahName: surah.name, ayahNumber: ayah.numberInSurah, text: displayAyahText(ayah, surah) }];
    setBookmarks(next); localStorage.setItem("quran:bookmarks", JSON.stringify(next));
    showNotice(exists ? "تمت إزالة العلامة" : `تم حفظ علامة عند الآية ${ayah.numberInSurah}`);
  };
  const ayahTrack = (ayah, extra = {}) => ({ id: `ayah-${ayah.number}`, name: `${surah.name} • الآية ${ayah.numberInSurah}`, writer: "مشاري راشد العفاسي", src: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`, img: "/img/logo.png", isLive: false, surahNumber: surah.number, ayahNumber: ayah.numberInSurah, ...extra });
  const playAyah = (ayah) => { const track = ayahTrack(ayah); player.track?.id === track.id ? player.toggle() : player.playTrack(track); };
  const playSequence = (index) => {
    const ayah = surah.ayahs[index];
    if (!ayah) return false;
    player.playTrack(ayahTrack(ayah, { sequence: true, sequenceIndex: index, sequenceLength: surah.ayahs.length, onEnded: () => playSequence(index + 1) }));
    return true;
  };
  const sequenceActive = player.track?.sequence && player.track?.surahNumber === surah?.number;
  const playFullSurah = () => sequenceActive && player.status !== "ended" ? player.toggle() : playSequence(0);
  const changeSurah = (number) => {
    if (sequenceActive) player.close();
    navigate(`/read/${number}`);
  };
  const copyAyah = async (ayah) => {
    try {
      await navigator.clipboard.writeText(`${displayAyahText(ayah, surah)} — ${surah.name} (${ayah.numberInSurah})`);
      showNotice(`تم نسخ الآية ${ayah.numberInSurah}`);
    } catch {
      showNotice("تعذّر النسخ؛ حدّد نص الآية وانسخه يدويًا");
    }
  };
  const shareAyah = async (ayah) => {
    const text = `${displayAyahText(ayah, surah)} — ${surah.name} (${ayah.numberInSurah})`;
    if (!navigator.share) return copyAyah(ayah);
    try {
      await navigator.share({ title: surah.name, text, url: `${window.location.origin}/read/${surah.number}/${ayah.numberInSurah}` });
      showNotice("تمت مشاركة الآية");
    } catch {
      // Cancelling the native share sheet does not need an error message.
    }
  };

  if (error) return <Status message={error} action={() => setRequestKey((key) => key + 1)} />;
  if (!surah) return <div className="loading_section"><span className="loader_section" /></div>;

  return <section className={`reader-page mode-${mode}`}>
    {notice && <div className="reader-toast" role="status" aria-live="polite"><FaCheck /> {notice}</div>}
    <div className="reader-title"><div><span className="reader-kicker"><FaBookOpen /> المصحف الشريف</span><SectionHeader title={surah.name} /></div><div className="surah-switcher"><label htmlFor="surah-select">انتقل إلى سورة</label><select id="surah-select" value={surahNumber} onChange={(event) => changeSurah(event.target.value)}>{surahs.map((item) => <option value={item.number} key={item.number}>{item.number}. {item.name.replace("سُورَةُ", "")}</option>)}</select></div><div className="surah-meta"><span>{surah.revelationType === "Meccan" ? "مكية" : "مدنية"}</span><span>{surah.numberOfAyahs} آية</span><span>{juzNumbers.length === 1 ? `الجزء ${juzNumbers[0]}` : `${juzNumbers.length} أجزاء`}</span></div></div>
    <div className="reader-toolbar" aria-label="إعدادات القراءة">
      <label className="reader-search"><FaSearch /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في السورة" aria-label="البحث داخل السورة" /><span className="reader-result-count">{shownAyahs.length}</span></label>
      <label><FaFont /> الحجم <input type="range" min="24" max="48" value={fontSize} onChange={(event) => setPreference("quran:font-size", Number(event.target.value), setFontSize)} /></label>
      <label>التباعد <input type="range" min="1.75" max="2.5" step=".05" value={lineHeight} onChange={(event) => setPreference("quran:line-height-v2", Number(event.target.value), setLineHeight)} /></label>
      <button className={mode === "continuous" ? "active" : ""} type="button" onClick={() => setPreference("quran:reading-mode", "continuous", setMode)}>مصحف</button><button className={mode === "focus" ? "active" : ""} type="button" onClick={() => setPreference("quran:reading-mode", "focus", setMode)}>حفظ ومراجعة</button><button className={`surah-play ${sequenceActive ? "active" : ""}`} type="button" onClick={playFullSurah} aria-label={sequenceActive && player.playing ? "إيقاف تلاوة السورة" : "تشغيل السورة كاملة"}>{sequenceActive && player.playing ? <FaPause /> : <FaHeadphones />}<span className="surah-play-desktop">{sequenceActive && player.playing ? "إيقاف التلاوة" : "تشغيل السورة كاملة"}</span><span className="surah-play-mobile">{sequenceActive && player.playing ? "إيقاف" : "تشغيل كامل"}</span></button>
    </div>
    {sequenceActive && <div className="reading-now" aria-live="polite"><span><i /> يُتلى الآن</span><strong>الآية {player.track.ayahNumber} من {surah.numberOfAyahs}</strong><div><i style={{ width: `${(player.track.ayahNumber / surah.numberOfAyahs) * 100}%` }} /></div></div>}
    <div className="juz-navigator" role="navigation" aria-label="أجزاء السورة"><span>الأجزاء داخل السورة</span><div>{juzNumbers.map((juz) => <button type="button" key={juz} onClick={() => document.getElementById(`juz-${juz}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>الجزء {juz.toLocaleString("ar-EG")}</button>)}</div></div>
    {surah.number !== 1 && surah.number !== 9 && <p className="basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>}
    <article className="ayahs" aria-label={`نص ${surah.name}`} style={{ "--reader-font-size": `${fontSize}px`, "--reader-line-height": lineHeight }}>
      {shownAyahs.map((ayah, index) => <Fragment key={ayah.number}>
        {(index === 0 || shownAyahs[index - 1].juz !== ayah.juz) && <div className="juz-divider" id={`juz-${ayah.juz}`}><span>الجزء {ayah.juz.toLocaleString("ar-EG")}</span><small>صفحة {ayah.page.toLocaleString("ar-EG")}</small></div>}
        <section className={`ayah-card ${player.playing && player.track?.surahNumber === surah.number && player.track?.ayahNumber === ayah.numberInSurah ? "currently-playing" : ""}`} id={`ayah-${ayah.numberInSurah}`} data-ayah={ayah.numberInSurah}>
          <p><span className="ayah-text">{displayAyahText(ayah, surah)}</span> <b aria-label={`الآية ${ayah.numberInSurah}`}>{ayah.numberInSurah.toLocaleString("ar-EG")}</b></p>
          <button className="ayah-tools-trigger" type="button" aria-label={`خيارات الآية ${ayah.numberInSurah}`} aria-expanded={activeTools === ayah.number} onClick={() => setActiveTools((current) => current === ayah.number ? null : ayah.number)}><FaEllipsisH /></button>
          <div className={`ayah-actions ${activeTools === ayah.number ? "open" : ""}`}><button type="button" onClick={() => playAyah(ayah)} aria-label="تشغيل الآية">{player.track?.id === `ayah-${ayah.number}` && player.playing ? <FaPause /> : <FaPlay />}</button><button type="button" onClick={() => toggleBookmark(ayah)} aria-label="حفظ علامة">{isBookmarked(ayah) ? <FaBookmark /> : <FaRegBookmark />}</button><button type="button" onClick={() => copyAyah(ayah)} aria-label="نسخ الآية"><FaCopy /></button><button type="button" onClick={() => shareAyah(ayah)} aria-label="مشاركة الآية"><FaShareAlt /></button></div>
        </section>
      </Fragment>)}
      {!shownAyahs.length && <Status message="لم يُعثر على النص داخل هذه السورة." />}
    </article>
    <div className="surah-pagination" role="navigation" aria-label="التنقل بين السور">
      {previousSurah ? <button type="button" onClick={() => changeSurah(previousSurah.number)}><FaArrowRight /><span><small>السورة السابقة</small><strong>{previousSurah.name}</strong></span></button> : <span />}
      <div><span>السورة {surah.number.toLocaleString("ar-EG")} من ١١٤</span><strong>{surah.name}</strong></div>
      {nextSurah ? <button type="button" onClick={() => changeSurah(nextSurah.number)}><span><small>السورة التالية</small><strong>{nextSurah.name}</strong></span><FaArrowLeft /></button> : <span />}
    </div>
  </section>;
}
