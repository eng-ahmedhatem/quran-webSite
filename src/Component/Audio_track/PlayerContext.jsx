import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaExpand, FaHeart, FaPause, FaPlay, FaRedo, FaRegHeart, FaTimes } from "react-icons/fa";
import "./audio-track.css";

const PlayerContext = createContext(null);
const LIVE_CONNECT_TIMEOUT = 18000;

const readList = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
};

const getSources = (item) => [...new Set([item?.src, ...(item?.sources || []), ...(item?.fallbackSrcs || [])].filter(Boolean))];

const mediaErrorMessage = (error) => {
  if (!error) return "تعذّر الاتصال بمصدر البث.";
  if (error.code === 2) return "انقطع الاتصال بمصدر البث. تحقق من الإنترنت ثم أعد المحاولة.";
  if (error.code === 3) return "صيغة الصوت في هذه المحطة غير مدعومة على جهازك.";
  if (error.code === 4) return "مصدر هذه المحطة غير متاح حاليًا.";
  return "تعذّر تشغيل هذه المحطة حاليًا.";
};

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const trackRef = useRef(null);
  const sourceIndexRef = useRef(0);
  const connectTimerRef = useRef(null);
  const sleepRef = useRef(null);
  const recoverRef = useRef(null);
  const failRef = useRef(null);
  const rememberedRef = useRef("");
  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [failedTrackIds, setFailedTrackIds] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolumeState] = useState(() => Number(localStorage.getItem("quran:volume") || 0.75));
  const [rate, setRateState] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const [favorites, setFavorites] = useState(() => readList("quran:audio-favorites"));
  const [sleepMinutes, setSleepMinutes] = useState(0);

  const clearConnectTimer = useCallback(() => {
    window.clearTimeout(connectTimerRef.current);
    connectTimerRef.current = null;
  }, []);

  const rememberRecent = useCallback((nextTrack) => {
    if (!nextTrack?.isLive || rememberedRef.current === String(nextTrack.id)) return;
    rememberedRef.current = String(nextTrack.id);
    const recent = readList("quran:recent-radios").filter((item) => item.id !== nextTrack.id);
    localStorage.setItem("quran:recent-radios", JSON.stringify([nextTrack, ...recent].slice(0, 6)));
  }, []);

  const failPlayback = useCallback((message) => {
    clearConnectTimer();
    const currentTrack = trackRef.current;
    setPlaying(false);
    setStatus("error");
    setErrorMessage(message || "تعذّر تشغيل هذا الصوت حاليًا.");
    if (currentTrack?.isLive) {
      setFailedTrackIds((current) => current.includes(currentTrack.id) ? current : [...current, currentTrack.id]);
    }
  }, [clearConnectTimer]);
  failRef.current = failPlayback;

  const playSource = useCallback((nextTrack, sourceIndex = 0) => {
    const audio = audioRef.current;
    const sources = getSources(nextTrack);
    if (!audio || !sources.length) {
      failRef.current?.("لا يوجد رابط صالح لتشغيل هذا الصوت.");
      return;
    }

    clearConnectTimer();
    sourceIndexRef.current = sourceIndex;
    setStatus("loading");
    setErrorMessage(sourceIndex ? "المصدر الرئيسي لا يستجيب؛ نجرب مصدرًا بديلًا…" : "");
    audio.src = sources[sourceIndex];
    audio.load();

    if (nextTrack.isLive) {
      connectTimerRef.current = window.setTimeout(() => {
        recoverRef.current?.("استغرق الاتصال بالمحطة وقتًا أطول من المعتاد.");
      }, LIVE_CONNECT_TIMEOUT);
    }

    const promise = audio.play();
    promise?.catch((error) => {
      if (error?.name === "AbortError") return;
      if (error?.name === "NotAllowedError") {
        failRef.current?.("اضغط تشغيل مرة أخرى للسماح للمتصفح ببدء الصوت.");
        return;
      }
      recoverRef.current?.("لم يبدأ مصدر البث الحالي بصورة صحيحة.");
    });
  }, [clearConnectTimer]);

  const recoverPlayback = useCallback((message) => {
    const currentTrack = trackRef.current;
    if (!currentTrack) return;
    const sources = getSources(currentTrack);
    const nextSourceIndex = sourceIndexRef.current + 1;
    if (nextSourceIndex < sources.length) {
      playSource(currentTrack, nextSourceIndex);
      return;
    }
    failPlayback(message);
  }, [failPlayback, playSource]);
  recoverRef.current = recoverPlayback;

  const playTrack = useCallback((nextTrack) => {
    if (!nextTrack) return;
    trackRef.current = nextTrack;
    rememberedRef.current = "";
    setTrack(nextTrack);
    playSource(nextTrack, 0);
  }, [playSource]);

  const retry = useCallback(() => {
    const currentTrack = trackRef.current;
    if (currentTrack) playSource(currentTrack, 0);
  }, [playSource]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    const currentTrack = trackRef.current;
    if (!audio || !currentTrack) return;
    if (status === "error" || !audio.currentSrc) {
      playSource(currentTrack, 0);
    } else if (audio.paused) {
      setStatus("loading");
      audio.play().catch((error) => {
        if (error?.name !== "AbortError") recoverPlayback("تعذّر استئناف تشغيل هذا الصوت.");
      });
    } else {
      audio.pause();
    }
  }, [playSource, recoverPlayback, status]);

  const close = useCallback(() => {
    clearConnectTimer();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.removeAttribute("src");
    trackRef.current = null;
    setTrack(null); setPlaying(false); setExpanded(false); setStatus("idle"); setErrorMessage("");
  }, [clearConnectTimer]);

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
      const exists = current.some((favoriteItem) => favoriteItem.id === item.id);
      const next = exists ? current.filter((favoriteItem) => favoriteItem.id !== item.id) : [item, ...current];
      localStorage.setItem("quran:audio-favorites", JSON.stringify(next));
      return next;
    });
  };
  const setSleep = (minutes) => {
    window.clearTimeout(sleepRef.current);
    setSleepMinutes(minutes);
    if (minutes) sleepRef.current = window.setTimeout(() => { audioRef.current?.pause(); setSleepMinutes(0); }, minutes * 60 * 1000);
  };

  useEffect(() => () => {
    window.clearTimeout(sleepRef.current);
    window.clearTimeout(connectTimerRef.current);
  }, []);
  useEffect(() => {
    if (!track || !("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.name, artist: track.writer || "القرآن الكريم", artwork: [{ src: track.img || "/img/logo.png" }] });
    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play().catch(() => failRef.current?.("تعذّر استئناف التشغيل.")));
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
    };
  }, [track]);

  const value = useMemo(() => ({ track, playing, status, errorMessage, failedTrackIds, playTrack, retry, toggle, close, volume, setVolume, expanded, setExpanded, rate, setRate, repeat, setRepeat, favorites, toggleFavorite, sleepMinutes, setSleep }), [track, playing, status, errorMessage, failedTrackIds, playTrack, retry, toggle, close, volume, expanded, rate, repeat, favorites, sleepMinutes]);
  const favorite = track && favorites.some((item) => item.id === track.id);
  const stateLabel = !track?.isLive
    ? status === "error" ? "تعذّر التشغيل" : track?.sequence ? "تلاوة السورة" : "تلاوة آية"
    : status === "error" ? "البث غير متاح"
      : status === "loading" || status === "stalled" ? "جارٍ الاتصال…"
        : playing ? "مباشر الآن" : "بث مباشر";

  return <PlayerContext.Provider value={value}>
    {children}
    <audio
      ref={audioRef}
      preload="none"
      onLoadStart={() => setStatus("loading")}
      onCanPlay={() => { clearConnectTimer(); setStatus((current) => current === "playing" ? current : "ready"); }}
      onPlaying={() => {
        clearConnectTimer(); setPlaying(true); setStatus("playing"); setErrorMessage("");
        const currentTrack = trackRef.current;
        if (currentTrack) {
          rememberRecent(currentTrack);
          setFailedTrackIds((current) => current.filter((id) => id !== currentTrack.id));
        }
      }}
      onPause={() => setPlaying(false)}
      onWaiting={() => { if (trackRef.current?.isLive) setStatus("loading"); }}
      onStalled={() => {
        if (!trackRef.current?.isLive) return;
        setStatus("stalled");
        clearConnectTimer();
        connectTimerRef.current = window.setTimeout(() => recoverRef.current?.("توقف البث ولم يستأنف تلقائيًا."), LIVE_CONNECT_TIMEOUT);
      }}
      onError={() => recoverRef.current?.(mediaErrorMessage(audioRef.current?.error))}
      onEnded={() => {
        if (trackRef.current?.onEnded) {
          const hasNext = trackRef.current.onEnded();
          if (hasNext === false) { setPlaying(false); setStatus("ended"); }
        } else if (repeat) audioRef.current?.play().catch(() => failRef.current?.("تعذّر تكرار الصوت."));
        else { setPlaying(false); setStatus("ended"); }
      }}
    />
    {track && <aside className={`global-player ${expanded ? "expanded" : ""} ${status === "error" ? "has-error" : ""}`} aria-label="مشغل الصوت">
      <button className="player-cover" type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "تصغير المشغل" : "توسيع المشغل"}><img src={track.img || "/img/logo.png"} alt="" /></button>
      <div className="player-copy"><span className={`${track.isLive ? "live-state" : "track-state"} ${status === "error" ? "is-error" : ""}`}>{stateLabel}</span><strong>{track.name}</strong><small>{track.writer}</small></div>
      <div className="player-controls"><button type="button" className="player-main" onClick={toggle} aria-label={playing ? "إيقاف مؤقت" : status === "error" ? "إعادة المحاولة" : "تشغيل"}>{playing ? <FaPause /> : status === "error" ? <FaRedo /> : <FaPlay />}</button><button type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "تصغير" : "توسيع"}>{expanded ? <FaChevronDown /> : <FaExpand />}</button><button type="button" onClick={close} aria-label="إغلاق المشغل"><FaTimes /></button></div>
      {status === "error" && <div className="player-error" role="status"><span>{errorMessage}</span><button type="button" onClick={retry}><FaRedo /> إعادة المحاولة</button></div>}
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
