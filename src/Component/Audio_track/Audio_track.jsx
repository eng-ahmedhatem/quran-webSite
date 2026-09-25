import { memo } from "react";
import "./audio-track.css";

function Audio_track({ thePlayList = [], from_radio = false }) {
  const track = thePlayList[0];
  if (!track?.src) return null;
  return (
    <div className="native-audio-player">
      <img src={track.img || "/img/logo.png"} alt="" />
      <div className="track-copy"><strong>{track.name}</strong><small>{track.writer}</small></div>
      <audio key={track.src} controls autoPlay={from_radio} preload="metadata">
        <source src={track.src} type="audio/mpeg" />
        المتصفح لا يدعم تشغيل الصوت.
      </audio>
    </div>
  );
}

export default memo(Audio_track);
