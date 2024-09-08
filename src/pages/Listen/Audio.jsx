import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router";
// import { AudioPlayer } from 'react-audio-player-component';
import AudioPlayer  from 'react-modern-audio-player';
import axios from 'axios';
export default function Audio() {
  const [Select_reway , setSelect_reway] = useState()
  const location = useLocation();
  if (location.state == null) {
    location.state = {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      sorah_id: 1,
      id: 112,
      ro: 112,
    };
  }
  const [Select_input_UserId , setSelect_input_UserId] = useState("")
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
    if(reader.length >0){
      const reway_arry = reader.filter(ele => ele.id == inputsSelect.userId)[0].moshaf
      setRewaya(reway_arry)
      console.log(inputsSelect.reway)
      if(inputsSelect.reway){
        let server = reway_arry.filter(ele => ele.id == inputsSelect.reway)[0].server
        server += `${location.state.sorah_id.toString().padStart(3,0)}.mp3`
        setServerAdio(server)
      }
      console.log(location.state)
    }
  },[reader,inputsSelect,location.state])
  return (
    <div className="Audio">
      <div className="row-1">
        <div className="img">
          <img src="/img/logo.png" alt="" />
        </div>
        <h2>
          {location.state.title && location.state.title}
        </h2>
      </div>

      <select value={inputsSelect.userId} name="" id="readerSelect" onChange={(event)=>{
        setInputsSelect(prev=> (prev = {...prev,userId:event.target.value}))
        setInputsSelect(prev => prev = {...prev,reway:""})
      }}  >
        <option key={10201} value="j" disabled>
          اختر القارئ
        </option>
      {reader.length > 0 && reader.map(pharson => <option key={pharson.id} value={pharson.id}>{pharson.name}</option>)}
      </select>
      <select id="rewaySelect" onChange={(event)=>{
        setInputsSelect(prev => prev = {...prev,reway:event.target.value})
      }} value={inputsSelect.reway ? inputsSelect.reway : "s"} >
        <option key={10200} disabled value={"s"} selected>
          اختر الرواية
        </option>
      {rewaya.length > 0 && rewaya.sort().map(rewaya => <option key={rewaya.id} value={rewaya.id}>{rewaya.name}</option>)}
      </select>
      <div className="audio-ui">
      {serverAudio && <AudioPlayer
        playList={playList}
        audioInitialState={{
          muted: false,
          volume: 0.5,
          isPlaying:true,
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
