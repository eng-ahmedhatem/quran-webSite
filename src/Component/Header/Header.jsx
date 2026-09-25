import { memo, useEffect, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { get_SorahData, normalizeArabic, Sorah_card } from "../../pages/Listen/Functions";
import "./Header.css";

export function Search_component({ change, value, id }) {
  return (
    <div className="search">
      <input onChange={change} value={value} type="search" placeholder="البحث عن سورة" id={id} autoComplete="off" />
      <label htmlFor={id}><CiSearch /></label>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [surahs, setSurahs] = useState([]);

  useEffect(() => { get_SorahData(setSurahs).catch(() => setSurahs([])); }, []);
  useEffect(() => {
    const closeSearch = (event) => {
      if (event.key === "Escape") setQuery("");
    };
    window.addEventListener("keydown", closeSearch);
    return () => window.removeEventListener("keydown", closeSearch);
  }, []);
  const results = useMemo(() => {
    const normalized = normalizeArabic(query);
    return normalized ? surahs.filter((surah) => surah.name_2.includes(normalized)).slice(0, 12) : [];
  }, [query, surahs]);

  const openSurah = (surah) => {
    setQuery("");
    navigate(`/read/${surah.number}`);
  };

  return (
    <>
      {query && (
        <div className="search-home search-visible" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setQuery("");
        }}>
          <section className="search-panel" role="dialog" aria-label="نتائج البحث عن السور">
            <div className="search-panel-head"><div><small>الوصول السريع</small><strong>{results.length ? (results.length === 1 ? "نتيجة واحدة مطابقة" : `${results.length} نتائج مطابقة`) : "نتائج البحث"}</strong></div><button type="button" onClick={() => setQuery("")} aria-label="إغلاق نتائج البحث"><FaTimes /></button></div>
            <div className="cards">
              {results.map((surah) => <Sorah_card key={surah.number} sorahId={surah.number} title={surah.name} ayaCount={surah.numberOfAyahs} transform={() => openSurah(surah)} />)}
              {!results.length && <div className="noResults"><span>لا توجد نتائج</span><p>جرّب كتابة اسم السورة بدون تشكيل.</p></div>}
            </div>
          </section>
        </div>
      )}
      <header>
        <div className="container">
          <Link to="/" className="logo"><img src="/img/logo.png" alt="شعار القرآن الكريم" /><h2>القرآن الكريم</h2></Link>
          <Search_component value={query} change={(event) => setQuery(event.target.value)} id="search-1" />
        </div>
      </header>
    </>
  );
}

export default memo(Header);
