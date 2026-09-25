import "./listen.css"
import Hero from "./Hero"
import { Outlet } from "react-router-dom"
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
