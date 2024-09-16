import { useEffect, useState } from "react";
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
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

      <Box className={"audio-select"} fullWidth style ={{minWidth:"100%",direction:"rtl",marginBottom:"20px"}} >
      <FormControl fullWidth style ={{direction:"rtl"}}>
        <InputLabel         className="audio-label" style={{color:"#fff",fontFamily:"Readex-light"}} id="select-reader">أختر القارئ</InputLabel>
        <Select
        className="audio-select"
        style={{color:"#fff",fontFamily:"Readex-light"}}
          labelId="select-reader"
          id="theReader"
          value={inputsSelect.userId}
          label="أختر القارئ"
          onChange={(event) => {
            setInputsSelect(
              (prev) => (prev = { ...prev, userId: event.target.value })
            );
            setInputsSelect((prev) => (prev = { ...prev, reway: "" }));
            setServerAdio("");
          }}
        >
          {reader.length > 0 &&
          reader.map((pharson) => (
            <MenuItem style ={{fontFamily:"Readex-light",fontSize:"14px"}} key={pharson.id} value={pharson.id}>
              {pharson.name}
            </MenuItem>
          ))}

        </Select>
      </FormControl>
    </Box>
      <Box className={"audio-select"} fullWidth style ={{minWidth:"100%",direction:"rtl"}} >
      <FormControl fullWidth style ={{direction:"rtl",color:"#fff"}}>
        <InputLabel
              className="audio-label"
  style ={{direction:"rtl",color:"#fff",fontFamily:"Readex-light"}} id="select-rewaya">اختر الرواية</InputLabel>
        <Select
        className="audio-select"
        style ={{direction:"rtl",color:"#fff",fontFamily:"Readex-light"}}
          labelId="select-rewaya"
          id="the rewaya"
          label="أختر الرواية"
          onChange={(event) => {
            setInputsSelect(
              (prev) => (prev = { ...prev, reway: event.target.value })
            );
          }}
          // ? inputsSelect.reway : "s"
          value={inputsSelect.reway }
        >
          {rewaya.length > 0 &&
          rewaya.sort().map((rewaya) => (
            <MenuItem style ={{fontFamily:"Readex-light",fontSize:"14px"}} key={rewaya.id} value={rewaya.id}>
              {rewaya.name}
            </MenuItem>
          ))}



        </Select>
      </FormControl>
    </Box>

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
