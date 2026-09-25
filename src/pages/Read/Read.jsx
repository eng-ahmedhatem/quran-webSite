import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SectionHeader from "../../Component/Section_header/Section_header";
import Status from "../../Component/Status/Status";
import { getSurah } from "../../services/api";
import "./read.css";

export default function Read() {
  const { surahNumber = "1" } = useParams();
  const [surah, setSurah] = useState(null);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let active = true;
    setSurah(null);
    setError("");
    getSurah(surahNumber)
      .then((data) => active && setSurah(data))
      .catch(() => active && setError("تعذر تحميل السورة. تحقق من اتصالك ثم حاول مجددًا."));
    return () => { active = false; };
  }, [surahNumber, requestKey]);

  if (error) return <Status message={error} action={() => setRequestKey((key) => key + 1)} />;
  if (!surah) return <div className="loading_section"><span className="loader_section" /></div>;

  return (
    <section className="reader-page">
      <SectionHeader title={surah.name} />
      <div className="surah-meta">
        <span>{surah.revelationType === "Meccan" ? "مكية" : "مدنية"}</span>
        <span>{surah.numberOfAyahs} آية</span>
      </div>
      {surah.number !== 1 && surah.number !== 9 && <p className="basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>}
      <article className="ayahs" aria-label={`نص ${surah.name}`}>
        {surah.ayahs.map((ayah) => (
          <span className="ayah" key={ayah.number}>
            {ayah.text} <b aria-label={`الآية ${ayah.numberInSurah}`}>{ayah.numberInSurah.toLocaleString("ar-EG")}</b>
          </span>
        ))}
      </article>
    </section>
  );
}

