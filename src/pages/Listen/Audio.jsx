import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router";
// import { AudioPlayer } from 'react-audio-player-component';
import AudioPlayer  from 'react-modern-audio-player';
import axios from 'axios';
export default function Audio() {
  const [Select_input_UserId , setSelect_input_UserId] = useState()
  const [Select_reway , setSelect_reway] = useState()
  const location = useLocation();
  if (location.state == null) {
    location.state = {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      id: 1
    };
  }
  console.log(location.state.id.toString().padStart(3,0))
  const [reader,setReader] = useState([])
  const [rewaya,setRewaya] = useState([])
  const [serverAudio , setServerAdio]= useState("")
  // const [readerID,setReader_id] = useState('')
  useEffect( ()=>{
    // async function getReader() {
    // }
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
  

  if(!Select_input_UserId){
    setSelect_input_UserId("112")
    setSelect_reway("113")
  }
  useEffect(()=>{
    if(reader.length >0){
      const reway_arry = reader.filter(ele => ele.id == Select_input_UserId)[0].moshaf
      console.log(reway_arry)
      setRewaya(reway_arry)
      console.log(Select_reway)
      if(Select_reway) {
        let server = reway_arry.filter(ele => ele.id == Select_reway)[0].server
        server += `${location.state.id.toString().padStart(3,0)}.mp3`
        setServerAdio(server)
        console.log(server)
      }
    }
  },[Select_input_UserId,reader,Select_reway,location.state])
  console.log(Select_input_UserId,Select_reway)
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

      <select name="" id="readerSelect" onChange={(event)=>{
        setSelect_input_UserId(event.target.value)
        setSelect_reway(null)
      }} value={Select_input_UserId} >
        <option value="j" disabled>
          اختر القارئ
        </option>
      {reader.length > 0 && reader.sort().map(pharson => <option value={pharson.id}>{pharson.name}</option>)}
      </select>
      <select id="rewaySelect" onChange={(event)=>{
        setSelect_reway(event.target.value)
        console.log(serverAudio)
      }} value={Select_reway ? Select_reway : "s"} >
        <option disabled value={"s"} selected>
          اختر الرواية
        </option>
      {rewaya.length > 0 && rewaya.sort().map(rewaya => <option value={rewaya.id}>{rewaya.name}</option>)}
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
