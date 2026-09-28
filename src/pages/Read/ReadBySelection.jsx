import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaBookmark, FaBookOpen, FaCheck, FaCopy, FaEllipsisH, FaFont, FaHeadphones, FaPause, FaPlay, FaRegBookmark, FaSearch, FaShareAlt, FaSlidersH } from "react-icons/fa";
import SectionHeader from "../../Component/Section_header/Section_header";
import Breadcrumb from "../../Component/Breadcrumb/Breadcrumb";
import PageSkeleton from "../../Component/Skeleton/PageSkeleton";
import Status from "../../Component/Status/Status";
import { usePlayer } from "../../Component/Audio_track/PlayerContext";
import { getJuz, getSurah, getSurahs } from "../../services/api";
import { normalizeArabic } from "../Listen/Functions";
import { displayAyahText, nextSequenceIndex } from "./readingUtils";
import "./read.css";

const readBookmarks = () => { try { return JSON.parse(localStorage.getItem("quran:bookmarks")) || []; } catch { return []; } };
const JUZ_NUMBERS = Array.from({ length: 30 }, (_, index) => index + 1);

export default function ReadBySelection() {
  const { surahNumber, ayahNumber, juzNumber } = useParams();
  const isJuzMode = Boolean(juzNumber);
  const selectedSurahNumber = surahNumber || "1";
  const selectionKey = isJuzMode ? `juz-${juzNumber}` : `surah-${selectedSurahNumber}`;
  const navigate = useNavigate();
  const player = usePlayer();
  const [reading, setReading] = useState(null);
  const [loadedSelectionKey, setLoadedSelectionKey] = useState("");
  const [surahs, setSurahs] = useState([]);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  const [query, setQuery] = useState("");
  const [activeTools, setActiveTools] = useState(null);
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("quran:font-size") || 34));
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem("quran:line-height-v2") || 2.05));
  const [mode, setMode] = useState(() => localStorage.getItem("quran:reading-mode") || "continuous");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  const showNotice = useCallback((message) => {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2200);
  }, []);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  useEffect(() => {
    document.body.classList.add("reader-page-active");
    return () => document.body.classList.remove("reader-page-active");
  }, []);

  useEffect(() => {
    let active = true;
    setReading(null);
    setLoadedSelectionKey("");
    setError("");
    setQuery("");
    const request = isJuzMode ? getJuz(juzNumber) : getSurah(selectedSurahNumber);
    request.then((data) => {
      if (!active) return;
      setReading(data);
      setLoadedSelectionKey(selectionKey);
    }).catch(() => active && setError(`تعذر تحميل ${isJuzMode ? "الجزء" : "السورة"}. تحقق من اتصالك ثم حاول مجددًا.`));
    return () => { active = false; };
  }, [isJuzMode, juzNumber, requestKey, selectedSurahNumber, selectionKey]);

  useEffect(() => {
    let active = true;
    getSurahs().then((items) => active && setSurahs(items)).catch(() => {});
    return () => { active = false; };
  }, []);

  const readingReady = Boolean(reading && loadedSelectionKey === selectionKey);
  const ayahs = useMemo(() => readingReady ? reading.ayahs || [] : [], [reading, readingReady]);
  const surahForAyah = useCallback((ayah) => isJuzMode ? ayah.surah : reading, [isJuzMode, reading]);
  const readingKey = isJuzMode ? `juz-${juzNumber}` : `surah-${reading?.number}`;

  useEffect(() => {
    if (!reading) return;
    if (ayahNumber && !isJuzMode) {
      const requested = ayahs.find((ayah) => ayah.numberInSurah === Number(ayahNumber));
      if (requested) document.getElementById(`ayah-${requested.number}`)?.scrollIntoView({ block: "center" });
    } else document.querySelector("main")?.scrollTo({ top: 0, behavior: "auto" });

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const globalAyahNumber = Number(visible.target.dataset.ayah);
      const currentAyah = ayahs.find((ayah) => ayah.number === globalAyahNumber);
      if (!currentAyah) return;
      const currentSurah = surahForAyah(currentAyah);
      localStorage.setItem("quran:last-read", JSON.stringify({ surahNumber: currentSurah.number, surahName: currentSurah.name, ayahNumber: currentAyah.numberInSurah }));
      if (isJuzMode) localStorage.setItem("quran:last-juz", String(juzNumber));
    }, { root: document.querySelector("main"), threshold: [.55] });
    document.querySelectorAll(".ayah-card").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [ayahNumber, ayahs, isJuzMode, juzNumber, reading, surahForAyah]);

  useEffect(() => {
    if (!reading || !player.playing || player.track?.readingKey !== readingKey) return;
    document.getElementById(player.track.id)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [player.playing, player.track?.id, reading, readingKey]);

  const shownAyahs = useMemo(() => ayahs.filter((ayah) => normalizeArabic(ayah.text).includes(normalizeArabic(query))), [ayahs, query]);
  const juzNumbers = useMemo(() => [...new Set(ayahs.map((ayah) => ayah.juz))], [ayahs]);
  const includedSurahs = useMemo(() => isJuzMode ? [...new Map(ayahs.map((ayah) => [ayah.surah.number, ayah.surah])).values()] : [], [ayahs, isJuzMode]);
  const previousSurah = surahs.find((item) => item.number === reading?.number - 1);
  const nextSurah = surahs.find((item) => item.number === reading?.number + 1);
  const setPreference = (key, value, setter) => { setter(value); localStorage.setItem(key, String(value)); };
  const isBookmarked = (ayah) => bookmarks.some((item) => item.number === ayah.number);

  const toggleBookmark = (ayah) => {
    const surah = surahForAyah(ayah);
    const exists = isBookmarked(ayah);
    const next = exists ? bookmarks.filter((item) => item.number !== ayah.number) : [...bookmarks, { number: ayah.number, surahNumber: surah.number, surahName: surah.name, ayahNumber: ayah.numberInSurah, text: displayAyahText(ayah, surah), savedAt: Date.now() }];
    setBookmarks(next);
    localStorage.setItem("quran:bookmarks", JSON.stringify(next));
    showNotice(exists ? "تمت إزالة العلامة" : `تم حفظ علامة عند الآية ${ayah.numberInSurah}`);
  };

  const ayahTrack = (ayah, extra = {}) => {
    const surah = surahForAyah(ayah);
    return { id: `ayah-${ayah.number}`, name: `${surah.name} • الآية ${ayah.numberInSurah}`, writer: "مشاري راشد العفاسي", src: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`, img: "/img/logo.png", isLive: false, readingKey, surahNumber: surah.number, ayahNumber: ayah.numberInSurah, ...extra };
  };
  const playAyah = (ayah) => { const track = ayahTrack(ayah); player.track?.id === track.id ? player.toggle() : player.playTrack(track); };
  const playSequence = (index) => {
    const ayah = ayahs[index];
    if (!ayah) return false;
    player.playTrack(ayahTrack(ayah, { sequence: true, sequenceIndex: index, sequenceLength: ayahs.length, onEnded: () => {
      const nextIndex = nextSequenceIndex(index, ayahs.length);
      return nextIndex === null ? false : playSequence(nextIndex);
    } }));
    return true;
  };
  const sequenceActive = player.track?.sequence && player.track?.readingKey === readingKey;
  const playFullReading = () => sequenceActive && player.status !== "ended" ? player.toggle() : playSequence(0);
  const changeSurah = (number) => {
    if (sequenceActive) player.close();
    navigate(`/read/${number}`);
  };
  const changeJuz = (number) => {
    if (sequenceActive) player.close();
    navigate(`/read/juz/${number}`);
  };
  const copyAyah = async (ayah) => {
    const surah = surahForAyah(ayah);
    try {
      await navigator.clipboard.writeText(`${displayAyahText(ayah, surah)} — ${surah.name} (${ayah.numberInSurah})`);
      showNotice(`تم نسخ الآية ${ayah.numberInSurah}`);
    } catch {
      showNotice("تعذّر النسخ؛ حدّد نص الآية وانسخه يدويًا");
    }
  };
  const shareAyah = async (ayah) => {
    const surah = surahForAyah(ayah);
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
  if (!readingReady) return <PageSkeleton variant="reader" label={`نُحضّر صفحة ${isJuzMode ? "الجزء" : "السورة"} للقراءة`} />;

  const title = isJuzMode ? `الجزء ${Number(juzNumber).toLocaleString("ar-EG")}` : reading.name;
  const totalAyahs = ayahs.length;
  const currentSequencePosition = sequenceActive ? (player.track.sequenceIndex || 0) + 1 : 0;
  const includedSurahsLabel = includedSurahs.length === 1 ? "سورة واحدة" : includedSurahs.length === 2 ? "سورتان" : `${includedSurahs.length.toLocaleString("ar-EG")} سور`;

  return <section className={`reader-page mode-${mode}`}>
    {notice && <div className="reader-toast" role="status" aria-live="polite"><FaCheck /> {notice}</div>}
    <Breadcrumb items={[{ label: "القراءة", to: "/read" }, { label: title }]} />
    <div className="reader-title">
      <div className="reader-heading"><span className="reader-kicker"><FaBookOpen /> المصحف الشريف</span><SectionHeader title={title} /><p>قراءة هادئة، وضبط يناسب عينيك، وتلاوة تتابع موضع الآية تلقائيًا.</p></div>
      <div className="reader-selection-panel">
        <div className="reader-selection-copy"><strong>انتقل مباشرة</strong><span>اختر السورة أو الجزء الذي تريد قراءته</span></div>
        <div className="reader-selectors">
        <div className="surah-switcher"><label htmlFor="surah-select">القراءة بسورة</label><select id="surah-select" value={isJuzMode ? "" : selectedSurahNumber} onChange={(event) => changeSurah(event.target.value)}><option value="" disabled>اختر سورة</option>{surahs.map((item) => <option value={item.number} key={item.number}>{item.number}. {item.name.replace("سُورَةُ", "")}</option>)}</select></div>
        <div className="surah-switcher"><label htmlFor="juz-select">القراءة بجزء</label><select id="juz-select" value={isJuzMode ? juzNumber : ""} onChange={(event) => changeJuz(event.target.value)}><option value="" disabled>اختر جزءًا</option>{JUZ_NUMBERS.map((number) => <option value={number} key={number}>الجزء {number.toLocaleString("ar-EG")}</option>)}</select></div>
        </div>
      </div>
      <div className="surah-meta">{isJuzMode ? <><span>{includedSurahsLabel}</span><span>{totalAyahs.toLocaleString("ar-EG")} آية</span></> : <><span>{reading.revelationType === "Meccan" ? "مكية" : "مدنية"}</span><span>{reading.numberOfAyahs} آية</span><span>{juzNumbers.length === 1 ? `الجزء ${juzNumbers[0]}` : `${juzNumbers.length} أجزاء`}</span></>}</div>
    </div>
    <div className="reader-toolbar" aria-label="إعدادات القراءة">
      <label className="reader-search"><FaSearch /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`ابحث في ${isJuzMode ? "الجزء" : "السورة"}`} aria-label={`البحث داخل ${isJuzMode ? "الجزء" : "السورة"}`} /><span className="reader-result-count">{shownAyahs.length.toLocaleString("ar-EG")}</span></label>
      <button className={`reader-settings-toggle ${settingsOpen ? "active" : ""}`} type="button" aria-expanded={settingsOpen} aria-controls="reader-display-settings" onClick={() => setSettingsOpen((current) => !current)}><FaSlidersH /><span>ضبط العرض</span></button>
      <div className={`reader-toolbar-controls ${settingsOpen ? "is-open" : ""}`} id="reader-display-settings">
        <label className="reader-adjust"><FaFont /><span>حجم الخط</span><input type="range" min="24" max="48" value={fontSize} aria-label="حجم خط المصحف" onChange={(event) => setPreference("quran:font-size", Number(event.target.value), setFontSize)} /><strong>{fontSize.toLocaleString("ar-EG")}</strong></label>
        <label className="reader-adjust"><span>تباعد السطور</span><input type="range" min="1.75" max="2.5" step=".05" value={lineHeight} aria-label="تباعد سطور المصحف" onChange={(event) => setPreference("quran:line-height-v2", Number(event.target.value), setLineHeight)} /><strong>{lineHeight.toLocaleString("ar-EG")}</strong></label>
        <div className="reader-mode-switch" role="group" aria-label="طريقة عرض الآيات"><button className={mode === "continuous" ? "active" : ""} aria-pressed={mode === "continuous"} type="button" onClick={() => setPreference("quran:reading-mode", "continuous", setMode)}>مصحف متصل</button><button className={mode === "focus" ? "active" : ""} aria-pressed={mode === "focus"} type="button" onClick={() => setPreference("quran:reading-mode", "focus", setMode)}>آية بآية</button></div>
      </div>
      <button className={`surah-play ${sequenceActive ? "active" : ""}`} type="button" onClick={playFullReading} aria-label={sequenceActive && player.playing ? "إيقاف التلاوة" : `تشغيل ${isJuzMode ? "الجزء" : "السورة"} كاملًا`}>{sequenceActive && player.playing ? <FaPause /> : <FaHeadphones />}<span className="surah-play-desktop">{sequenceActive && player.playing ? "إيقاف التلاوة" : `تشغيل ${isJuzMode ? "الجزء" : "السورة"} كاملًا`}</span><span className="surah-play-mobile">{sequenceActive && player.playing ? "إيقاف" : "تشغيل كامل"}</span></button>
    </div>
    {sequenceActive && <div className="reading-now" aria-live="polite"><span><i /> يُتلى الآن</span><strong>الآية {currentSequencePosition.toLocaleString("ar-EG")} من {totalAyahs.toLocaleString("ar-EG")}</strong><div><i style={{ width: `${(currentSequencePosition / totalAyahs) * 100}%` }} /></div></div>}
    <div className="juz-navigator" role="navigation" aria-label={isJuzMode ? "السور داخل الجزء" : "أجزاء السورة"}><span>{isJuzMode ? "السور داخل الجزء" : "الأجزاء داخل السورة"}</span><div>{isJuzMode ? includedSurahs.map((surah) => <button type="button" key={surah.number} onClick={() => document.getElementById(`surah-${surah.number}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>{surah.name}</button>) : juzNumbers.map((juz) => <button type="button" key={juz} onClick={() => document.getElementById(`juz-${juz}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>الجزء {juz.toLocaleString("ar-EG")}</button>)}</div></div>
    {!isJuzMode && reading.number !== 1 && reading.number !== 9 && <p className="basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>}
    <article className="ayahs" dir="rtl" lang="ar" aria-label={`نص ${title}`} style={{ "--reader-font-size": `${fontSize}px`, "--reader-line-height": lineHeight }}>
      {shownAyahs.map((ayah, index) => {
        const surah = surahForAyah(ayah);
        const startsSurah = isJuzMode && (index === 0 || shownAyahs[index - 1].surah.number !== surah.number);
        return <Fragment key={ayah.number}>
          {startsSurah && <><div className="surah-divider" id={`surah-${surah.number}`}><span>{surah.name}</span><small>{surah.revelationType === "Meccan" ? "مكية" : "مدنية"} • {surah.numberOfAyahs.toLocaleString("ar-EG")} آية</small></div>{ayah.numberInSurah === 1 && surah.number !== 1 && surah.number !== 9 && <p className="basmala basmala-inline">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>}</>}
          {!isJuzMode && (index === 0 || shownAyahs[index - 1].juz !== ayah.juz) && <div className="juz-divider" id={`juz-${ayah.juz}`}><span>الجزء {ayah.juz.toLocaleString("ar-EG")}</span><small>صفحة {ayah.page.toLocaleString("ar-EG")}</small></div>}
          <section
            className={`ayah-card ${player.playing && player.track?.id === `ayah-${ayah.number}` ? "currently-playing" : ""}`}
            dir="rtl"
            id={`ayah-${ayah.number}`}
            data-ayah={ayah.number}
            aria-current={player.playing && player.track?.id === `ayah-${ayah.number}` ? "true" : undefined}
            onClick={(event) => {
              if (mode !== "continuous" || event.target.closest("button")) return;
              setActiveTools((current) => current === ayah.number ? null : ayah.number);
            }}
          >
            <p dir="rtl"><bdi className="ayah-text" dir="rtl">{displayAyahText(ayah, surah)}</bdi> <b dir="ltr" aria-label={`الآية ${ayah.numberInSurah}`}>{ayah.numberInSurah.toLocaleString("ar-EG")}</b></p>
            <button className="ayah-tools-trigger" type="button" aria-label={`خيارات الآية ${ayah.numberInSurah}`} aria-expanded={activeTools === ayah.number} onClick={() => setActiveTools((current) => current === ayah.number ? null : ayah.number)}><FaEllipsisH /></button>
            <div className={`ayah-actions ${activeTools === ayah.number ? "open" : ""}`} aria-label={`أدوات الآية ${ayah.numberInSurah}`}><button className="ayah-action-play" type="button" onClick={() => playAyah(ayah)} aria-label="تشغيل الآية">{player.track?.id === `ayah-${ayah.number}` && player.playing ? <FaPause /> : <FaPlay />}<span>{player.track?.id === `ayah-${ayah.number}` && player.playing ? "إيقاف" : "استماع"}</span></button><button type="button" onClick={() => toggleBookmark(ayah)} aria-label="حفظ علامة">{isBookmarked(ayah) ? <FaBookmark /> : <FaRegBookmark />}<span>{isBookmarked(ayah) ? "محفوظة" : "حفظ"}</span></button><button type="button" onClick={() => copyAyah(ayah)} aria-label="نسخ الآية"><FaCopy /><span>نسخ</span></button><button type="button" onClick={() => shareAyah(ayah)} aria-label="مشاركة الآية"><FaShareAlt /><span>مشاركة</span></button></div>
          </section>
        </Fragment>;
      })}
      {!shownAyahs.length && <Status message={`لم يُعثر على النص داخل ${isJuzMode ? "هذا الجزء" : "هذه السورة"}.`} />}
    </article>
    <div className="surah-pagination" role="navigation" aria-label={`التنقل بين ${isJuzMode ? "الأجزاء" : "السور"}`}>
      {isJuzMode ? (Number(juzNumber) > 1 ? <button type="button" onClick={() => changeJuz(Number(juzNumber) - 1)}><FaArrowRight /><span><small>الجزء السابق</small><strong>الجزء {(Number(juzNumber) - 1).toLocaleString("ar-EG")}</strong></span></button> : <span />) : (previousSurah ? <button type="button" onClick={() => changeSurah(previousSurah.number)}><FaArrowRight /><span><small>السورة السابقة</small><strong>{previousSurah.name}</strong></span></button> : <span />)}
      <div><span>{isJuzMode ? `الجزء ${Number(juzNumber).toLocaleString("ar-EG")} من ٣٠` : `السورة ${reading.number.toLocaleString("ar-EG")} من ١١٤`}</span><strong>{title}</strong></div>
      {isJuzMode ? (Number(juzNumber) < 30 ? <button type="button" onClick={() => changeJuz(Number(juzNumber) + 1)}><span><small>الجزء التالي</small><strong>الجزء {(Number(juzNumber) + 1).toLocaleString("ar-EG")}</strong></span><FaArrowLeft /></button> : <span />) : (nextSurah ? <button type="button" onClick={() => changeSurah(nextSurah.number)}><span><small>السورة التالية</small><strong>{nextSurah.name}</strong></span><FaArrowLeft /></button> : <span />)}
    </div>
  </section>;
}
