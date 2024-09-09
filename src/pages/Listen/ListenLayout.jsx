import React from "react"
import "./listen.css"
import Hero from "./Hero"
import { Outlet } from "react-router"
import Section_header from "../../Component/Section_header/Section_header";
export default function Listen() {
  return (
    <section className='listen'>
    <div className="content">
      <Hero/>
      <Outlet/>
    </div>
    </section>
  )
}
