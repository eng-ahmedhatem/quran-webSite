import React, { useContext, useEffect, useState } from "react"
import Section_header from "../../Component/Section_header/Section_header"
import "./home.css"
import { useNavigate } from "react-router-dom"
import { MyContext } from "../../App"
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
let targetLink
export default function Home() {
    const [,,isLoading,setIsLoading]= useContext(MyContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoading) {
            setTimeout(()=>{
                navigate(targetLink)
                setIsLoading(false)
            },200)
        }
    }, [isLoading])
    function Handel_transform(link) {
        targetLink = link
        setIsLoading(true)
    }

  return (
    <>
    <div className="row-1">
    <Section_header title="الأقسام المتاحة"/>
    <div className="cards">
        <div  className="card " onClick={()=> Handel_transform("listen")}>
            <div className="card-content listen">
            <h2>اللاستــمـاع</h2>
            </div>
        </div>
        <div  data-state="soon" className="card " >
            <div className="card-content reade">

            <h2>القــراءة</h2>
            </div>
        </div>
        <div  className="card " onClick={()=> Handel_transform("radio")}>
            <div className="card-content radio-homePage">

            <h2>الراديو</h2>
            </div>
        </div>
        <div  className="card " onClick={()=> Handel_transform("tv")}>
            <div className="card-content tv">
            <h2>تلفزيون مباشر</h2>
            </div>
        </div>
        <div data-state="new" className="card " onClick={()=> Handel_transform("timings")}>
            <div className="card-content salah-time">

            <h2>مواقيت الصلاة</h2>
            </div>
        </div>
    </div>
    </div>
    </>
  )
}
