import { useEffect, useMemo, useState } from "react";
import { FaBroadcastTower, FaExternalLinkAlt, FaKaaba, FaMosque, FaPlay, FaRedoAlt, FaSignal, FaTv } from "react-icons/fa";
import { getLiveTv } from "../../services/api";
import "./tv.css";

const CHANNEL_DETAILS = [
  {
    id: "3",
    name: "قناة القرآن الكريم",
    location: "مكة المكرمة",
    description: "نقل مباشر على مدار الساعة من المسجد الحرام مع تلاوات القرآن الكريم.",
    streamUrl: "https://win.holol.com/live/quran/playlist.m3u8",
    embedUrl: "https://www.youtube-nocookie.com/embed/eC4LfEVxvKg?rel=0&modestbranding=1",
    watchUrl: "https://www.youtube.com/channel/UCos52azQNBgW63_9uDJoPDA/live",
    kind: "quran",
  },
  {
    id: "4",
    name: "قناة السنة النبوية",
    location: "المدينة المنورة",
    description: "بث حي من المسجد النبوي الشريف وبرامج السنة والسيرة النبوية.",
    streamUrl: "https://win.holol.com/live/sunnah/playlist.m3u8",
    embedUrl: "https://www.youtube-nocookie.com/embed/Rs7St51oDDc?rel=0&modestbranding=1",
    watchUrl: "https://www.youtube.com/channel/UCROKYPep-UuODNwyipe6JMw/live",
    kind: "sunnah",
  },
];

const mergeChannels = (apiChannels) => CHANNEL_DETAILS.map((fallback, index) => {
  const apiChannel = apiChannels.find((item) => String(item.id) === fallback.id)
    || apiChannels.find((item) => item.name?.includes(index === 0 ? "القرآن" : "السنة"));
  return { ...fallback, ...apiChannel, name: apiChannel?.name || fallback.name, streamUrl: apiChannel?.url || fallback.streamUrl, embedUrl: fallback.embedUrl };
});

export default function Tv() {
  const [channels, setChannels] = useState(CHANNEL_DETAILS);
  const [activeId, setActiveId] = useState(CHANNEL_DETAILS[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [playerError, setPlayerError] = useState(false);
  const [apiNotice, setApiNotice] = useState("");

  useEffect(() => {
    let active = true;
    getLiveTv().then((items) => {
      if (active) setChannels(mergeChannels(items));
    }).catch(() => {
      if (active) setApiNotice("تعذّر تحديث دليل القنوات الآن؛ يتم تشغيل الروابط الاحتياطية الموثوقة.");
    });
    return () => { active = false; };
  }, []);

  const activeChannel = useMemo(() => channels.find((channel) => String(channel.id) === String(activeId)) || channels[0], [activeId, channels]);
  const selectChannel = (channel) => {
    if (String(channel.id) === String(activeId)) return;
    setActiveId(String(channel.id));
    setIsLoading(true);
    setPlayerError(false);
  };

  return (
    <div className="tv">
      <section className="tv-heading">
        <div><span><FaBroadcastTower /> بث إسلامي مباشر</span><h1>من الحرمين<br /><em>إلى قلبك.</em></h1><p>القنوات العربية الإسلامية المباشرة المتاحة من المصدر الرسمي، داخل تجربة مشاهدة هادئة وواضحة.</p></div>
        <div className="tv-heading-status"><FaSignal /><strong>{channels.length}</strong><span>قنوات متاحة الآن</span></div>
      </section>
      <section className="tv-studio" aria-label="مشغّل البث المباشر">
        <div className="tv-player-shell">
          <div className="tv-player-top"><span className="tv-live"><i /> مباشر الآن</span><div><strong>{activeChannel.name}</strong><small>{activeChannel.location}</small></div></div>
          <div className="tv-video">
            {isLoading && <div className="tv-loading"><span className="loader_section" /><p>جارٍ تجهيز البث عالي الجودة…</p></div>}
            {playerError ? <div className="tv-error"><FaTv /><strong>تعذّر تشغيل البث داخل التطبيق</strong><p>قد تمنع القناة التضمين مؤقتًا. يمكنك فتح البث الرسمي مباشرة.</p><a href={activeChannel.watchUrl} target="_blank" rel="noreferrer"><FaExternalLinkAlt /> فتح البث الرسمي</a><button type="button" onClick={() => { setPlayerError(false); setIsLoading(true); }}><FaRedoAlt /> إعادة المحاولة</button></div> : <iframe key={activeChannel.id} src={activeChannel.embedUrl} title={`بث مباشر — ${activeChannel.name}`} loading="eager" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen onLoad={() => setIsLoading(false)} onError={() => { setIsLoading(false); setPlayerError(true); }} />}
          </div>
          <div className="tv-now"><div className={`tv-now-icon ${activeChannel.kind}`}>{activeChannel.kind === "quran" ? <FaKaaba /> : <FaMosque />}</div><div><small>تشاهد الآن</small><strong>{activeChannel.name}</strong><p>{activeChannel.description}</p></div><a href={activeChannel.watchUrl} target="_blank" rel="noreferrer" aria-label={`فتح ${activeChannel.name} في نافذة جديدة`}><FaExternalLinkAlt /></a></div>
        </div>
        <aside className="tv-channels" aria-label="قائمة القنوات المتاحة">
          <div className="tv-channels-head"><span>اختر القناة</span><small>متاح بجودة تلقائية حسب اتصالك</small></div>
          {channels.map((channel) => <button type="button" key={channel.id} className={String(channel.id) === String(activeId) ? "active" : ""} onClick={() => selectChannel(channel)} aria-pressed={String(channel.id) === String(activeId)}><span className={`channel-icon ${channel.kind}`}>{channel.kind === "quran" ? <FaKaaba /> : <FaMosque />}</span><span className="channel-copy"><small><i /> بث مباشر • {channel.location}</small><strong>{channel.name}</strong></span><span className="channel-play"><FaPlay /></span></button>)}
          <p className="tv-source">يتم تحديث القنوات من دليل MP3Quran الرسمي. {apiNotice}</p>
        </aside>
      </section>
    </div>
  );
}
