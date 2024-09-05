import React,{useContext} from 'react'
import "./nav.css"
import { MyContext } from '../../App'
import { FaHome } from "react-icons/fa";

export default function Nav() {
    const [ them, setThem ] = useContext(MyContext)
    function handelThem() {
        if(them == "light"){
            setThem("dark")
            localStorage.setItem("them","dark")
        }else{
            setThem("light")
            localStorage.setItem("them","light")
        }
    }
  return (
    <nav>
        <div className="link">
        <a><i><FaHome /></i></a>
        <a><i>x</i></a>
        <a><i>x</i></a>
        </div>
        <div className="mode">
            <img src={them == "light" ? "./img/moon.png" : "./img/sun.png" } alt="" onClick={handelThem} />
        </div>
    </nav>
  )
}
