import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Header from "./Component/Header/Header"
import React, { createContext, useEffect, useState ,useRef} from "react"
import Nav from "./Component/Nav/Nav"
import Main from "./Component/Main/Main"
import Footer from "./Component/Footer/Footer";
import UseAnimations from "react-useanimations";
import arrowUp from 'react-useanimations/lib/arrowUp';
import { Home, ListenLayout  , Audio} from "./pages/Index";
import Tv from "./pages/Tv/Tv";
import { BrowserRouter, createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider, Routes } from 'react-router-dom';
import Radio from "./pages/Radio/Radio";
import Timing from "./pages/Timing/Timing";
export const MyContext = createContext(null)
export default function App() {
  const [them,setThem] = useState(null)
  const [isLoading,setIsLoading] = useState(false)
  gsap.registerPlugin(useGSAP);
  useEffect(()=>{
    // btn_scrollToTop.current.classList.add("showBtn")
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
        gsap.to('.loading', {
          delay:0,
          scale :0,
          duration: 3,
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
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Route_layout/>}>
      <Route index element={<Home/>}/>
      <Route path='listen' element={<ListenLayout/>}>
      <Route path='audio' element={<Audio/>} />
      </Route>
    </Route>
  )
)

function Route_layout(){
return (
<>
<Header/>
    <Nav/>
    <Main>
      <div className={isLoading ? "loading_section": "loading_section end"}>
      <span className="loader_section"></span>
      </div>
      <div className={`scrollTo_top`} >
      <UseAnimations animation={arrowUp} size={56} />
      </div>
      <Outlet/>
    </Main>
    <Footer/>
</>
)
}
  return (
    <>
  <MyContext.Provider value= {[them,setThem,isLoading,setIsLoading]}>
      <div className="loading">
      <span className="loader"></span>
    </div>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Route_layout/>}>
        <Route index element={<Home/>}/>
        <Route path='listen' element={<ListenLayout/>}>
        <Route path='audio' element={<Audio/>} />
        </Route>
        <Route path='radio' element={<Radio/>} />
        <Route path='tv' element={<Tv/>} />
        <Route path='timings' element={<Timing/>} />
      </Route>
    </Routes>
    </BrowserRouter>
    {/* <RouterProvider router={router}/> */}
  </MyContext.Provider>
    </>
  )
}
