import React from 'react'
import AudioPlayer from "react-modern-audio-player";
function Audio_track({thePlayList ,from_radio}) {
  let audioUi
if(from_radio){
  audioUi = {
    all: "all",
              progress: false,
              trackInfo: false,
              playList: false,
              prevNnext: false,
              repeatType:false,
              trackTime:false
  }
}else {
    audioUi = {
      all: "all",
                progress: "waveform",
                trackInfo: false,
                playList: false,
                prevNnext: false,
    }
  }
  let isthePlay =  from_radio ? true : false
  return (
    <>
    <AudioPlayer
            playList={thePlayList}
            audioInitialState={{
              muted: false,
              volume: 0.2,
              isPlaying: isthePlay,
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
            activeUI={audioUi}
          />
    </>
  )
}


export default React.memo(Audio_track)
