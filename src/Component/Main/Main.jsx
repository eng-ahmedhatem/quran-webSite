import React, { useContext , memo} from "react"
import "./main.css"
import { useEffect } from "react"

export default memo( function Main({children , btnTotop}) {
  useEffect(()=> {
    document.querySelector(".scrollTo_top").addEventListener("click",()=>{
      document.querySelector("main").scrollTop = 0
    })
    document.querySelector("main").addEventListener('scroll', ()=>{
        if(document.querySelector("main").scrollTop > 500){
          document.querySelector(".scrollTo_top").classList.add("showBtn")
        }else {
          document.querySelector(".scrollTo_top").classList.remove("showBtn")
        }
      });
},[])

  return (
    <main id="main">

      <div className='content'>
        {children}
      </div>
    </main>
  )
}
)
