import { memo, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaArrowRight, FaDownload, FaHeadphones } from "react-icons/fa";
import Audio_track from "../../Component/Audio_track/Audio_track";
import Status from "../../Component/Status/Status";
import { getReciters, toSurahAudio } from "../../services/api";
import "./audio.css";
import PageSkeleton from "../../Component/Skeleton/PageSkeleton";

function Audio() {
  const location = useLocation();
  const surah = location.state || { title: "سُورَةُ ٱلْفَاتِحَةِ", sorah_id: 1 };
  const [readers, setReaders] = useState([]);
  const [readerId, setReaderId] = useState(surah.id || "");
  const [moshafId, setMoshafId] = useState(surah.ro || "");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setError("");
    getReciters().then((items) => {
      if (!active) return;
      const supportedReaders = items.filter((item) => item.moshaf?.some((moshaf) => moshaf.surah_list.split(",").includes(String(surah.sorah_id))));
      setReaders(supportedReaders);
      const preferred = supportedReaders.find((item) => String(item.id) === String(surah.id)) || supportedReaders[0];
      setReaderId(preferred?.id || "");
      const preferredMoshaf = preferred?.moshaf.find((item) => String(item.id) === String(surah.ro) && item.surah_list.split(",").includes(String(surah.sorah_id)))
        || preferred?.moshaf.find((item) => item.surah_list.split(",").includes(String(surah.sorah_id)));
      setMoshafId(preferredMoshaf?.id || "");
    }).catch(() => active && setError("تعذر تحميل قائمة القراء. حاول مرة أخرى."));
    return () => { active = false; };
  }, [retry, surah.id, surah.ro, surah.sorah_id]);

  const selectedReader = readers.find((item) => String(item.id) === String(readerId));
  const availableMoshaf = useMemo(() => selectedReader?.moshaf.filter((item) => item.surah_list.split(",").includes(String(surah.sorah_id))) || [], [selectedReader, surah.sorah_id]);
  const selectedMoshaf = availableMoshaf.find((item) => String(item.id) === String(moshafId));
  const source = selectedMoshaf ? toSurahAudio(selectedMoshaf.server, surah.sorah_id) : "";
  const playlist = source ? [{ name: surah.title, writer: selectedReader.name, img: "/img/logo.png", src: source, id: `recitation-${selectedReader.id}-${surah.sorah_id}` }] : [];
  const portrait = [
    ["المنشاوي", "/img/المنشاوي.jpg"], ["الحصري", "/img/الحصري.jpg"], ["عبدالباسط", "/img/عبد الباسط.jpg"],
    ["ماهر", "/img/ماهر المعيقلي.jpg"], ["الشريم", "/img/سعود الشريم.jpg"], ["جبريل", "/img/محمد جبريل.jpg"],
  ].find(([name]) => selectedReader?.name.replace(/\s/g, "").includes(name))?.[1] || "/img/logo.png";

  if (error) return <Status message={error} action={() => setRetry((value) => value + 1)} />;
  if (!readers.length) return <PageSkeleton compact label="جارٍ تحميل القراء والتلاوات" />;

  return (
    <aside className="Audio" aria-label="اختيارات التلاوة">
      <Link className="audio-back" to="/listen"><FaArrowRight /> اختر سورة أخرى</Link>
      <div className="audio-cover"><img src={portrait} alt={selectedReader?.name ? `صورة ${selectedReader.name}` : ""} /><span><FaHeadphones /></span></div>
      <div className="audio-heading"><small>جاهز للاستماع</small><h2>{surah.title}</h2><p>{selectedReader?.name}</p></div>
      <label className="audio-select"><span>القارئ</span><select value={readerId} onChange={(event) => { const next = readers.find((item) => String(item.id) === event.target.value); setReaderId(event.target.value); setMoshafId(next?.moshaf.find((item) => item.surah_list.split(",").includes(String(surah.sorah_id)))?.id || ""); }}>{readers.map((reader) => <option key={reader.id} value={reader.id}>{reader.name}</option>)}</select></label>
      <label className="audio-select"><span>الرواية</span><select value={moshafId} onChange={(event) => setMoshafId(event.target.value)}>{availableMoshaf.map((moshaf) => <option key={moshaf.id} value={moshaf.id}>{moshaf.name}</option>)}</select></label>
      <div className="audio-ui">{source && <Audio_track thePlayList={playlist} />}</div>
      {!source && <p className="audio-unavailable">لا تتوفر هذه السورة بالرواية المختارة. اختر رواية أخرى.</p>}
      {source && <a className="audio-download" href={source} target="_blank" rel="noreferrer" aria-label="فتح ملف السورة للتنزيل"><FaDownload /> تنزيل السورة</a>}
    </aside>
  );
}

export default memo(Audio);
