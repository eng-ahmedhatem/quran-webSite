import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import axios from "axios";
import { memo } from "react";
import Audio_track from "../../Component/Audio_track/Audio_track";
export default memo(function Audio() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  if (location.state == null) {
    location.state = {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      sorah_id: 1,
      id: 112,
      ro: 112,
    };
  }
  const [inputsSelect, setInputsSelect] = useState({
    userId: location.state.id,
    reway: location.state.ro,
  });
  const [rewaya, setRewaya] = useState([]);
  const [reader, setReader] = useState([]);
  const [serverAudio, setServerAdio] = useState("");
  useEffect(() => {
    if (innerWidth < 768 && location.pathname == "/listen/audio") {
      document.querySelector(".hero").style.cssText = `
        display: flex;
        flex-direction: column-reverse;
      `;
      document.querySelector(".hero .Section_header").style.cssText = `
          margin-block: 40px;
          margin-bottom: 0;
      `;
    }
    scrollTo(0, 0);
    if (sessionStorage.getItem("audio_qranData")){
      setReader(JSON.parse(sessionStorage.getItem("audio_qranData")));
      setIsLoading(false);
    }
    else {
      axios
        .get("https://mp3quran.net/api/v3/reciters")
        .then((res) => {
          setReader(res.data.reciters);
          setIsLoading(false);
          console.log(reader)
        })
        .catch((error) => console.log(error));
        return setReader([]);
    }
  }, []);
  const playList = [
    {
      name: "name",
      writer: "writer",
      img: "image.jpg",
      src: serverAudio,
      id: 1,
    },
  ];
  useEffect(() => {
    if (location.state.fromSlider) {
      setInputsSelect(
        (prev) =>
          (prev = {
            userId: location.state.id,
            reway: location.state.ro,
          })
      );
    }
  }, [location.state]);
  useEffect(() => {
    if (reader.length > 0) {
      window.sessionStorage.setItem("audio_qranData", JSON.stringify(reader));
      if (innerWidth < 1600)
        document.querySelector("main").scrollIntoView({ behavior: "smooth" });
      const reway_arry = reader.filter(
        (ele) => ele.id == inputsSelect.userId
      )[0].moshaf;
      setRewaya(reway_arry);
      if (inputsSelect.reway) {
        let server = reway_arry.filter((ele) => ele.id == inputsSelect.reway)[0]
          .server;
        server += `${location.state.sorah_id.toString().padStart(3, 0)}.mp3`;
        setServerAdio(server);
      }
    }
  }, [location.state, reader, inputsSelect]);
  return (
    <div className="Audio" style={{ overflow: isLoading && "hidden" }}>
      <div className={isLoading ? "loading_section" : "loading_section end"}>
        <span className="loader_section"></span>
      </div>
      <div className="row-1">
        <div className="img">
          <img src="/img/logo.png" alt="" />
        </div>
        <h2>{location.state.title && location.state.title}</h2>
      </div>

      <select
        value={inputsSelect.userId}
        name=""
        onChange={(event) => {
          setInputsSelect(
            (prev) => (prev = { ...prev, userId: event.target.value })
          );
          setInputsSelect((prev) => (prev = { ...prev, reway: "" }));
          setServerAdio("");
        }}
      >
        <option key={10201} value="j" disabled>
          اختر القارئ
        </option>
        {reader.length > 0 &&
          reader.map((pharson) => (
            <option key={pharson.id} value={pharson.id}>
              {pharson.name}
            </option>
          ))}
      </select>
      <select
        onChange={(event) => {
          setInputsSelect(
            (prev) => (prev = { ...prev, reway: event.target.value })
          );
        }}
        value={inputsSelect.reway ? inputsSelect.reway : "s"}
      >
        <option key={10200} disabled value={"s"}>
          اختر الرواية
        </option>
        {rewaya.length > 0 &&
          rewaya.sort().map((rewaya) => (
            <option key={rewaya.id} value={rewaya.id}>
              {rewaya.name}
            </option>
          ))}
      </select>
      <a href={serverAudio} download>
        <img src={"/img/downloadBtn.png"} alt="downloadBtn.png" />
      </a>
      <div className="audio-ui">
        {serverAudio && (
        <Audio_track thePlayList={playList}/>
        )}
      </div>
    </div>
  );
});
