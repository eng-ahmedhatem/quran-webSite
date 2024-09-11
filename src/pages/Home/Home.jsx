import React, { useContext, useEffect, useState } from "react"
import Section_header from "../../Component/Section_header/Section_header"
import "./home.css"
import { useNavigate } from "react-router-dom"
import { MyContext } from "../../App"
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
        <div  data-state="new" className="card listen" onClick={()=> Handel_transform("listen")}>
            <h2>اللاستــمـاع</h2>
        </div>
        <div  data-state="soon" className="card reade" >
            <h2>القــراءة</h2>
        </div>
        <div  data-state="new" className="card radio-homePage" onClick={()=> Handel_transform("radio")}>
            <h2>الراديو</h2>
        </div>
        <div  data-state="soon" className="card tv">
            <h2>تلفزيون مباشر</h2>
        </div>
        <div data-state="soon" className="card salah-time">
            <h2>مواقيت الصلاة</h2>
        </div>
    </div>
    </div>
    </>
  )
}
