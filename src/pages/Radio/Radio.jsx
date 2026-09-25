import { useEffect, useRef, useState } from "react";
import SectionHeader from "../../Component/Section_header/Section_header";
import Audio_track from "../../Component/Audio_track/Audio_track";
import Status from "../../Component/Status/Status";
import { getRadios } from "../../services/api";
import "./radio.css";

export default function Radio() {
  const [radios, setRadios] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const playerRef = useRef(null);
  useEffect(() => {
    let active = true;
    setError("");
    getRadios().then((items) => active && setRadios(items.filter((item) => !item.name.includes("ترجمة"))))
      .catch(() => active && setError("تعذر تحميل محطات الراديو. تحقق من اتصالك ثم أعد المحاولة."));
    return () => { active = false; };
  }, [retry]);
  const play = (radio) => { setSelected(radio); requestAnimationFrame(() => { if (playerRef.current) playerRef.current.style.transform = "translate(-50%, 0)"; }); };
  const playlist = selected ? [{ name: selected.name, writer: "بث مباشر", img: "/img/radio.png", src: selected.url, id: 1 }] : [];
  if (error) return <Status message={error} action={() => setRetry((value) => value + 1)} />;
  return <div className="radio"><SectionHeader title="المحطات المتاحة" />
    {!radios.length ? <div className="loading_section"><span className="loader_section" /></div> : <div className="content-audio">
      <div className="audio-ui" ref={playerRef}>{selected && <Audio_track thePlayList={playlist} from_radio />}</div>
      <div className="cards">{radios.map((radio) => <button onClick={() => play(radio)} key={radio.id} className="card" type="button"><span className="live"><span>مباشر</span><i /></span><h2>{radio.name}</h2></button>)}</div>
    </div>}
  </div>;
}
