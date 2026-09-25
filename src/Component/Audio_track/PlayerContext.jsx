import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaExpand, FaHeart, FaPause, FaPlay, FaRegHeart, FaStop } from "react-icons/fa";
import "./audio-track.css";

const PlayerContext = createContext(null);

const readList = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
};

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const sleepRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("idle");
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolumeState] = useState(() => Number(localStorage.getItem("quran:volume") || 0.75));
  const [rate, setRateState] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const [favorites, setFavorites] = useState(() => readList("quran:audio-favorites"));
  const [sleepMinutes, setSleepMinutes] = useState(0);

  const rememberRecent = useCallback((nextTrack) => {
    if (!nextTrack?.isLive) return;
    const recent = readList("quran:recent-radios").filter((item) => item.id !== nextTrack.id);
    localStorage.setItem("quran:recent-radios", JSON.stringify([nextTrack, ...recent].slice(0, 6)));
  }, []);

  const playTrack = useCallback((nextTrack) => {
    const audio = audioRef.current;
    if (!audio || !nextTrack?.src) return;
    if (track?.id === nextTrack.id && audio.src === nextTrack.src) {
      audio.play().catch(() => setStatus("error"));
      return;
    }
    setTrack(nextTrack);
    setStatus("loading");
    rememberRecent(nextTrack);
    audio.src = nextTrack.src;
    audio.load();
    audio.play().catch(() => { setPlaying(false); setStatus("error"); });
  }, [rememberRecent, track]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) audio.play().catch(() => setStatus("error")); else audio.pause();
  }, [track]);

  const close = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.removeAttribute("src");
    setTrack(null); setPlaying(false); setExpanded(false); setStatus("idle");
  }, []);

  const setVolume = (value) => {
    const next = Number(value);
    setVolumeState(next);
    if (audioRef.current) audioRef.current.volume = next;
    localStorage.setItem("quran:volume", String(next));
  };
  const setRate = (value) => {
    const next = Number(value);
    setRateState(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };
  const toggleFavorite = (item = track) => {
    if (!item) return;
    setFavorites((current) => {
      const exists = current.some((favorite) => favorite.id === item.id);
      const next = exists ? current.filter((favorite) => favorite.id !== item.id) : [item, ...current];
      localStorage.setItem("quran:audio-favorites", JSON.stringify(next));
      return next;
    });
  };
  const setSleep = (minutes) => {
    window.clearTimeout(sleepRef.current);
    setSleepMinutes(minutes);
    if (minutes) sleepRef.current = window.setTimeout(() => { audioRef.current?.pause(); setSleepMinutes(0); }, minutes * 60 * 1000);
  };

  useEffect(() => () => window.clearTimeout(sleepRef.current), []);
  useEffect(() => {
    if (!track || !("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.name, artist: track.writer || "القرآن الكريم", artwork: [{ src: track.img || "/img/logo.png", sizes: "512x512", type: "image/png" }] });
    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
  }, [track]);

  const value = useMemo(() => ({ track, playing, status, playTrack, toggle, close, volume, setVolume, expanded, setExpanded, rate, setRate, repeat, setRepeat, favorites, toggleFavorite, sleepMinutes, setSleep }), [track, playing, status, playTrack, toggle, close, volume, expanded, rate, repeat, favorites, sleepMinutes]);
  const favorite = track && favorites.some((item) => item.id === track.id);

  return <PlayerContext.Provider value={value}>
    {children}
    <audio ref={audioRef} preload="none" onLoadStart={() => setStatus("loading")} onCanPlay={() => setStatus("ready")} onPlaying={() => { setPlaying(true); setStatus("playing"); }} onPause={() => setPlaying(false)} onError={() => setStatus("error")} onEnded={() => repeat ? audioRef.current?.play() : setPlaying(false)} />
    {track && <aside className={`global-player ${expanded ? "expanded" : ""}`} aria-label="مشغل الصوت">
      <button className="player-cover" type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "تصغير المشغل" : "توسيع المشغل"}><img src={track.img || "/img/logo.png"} alt="" /></button>
      <div className="player-copy"><span className={track.isLive ? "live-state" : "track-state"}>{track.isLive ? "مباشر الآن" : status === "error" ? "تعذر التشغيل" : "تلاوة"}</span><strong>{track.name}</strong><small>{track.writer}</small></div>
      <button type="button" className="player-main" onClick={toggle} aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}>{playing ? <FaPause /> : <FaPlay />}</button>
      <button type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "تصغير" : "توسيع"}>{expanded ? <FaChevronDown /> : <FaExpand />}</button>
      <button type="button" onClick={close} aria-label="إغلاق المشغل"><FaStop /></button>
      {expanded && <div className="player-details">
        <button type="button" onClick={() => toggleFavorite()}>{favorite ? <FaHeart /> : <FaRegHeart />} {favorite ? "محفوظة" : "أضف للمفضلة"}</button>
        <label>الصوت <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(event.target.value)} /></label>
        {!track.isLive && <><button type="button" onClick={() => setRepeat(!repeat)}>التكرار: {repeat ? "مفعّل" : "متوقف"}</button><label>السرعة <select value={rate} onChange={(event) => setRate(event.target.value)}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label></>}
        <label>مؤقت النوم <select value={sleepMinutes} onChange={(event) => setSleep(Number(event.target.value))}><option value="0">متوقف</option><option value="15">15 دقيقة</option><option value="30">30 دقيقة</option><option value="60">60 دقيقة</option></select></label>
      </div>}
    </aside>}
  </PlayerContext.Provider>;
}

export function usePlayer() { return useContext(PlayerContext); }
