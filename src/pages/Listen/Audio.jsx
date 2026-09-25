import { memo, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useLocation } from "react-router-dom";
import Audio_track from "../../Component/Audio_track/Audio_track";
import Status from "../../Component/Status/Status";
import { getReciters, toSurahAudio } from "../../services/api";

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
      setReaders(items);
      const preferred = items.find((item) => String(item.id) === String(surah.id)) || items[0];
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
  const playlist = source ? [{ name: surah.title, writer: selectedReader.name, img: "/img/logo.png", src: source, id: 1 }] : [];

  if (error) return <Status message={error} action={() => setRetry((value) => value + 1)} />;
  if (!readers.length) return <div className="loading_section"><span className="loader_section" /></div>;

  return (
    <div className="Audio">
      <div className="row-1"><div className="img"><img src="/img/logo.png" alt="" /></div><h2>{surah.title}</h2></div>
      <Box className="audio-select" sx={{ minWidth: "100%", direction: "rtl", mb: 2 }}>
        <FormControl fullWidth><InputLabel className="audio-label">اختر القارئ</InputLabel>
          <Select value={readerId} label="اختر القارئ" onChange={(event) => { const next = readers.find((item) => item.id === event.target.value); setReaderId(event.target.value); setMoshafId(next?.moshaf.find((item) => item.surah_list.split(",").includes(String(surah.sorah_id)))?.id || ""); }}>
            {readers.map((reader) => <MenuItem key={reader.id} value={reader.id}>{reader.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Box className="audio-select" sx={{ minWidth: "100%", direction: "rtl" }}>
        <FormControl fullWidth><InputLabel className="audio-label">اختر الرواية</InputLabel>
          <Select value={moshafId} label="اختر الرواية" onChange={(event) => setMoshafId(event.target.value)}>
            {availableMoshaf.map((moshaf) => <MenuItem key={moshaf.id} value={moshaf.id}>{moshaf.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      {source && <a href={source} target="_blank" rel="noreferrer" aria-label="فتح ملف السورة للتنزيل"><img src="/img/downloadBtn.png" alt="تنزيل السورة" /></a>}
      <div className="audio-ui">{source && <Audio_track thePlayList={playlist} />}</div>
    </div>
  );
}

export default memo(Audio);
