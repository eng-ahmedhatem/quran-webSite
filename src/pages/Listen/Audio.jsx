import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router";
// import { AudioPlayer } from 'react-audio-player-component';
import AudioPlayer  from 'react-modern-audio-player';
import axios from 'axios';
import { memo } from 'react';
export default memo(function Audio() {
  const [isLoading,setIsLoading] = useState(true)
  const location = useLocation();
  if (location.state == null) {
    location.state = {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      sorah_id: 1,
      id: 112,
      ro: 112,
    };
  }
  const [inputsSelect,setInputsSelect] = useState({
    userId: location.state.id,
    reway: location.state.ro,
  })
  const [rewaya,setRewaya] = useState([])
  const [reader,setReader] = useState([])
  const [serverAudio , setServerAdio]= useState("")
  useEffect( ()=>{
    axios.get("https://mp3quran.net/api/v3/reciters")
    .then(res => {
      setReader(res.data.reciters)
      setIsLoading(false)
    })
    .catch((error)=> console.log(error))
    return (
      setReader([])
    )
  },[])
  const playList = [
    {
      name: 'name',
      writer: 'writer',
      img: 'image.jpg',
      src: serverAudio,
      id: 1,
    },
  ]
  useEffect(()=>{
    if (location.state.fromSlider){
      setInputsSelect(prev => prev = {
        userId: location.state.id,
        reway: location.state.ro,
      })
    }
  },[location.state])
  useEffect(()=>{
    if(reader.length >0){
      const reway_arry = reader.filter(ele => ele.id == inputsSelect.userId)[0].moshaf
      setRewaya(reway_arry)
      if(inputsSelect.reway){
        let server = reway_arry.filter(ele => ele.id == inputsSelect.reway)[0].server
        server += `${location.state.sorah_id.toString().padStart(3,0)}.mp3`
        setServerAdio(server)
      }
    }
  },[location.state,reader,inputsSelect])
  return (
    <div className="Audio" style={{overflow:isLoading && "hidden"}}>
    <div className={isLoading ? "loading_section": "loading_section end"}>
    <span className="loader_section"></span>
    </div>
      <div className="row-1">
        <div className="img">
          <img src="/img/logo.png" alt="" />
        </div>
        <h2>
          {location.state.title && location.state.title}
        </h2>
      </div>

      <select value={inputsSelect.userId} name=""  onChange={(event)=>{
        setInputsSelect(prev=> (prev = {...prev,userId:event.target.value}))
        setInputsSelect(prev => prev = {...prev,reway:""})
      }}  >
        <option key={10201} value="j" disabled>
          اختر القارئ
        </option>
      {reader.length > 0 && reader.map(pharson => <option key={pharson.id} value={pharson.id}>{pharson.name}</option>)}
      </select>
      <select  onChange={(event)=>{
        setInputsSelect(prev => prev = {...prev,reway:event.target.value})
      }} value={inputsSelect.reway ? inputsSelect.reway : "s"} >
        <option key={10200} disabled value={"s"} >
          اختر الرواية
        </option>
      {rewaya.length > 0 && rewaya.sort().map(rewaya => <option key={rewaya.id} value={rewaya.id}>{rewaya.name}</option>)}
      </select>
      <a href={serverAudio} download>
        <img src={"/img/downloadBtn.png"} alt="downloadBtn.png" />
      </a>
      <div className="audio-ui">
      {serverAudio && <AudioPlayer
        playList={playList}
        audioInitialState={{
          muted: false,
          volume: 0.2,
          isPlaying:false,
          curPlayId: 1,
        }}
        placement={{
          interface: {
            templateArea: {
              trackTimeDuration: "row1-5",
              progress: "row1-4",
              playButton: "row1-6",
              repeatType: "row1-7",
              volume: "row1-8",
            },
          },
          player: "bottom-left",
        }}
        activeUI={{
          all: "all",
          progress: "waveform",
          trackInfo:false,
          playList:false,
          prevNnext:false
        }}
      />}
      </div> 
    </div>
  );
}
) 