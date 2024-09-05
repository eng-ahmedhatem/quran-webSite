import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Header from "./Component/Header/Header"
import React, { createContext, useEffect, useState } from "react"
import Nav from "./Component/Nav/Nav"
import Main from "./Component/Main/main"
import Footer from './Component/Footer/Footer';
import { Home } from './pages/Index';
export const MyContext = createContext(null)
export default function App() {
  const [them,setThem] = useState(null)
  gsap.registerPlugin(useGSAP);
  useEffect(()=>{
    if (localStorage.getItem('them')) {
      setThem(localStorage.getItem("them"))
      return
    }
    setThem("light")
  })
document.body.classList = them
  useGSAP(
    () => {
        // gsap code here...
        gsap.to('.looding', { 
          delay:1,
          scale :0,
          duration: 1,
          ease: "elastic.inOut(0, 0.3)",
          visibility:"hidden",
          display:"none",
          stagger: {
            amount: 0.1
          }
        });
    },
    { scope: "body" }
); // <-- scope is for selector text (optional)
  return (
    <>
  <MyContext.Provider value= {[them,setThem]}>
      <div className="looding">
      <span className="loader"></span>
    </div>
    <Header/>
    <Nav/>
    <Main>
      <Home/>
    </Main>
    <Footer/>
  </MyContext.Provider>
    </>
  )
}
