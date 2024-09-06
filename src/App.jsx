import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Header from "./Component/Header/Header"
import React, { createContext, useEffect, useState } from "react"
import Nav from "./Component/Nav/Nav"
import Main from "./Component/Main/main"
import Footer from './Component/Footer/Footer';
import { Home, Listen } from './pages/Index';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from 'react-router-dom';
export const MyContext = createContext(null)

export default function App() {
  const [them,setThem] = useState(null)
  const [isLoading,setIsLoading] = useState(false)
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
        gsap.to('.loading', { 
          delay:0,
          scale :0,
          duration: .3,
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
      <Route path='listen' element={<Listen/>}/>
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
    <RouterProvider router={router}/>
  </MyContext.Provider>
    </>
  )
}
