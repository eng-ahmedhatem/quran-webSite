import { memo, useEffect, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
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
        <div className="search-home search-visible">
          <div className="cards">
            {results.map((surah) => <Sorah_card key={surah.number} sorahId={surah.number} title={surah.name} ayaCount={surah.numberOfAyahs} transform={() => openSurah(surah)} />)}
            {!results.length && <div className="noResults"><h4>لا توجد سورة بهذا الاسم</h4></div>}
          </div>
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
