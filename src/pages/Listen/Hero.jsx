import { memo, useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaHeadphones, FaPlay, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { get_SorahData, normalizeArabic, Sorah_card } from "./Functions";

const FEATURED_READERS = [
  { title: "سُورَةُ ٱلْفَاتِحَةِ", sorah_id: 1, id: 112, ro: 112, name: "الشيخ محمد صديق المنشاوي", img: "/img/المنشاوي.jpg" },
  { title: "سُورَةُ ٱلْفَاتِحَةِ", sorah_id: 1, id: 118, ro: 270, name: "الشيخ محمود خليل الحصري", img: "/img/الحصري.jpg" },
  { title: "سُورَةُ ٱلْفَاتِحَةِ", sorah_id: 1, id: 51, ro: 53, name: "الشيخ عبد الباسط عبد الصمد", img: "/img/عبد الباسط.jpg" },
  { title: "سُورَةُ ٱلْفَاتِحَةِ", sorah_id: 1, id: 102, ro: 102, name: "الشيخ ماهر بن حمد المعيقلي", img: "/img/ماهر المعيقلي.jpg" },
  { title: "سُورَةُ ٱلْفَاتِحَةِ", sorah_id: 1, id: 31, ro: 31, name: "الشيخ سعود بن إبراهيم الشريم", img: "/img/سعود الشريم.jpg" },
];

export default memo(function Hero() {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => { get_SorahData(setSurahs).catch(() => setSurahs([])); }, []);

  const visibleSurahs = useMemo(() => {
    const normalized = normalizeArabic(query);
    return surahs.filter((surah) => !normalized || surah.name_2.includes(normalized));
  }, [query, surahs]);

  const openAudio = (item) => {
    navigate("/listen/audio", { state: item });
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="listen-experience">
      <section className="listen-intro">
        <div className="listen-intro-copy"><span><FaHeadphones /> مكتبة التلاوات</span><h1>صوتٌ يرافق تدبّرك.</h1><p>اختر السورة والقارئ، واستمع بتجربة هادئة تستمر معك أثناء التنقل داخل التطبيق.</p><button type="button" onClick={() => openAudio(FEATURED_READERS[0])}><FaPlay /> ابدأ بتلاوة مختارة</button></div>
        <div className="listen-orbit" aria-hidden="true"><img src="/img/logo.png" alt="" /><i /><i /><i /></div>
      </section>

      <section className="listen-readers" aria-labelledby="featured-readers-title">
        <div className="listen-section-head"><div><small>أصوات مختارة</small><h2 id="featured-readers-title">نخبة القرّاء</h2></div><span>اختر قارئًا وابدأ بالاستماع</span></div>
        <div className="listen-reader-grid">{FEATURED_READERS.map((reader) => <button type="button" onClick={() => openAudio(reader)} key={reader.id}><span className="listen-reader-photo"><img src={reader.img} alt={`صورة ${reader.name}`} loading="lazy" /></span><span className="listen-reader-copy"><small>تلاوة مختارة</small><strong>{reader.name}</strong><i><FaPlay /></i></span></button>)}</div>
      </section>

      <section className="listen-surahs" aria-labelledby="listen-surahs-title">
        <div className="listen-section-head"><div><small>المصحف الصوتي</small><h2 id="listen-surahs-title">اختر السورة</h2></div><label className="listen-search"><FaSearch /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم السورة" /><span>{visibleSurahs.length}</span></label></div>
        <div className="listen-surah-grid">{visibleSurahs.map((surah) => <Sorah_card key={surah.number} sorahId={surah.number} title={surah.name} ayaCount={surah.numberOfAyahs} transform={() => openAudio({ title: surah.name, sorah_id: surah.number, id: 112, ro: 112 })} />)}</div>
        {!visibleSurahs.length && <div className="listen-empty"><strong>لم نجد سورة بهذا الاسم</strong><button type="button" onClick={() => setQuery("")}>مسح البحث <FaArrowLeft /></button></div>}
      </section>
    </div>
  );
});
