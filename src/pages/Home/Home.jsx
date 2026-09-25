import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBookmark, FaBookOpen, FaCheck, FaCopy, FaHeadphones, FaHeart, FaPause, FaPlay, FaSearch, FaShareAlt, FaTimes } from "react-icons/fa";
import SectionHeader from "../../Component/Section_header/Section_header";
import { usePlayer } from "../../Component/Audio_track/PlayerContext";
import { CAIRO_RADIO, getRadios, getReciters, getSurah, getSurahs, toSurahAudio } from "../../services/api";
import { normalizeArabic } from "../Listen/Functions";
import "./home.css";

const readStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
const READER_PORTRAITS = [
  { match: "عبد الباسط", name: "الشيخ عبد الباسط عبد الصمد", image: "/img/عبد الباسط.jpg" },
  { match: "المنشاوي", name: "الشيخ محمد صديق المنشاوي", image: "/img/المنشاوي.jpg" },
  { match: "الحصري", name: "الشيخ محمود خليل الحصري", image: "/img/الحصري.jpg" },
  { match: "ماهر المعيقلي", name: "الشيخ ماهر بن حمد المعيقلي", image: "/img/ماهر المعيقلي.jpg" },
  { match: "سعود الشريم", name: "الشيخ سعود بن إبراهيم الشريم", image: "/img/سعود الشريم.jpg" },
  { match: "محمد جبريل", name: "الشيخ محمد السيد جبريل", image: "/img/محمد جبريل.jpg" },
  { match: "الطبلاوي", name: "الشيخ محمد محمود الطبلاوي", image: "/img/الطبلاوي.jpg" },
];

export default function Home() {
  const navigate = useNavigate();
  const player = usePlayer();
  const [surahs, setSurahs] = useState([]);
  const [radios, setRadios] = useState([]);
  const [reciters, setReciters] = useState([]);
  const [dailyAyah, setDailyAyah] = useState(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDailyNotice, setShowDailyNotice] = useState(false);
  const [noticeClosing, setNoticeClosing] = useState(false);
  const lastRead = readStorage("quran:last-read", { surahNumber: 1, surahName: "سُورَةُ ٱلْفَاتِحَةِ", ayahNumber: 1 });
  const bookmarks = readStorage("quran:bookmarks", []);

  useEffect(() => {
    let active = true;
    Promise.all([getSurahs(), getRadios(), getReciters(), getSurah(55)]).then(([surahData, radioData, reciterData, dailySurah]) => {
      if (!active) return;
      const featured = READER_PORTRAITS.map((portrait) => {
        const match = normalizeArabic(portrait.match).replace(/\s/g, "");
        const reader = reciterData.find((item) => normalizeArabic(item.name).replace(/\s/g, "").includes(match) && item.moshaf?.some((moshaf) => moshaf.surah_list.split(",").includes("1")));
        return reader ? { ...reader, displayName: portrait.name, portrait: portrait.image } : null;
      }).filter(Boolean).slice(0, 4);
      setSurahs(surahData); setRadios(radioData.slice(0, 4)); setReciters(featured);
      const index = Math.floor(Date.now() / 86400000) % dailySurah.ayahs.length;
      setDailyAyah({ ...dailySurah.ayahs[index], surah: dailySurah });
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!dailyAyah) return;
    const key = `quran:daily-ayah-shown:v2:${new Date().toISOString().slice(0, 10)}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "true");
    } catch { /* The notice can still be shown when session storage is unavailable. */ }
    setShowDailyNotice(true);
  }, [dailyAyah]);

  const filteredSurahs = useMemo(() => {
    const search = normalizeArabic(query);
    return surahs.filter((surah) => normalizeArabic(surah.name).includes(search)).slice(0, query ? 12 : 8);
  }, [query, surahs]);
  const khatmaProgress = Math.max(1, Math.round((Number(lastRead.surahNumber) / 114) * 100));
  const cairoPlaying = player.track?.id === CAIRO_RADIO.id && player.playing;

  const playRadio = (radio) => {
    const item = radio.id === CAIRO_RADIO.id ? CAIRO_RADIO : { ...radio, src: radio.url, img: "/img/radio.png", writer: "إذاعة قرآن مباشرة", isLive: true };
    player.track?.id === item.id ? player.toggle() : player.playTrack(item);
  };
  const playReader = (reader) => {
    const moshaf = reader.moshaf.find((item) => item.surah_list.split(",").includes("1"));
    player.playTrack({ id: `reader-${reader.id}`, name: "سورة الفاتحة", writer: reader.displayName || reader.name, src: toSurahAudio(moshaf.server, 1), img: reader.portrait, isLive: false });
  };
  const copyAyah = async () => { if (!dailyAyah) return; await navigator.clipboard.writeText(`${dailyAyah.text} — ${dailyAyah.surah.name} (${dailyAyah.numberInSurah})`); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  const shareAyah = () => { if (!dailyAyah) return; const text = `${dailyAyah.text} — ${dailyAyah.surah.name} (${dailyAyah.numberInSurah})`; if (navigator.share) navigator.share({ title: "آية اليوم", text }).catch(() => {}); else copyAyah(); };
  const closeDailyNotice = (afterClose) => {
    setNoticeClosing(true);
    window.setTimeout(() => { setShowDailyNotice(false); setNoticeClosing(false); afterClose?.(); }, 320);
  };

  return <div className="home-page">
    {showDailyNotice && dailyAyah && <div className={`daily-notice-backdrop ${noticeClosing ? "is-closing" : ""}`} role="presentation"><section className="daily-notice" role="dialog" aria-modal="true" aria-labelledby="daily-notice-title"><button className="notice-close" type="button" onClick={() => closeDailyNotice()} aria-label="إغلاق آية اليوم"><FaTimes /></button><div className="notice-intro"><span className="notice-mark">﴿</span><small>بداية مباركة ليومك</small></div><h2 id="daily-notice-title">آية اليوم</h2><blockquote>{dailyAyah.text}</blockquote><p>{dailyAyah.surah.name} • الآية {dailyAyah.numberInSurah}</p><div className="notice-actions"><button type="button" onClick={() => closeDailyNotice(() => navigate(`/read/${dailyAyah.surah.number}/${dailyAyah.numberInSurah}`))}><FaBookOpen /> اقرأ في المصحف</button><button type="button" onClick={copyAyah}>{copied ? <FaCheck /> : <FaCopy />} {copied ? "تم النسخ" : "نسخ الآية"}</button></div></section></div>}
    <section className="home-hero">
      <div className="hero-copy"><span className="hero-kicker">رفيقك اليومي مع كتاب الله</span><h1>اقرأ بقلبٍ حاضر،<br /><em>واستمع بطمأنينة.</em></h1><p>مصحف موثوق، تلاوات مختارة، وإذاعات القرآن في تجربة عربية هادئة تحفظ تقدمك على هذا الجهاز.</p><div className="hero-actions"><Link className="primary-action" to={`/read/${lastRead.surahNumber}/${lastRead.ayahNumber}`}><FaBookOpen /> ابدأ القراءة</Link><Link className="secondary-action" to="/listen"><FaHeadphones /> استمع الآن</Link></div></div>
      <div className="hero-verse" aria-label="آية افتتاحية"><span>﴿</span><p>أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</p><small>الرعد • ٢٨</small></div>
    </section>

    <section className="continue-strip"><div><span>استكمل من حيث توقفت</span><strong>{lastRead.surahName}</strong><small>الآية {lastRead.ayahNumber}</small></div><div className="continue-progress"><i style={{ width: `${khatmaProgress}%` }} /><span>{khatmaProgress}% من الختمة</span></div><button type="button" onClick={() => navigate(`/read/${lastRead.surahNumber}/${lastRead.ayahNumber}`)}>متابعة <FaArrowLeft /></button></section>

    <section className="home-section"><SectionHeader title="إذاعات القرآن الكريم" /><div className="home-radio-layout"><article className="home-cairo-radio"><div><span className="live-pill">LIVE • القاهرة</span><h2>{CAIRO_RADIO.name}</h2><p>التلاوات النادرة والبرامج الدينية من البث المصري المباشر.</p><button type="button" onClick={() => playRadio(CAIRO_RADIO)}>{cairoPlaying ? <FaPause /> : <FaPlay />} {cairoPlaying ? "إيقاف مؤقت" : "شغّل البث"}</button></div><img src="/img/radio.png" alt="" /></article><div className="quick-radios">{radios.slice(0, 3).map((radio) => <button type="button" key={radio.id} onClick={() => playRadio(radio)}><span><FaPlay /></span><div><small>بث مباشر</small><strong>{radio.name}</strong></div></button>)}<Link to="/radio">عرض دليل الإذاعات <FaArrowLeft /></Link></div></div></section>

    <section className="home-section"><SectionHeader title="رحلتك اليومية" /><div className="journey-grid"><article><span className="journey-icon"><FaBookOpen /></span><small>تقدم الختمة</small><strong>{khatmaProgress}%</strong><div className="meter"><i style={{ width: `${khatmaProgress}%` }} /></div></article><article><span className="journey-icon"><FaBookmark /></span><small>العلامات المحفوظة</small><strong>{bookmarks.length}</strong><Link to={`/read/${lastRead.surahNumber}`}>راجع محفوظاتك</Link></article><article><span className="journey-icon"><FaCheck /></span><small>الورد اليومي</small><strong>{lastRead.ayahNumber >= 10 ? "مكتمل" : `${lastRead.ayahNumber}/10`}</strong><Link to={`/read/${lastRead.surahNumber}/${lastRead.ayahNumber}`}>أكمل وردك</Link></article></div></section>

    <section className="home-section"><div className="section-heading-row"><SectionHeader title="استكشف السور" /><label className="home-search"><FaSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم السورة" /></label></div><div className="surah-explorer">{filteredSurahs.map((surah) => <Link to={`/read/${surah.number}`} key={surah.number}><span>{surah.number.toLocaleString("ar-EG")}</span><div><strong>{surah.name}</strong><small>{surah.revelationType === "Meccan" ? "مكية" : "مدنية"} • {surah.numberOfAyahs} آية</small></div><FaArrowLeft /></Link>)}</div></section>

    <section className="home-section"><SectionHeader title="القراء المميزون" /><div className="featured-readers">{reciters.map((reader) => <article key={reader.id}><div className="reader-portrait"><img src={reader.portrait} alt={`صورة ${reader.displayName || reader.name}`} loading="lazy" /></div><div className="reader-copy"><small>قارئ من روائع التلاوات</small><h3>{reader.displayName || reader.name}</h3><button type="button" onClick={() => playReader(reader)}><span><FaPlay /></span> استمع لسورة الفاتحة</button></div></article>)}</div></section>

    {dailyAyah && <section className="daily-ayah"><span className="ayah-label">آية اليوم</span><blockquote>﴿ {dailyAyah.text} ﴾</blockquote><p>{dailyAyah.surah.name} • الآية {dailyAyah.numberInSurah}</p><div><button type="button" onClick={copyAyah}>{copied ? <FaCheck /> : <FaCopy />} {copied ? "تم النسخ" : "نسخ"}</button><button type="button" onClick={shareAyah}><FaShareAlt /> مشاركة</button><button type="button" onClick={() => navigate(`/read/${dailyAyah.surah.number}/${dailyAyah.numberInSurah}`)}><FaHeart /> تدبر الآية</button></div></section>}
  </div>;
}
