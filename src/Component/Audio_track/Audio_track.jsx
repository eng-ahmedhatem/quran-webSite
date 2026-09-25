import { memo } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { usePlayer } from "./PlayerContext";
import "./audio-track.css";

function Audio_track({ thePlayList = [], from_radio = false }) {
  const track = thePlayList[0];
  const player = usePlayer();
  if (!track?.src) return null;
  const item = { ...track, isLive: from_radio };
  const active = player.track?.id === item.id;
  return (
    <button className={`native-audio-player ${active ? "active" : ""}`} type="button" onClick={() => active ? player.toggle() : player.playTrack(item)}>
      <img src={track.img || "/img/logo.png"} alt="" />
      <div className="track-copy"><strong>{track.name}</strong><small>{track.writer}</small></div>
      <span className="inline-play">{active && player.playing ? <FaPause /> : <FaPlay />}</span>
    </button>
  );
}

export default memo(Audio_track);
