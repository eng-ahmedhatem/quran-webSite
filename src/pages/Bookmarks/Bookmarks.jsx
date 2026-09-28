import { useMemo, useState } from "react";
import { FaBookmark, FaBookOpen, FaSearch, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { normalizeArabic } from "../Listen/Functions";
import "./bookmarks.css";

const readBookmarks = () => {
  try { return JSON.parse(localStorage.getItem("quran:bookmarks")) || []; }
  catch { return []; }
};

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  const [query, setQuery] = useState("");
  const [clearArmed, setClearArmed] = useState(false);
  const filtered = useMemo(() => {
    const normalized = normalizeArabic(query);
    return [...bookmarks]
      .filter((item) => normalizeArabic(`${item.surahName} ${item.text} ${item.ayahNumber}`).includes(normalized))
      .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  }, [bookmarks, query]);

  const persist = (next) => {
    setBookmarks(next);
    localStorage.setItem("quran:bookmarks", JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("quran:bookmarks-changed", { detail: next.length }));
  };
  const remove = (number) => persist(bookmarks.filter((item) => item.number !== number));
  const clearAll = () => {
    if (!clearArmed) return setClearArmed(true);
    persist([]);
    setClearArmed(false);
  };

  return <section className="bookmarks-page">
    <header className="bookmarks-hero">
      <div><span><FaBookmark /> مكتبتك الخاصة</span><h1>الآيات المحفوظة</h1><p>ارجع سريعًا إلى مواضع التدبر والمراجعة التي اخترتها أثناء القراءة.</p></div>
      <strong><b>{bookmarks.length.toLocaleString("ar-EG")}</b><small>علامة محفوظة</small></strong>
    </header>

    <div className="bookmarks-tools">
      <label><FaSearch /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في الآيات أو أسماء السور" aria-label="البحث في العلامات المحفوظة" /><span>{filtered.length.toLocaleString("ar-EG")}</span></label>
      {bookmarks.length > 0 && <button className={clearArmed ? "is-confirming" : ""} type="button" onClick={clearAll} onBlur={() => setClearArmed(false)}><FaTrashAlt /> {clearArmed ? "اضغط مجددًا لتأكيد المسح" : "مسح كل العلامات"}</button>}
    </div>

    {filtered.length ? <div className="bookmarks-grid">{filtered.map((item, index) => <article key={item.number}>
      <header><span>{String(index + 1).padStart(2, "0")}</span><div><small>{item.surahName}</small><h2>الآية {Number(item.ayahNumber).toLocaleString("ar-EG")}</h2></div></header>
      <blockquote dir="rtl" lang="ar">﴿ {item.text} ﴾</blockquote>
      <footer><Link to={`/read/${item.surahNumber}/${item.ayahNumber}`}><FaBookOpen /> افتح في المصحف</Link><button type="button" onClick={() => remove(item.number)} aria-label={`حذف علامة ${item.surahName} الآية ${item.ayahNumber}`}><FaTrashAlt /> حذف</button></footer>
    </article>)}</div> : <div className="bookmarks-empty">
      <span><FaBookmark /></span>
      <h2>{query ? "لا توجد علامة مطابقة" : "لم تحفظ أي آية بعد"}</h2>
      <p>{query ? "جرّب كلمة أخرى أو امسح البحث." : "أثناء القراءة افتح أدوات الآية واضغط «حفظ» لتظهر هنا."}</p>
      {query ? <button type="button" onClick={() => setQuery("")}>عرض كل العلامات</button> : <Link to="/read"><FaBookOpen /> ابدأ القراءة</Link>}
    </div>}
  </section>;
}
