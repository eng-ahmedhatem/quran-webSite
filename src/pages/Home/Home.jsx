import { useContext } from "react"
import Section_header from "../../Component/Section_header/Section_header"
import "./home.css"
import { useNavigate } from "react-router-dom"
import { MyContext } from "../../App"
export default function Home() {
    const [,,,setIsLoading]= useContext(MyContext)
    const navigate = useNavigate()

    function Handel_transform(link) {
        setIsLoading(true)
        navigate(link)
        window.setTimeout(() => setIsLoading(false), 250)
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
        <div className="card" onClick={()=> Handel_transform("read/1")}>
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
