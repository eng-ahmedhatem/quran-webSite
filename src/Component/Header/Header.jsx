import { memo, useEffect, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { get_SorahData, normalizeArabic, Sorah_card } from "../../pages/Listen/Functions";
import "./Header.css";

export function Search_component({ change, value, id, onKeyDown, onClear, expanded = false }) {
  return (
    <div className="search">
      <CiSearch className="search-icon" aria-hidden="true" />
      <input onChange={change} onKeyDown={onKeyDown} value={value} type="search" placeholder="ابحث باسم السورة" id={id} autoComplete="off" aria-label="البحث عن سورة" aria-expanded={expanded} aria-controls="surah-search-results" />
      {value && <button className="search-clear" type="button" onClick={onClear} aria-label="مسح البحث"><FaTimes /></button>}
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [surahs, setSurahs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  useEffect(() => { setActiveIndex(0); }, [query]);

  const openSurah = (surah) => {
    setQuery("");
    navigate(`/read/${surah.number}`);
  };

  const handleSearchKeys = (event) => {
    if (!query || !results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      openSurah(results[activeIndex] || results[0]);
    }
  };

  return (
    <>
      {query && (
        <div className="search-home search-visible" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setQuery("");
        }}>
          <section className="search-panel" id="surah-search-results" role="dialog" aria-label="نتائج البحث عن السور">
            <div className="search-panel-head"><div><small>الوصول السريع</small><strong aria-live="polite">{results.length ? (results.length === 1 ? "نتيجة واحدة مطابقة" : `${results.length} نتائج مطابقة`) : "لا توجد نتائج مطابقة"}</strong></div><span className="search-key-hint"><kbd>↑</kbd><kbd>↓</kbd> للتنقل <kbd>Enter</kbd> للفتح</span><button type="button" onClick={() => setQuery("")} aria-label="إغلاق نتائج البحث"><FaTimes /></button></div>
            <div className="cards">
              {results.map((surah, index) => <Sorah_card key={surah.number} theClass={index === activeIndex ? "show keyboard-active" : "show"} sorahId={surah.number} title={surah.name} ayaCount={surah.numberOfAyahs} transform={() => openSurah(surah)} />)}
              {!results.length && <div className="noResults"><span>لا توجد نتائج</span><p>جرّب كتابة اسم السورة بدون تشكيل.</p></div>}
            </div>
          </section>
        </div>
      )}
      <header>
        <div className="container">
          <Link to="/" className="logo"><img src="/img/logo.png" alt="شعار القرآن الكريم" /><h2>القرآن الكريم</h2></Link>
          <Search_component value={query} change={(event) => setQuery(event.target.value)} onKeyDown={handleSearchKeys} onClear={() => setQuery("")} expanded={Boolean(query)} id="search-1" />
        </div>
      </header>
    </>
  );
}

export default memo(Header);
