import React, { useEffect ,useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useNavigate } from "react-router";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowLeft } from "react-icons/md";
import Section_header from "../../Component/Section_header/Section_header";
import { Search_component } from "../../Component/Header/Header";
import axios from "axios";
import { Navigate } from "react-router";
function CardSlider({name , image , navigateAudio , data}){
    return(
        <div className="slider" onClick={(e)=> navigateAudio(data)}>
            <div className="img-slider">
                <img src={image} alt="" />
            </div>
            <h6>{name}</h6>
        </div>
    )
}
function Sorah_card({sorahId,title,ayaCount,theClass,transform}) {
    return(
        <div title={title} onClick={(e)=> transform(e)} className={`card-sorah ${theClass}`} id={sorahId}>
            <span className="sorahId">
                {sorahId}
            </span>
            <h5 className="title">
                {title}
            </h5>
            <span className="ayaCount">
            {ayaCount}  أيه
            </span>
        </div>
    )
}
export default function Hero() {

  const navigate = useNavigate();
    const [sorah, setSorah] = useState({})
    const [fillterSorah, setFillterSorah] = useState([])
    const [searchVal, setSearchVal] = useState("")
    useEffect(()=>{
        async function getData(url){
        try {
            await axios.get(url
            ).then(res=>setSorah(res.data.data))
        }catch (error) {
            console.log(error)
        }
        }
        getData("https://api.alquran.cloud/v1/surah")
        return (
            setSorah([])
        )
    },[])
    useEffect(()=>{
      if(sorah.length > 0){
         setFillterSorah(prev => prev = sorah.map(ele => <Sorah_card transform={handelClick} key={ele.number} sorahId={ele.number} title={ele.name} ayaCount={ele.numberOfAyahs} theClass={"show"}/>))
      }
    },[sorah])
    function handelClick(e) {
      console.log(e.currentTarget)
      const state = {
        title:e.currentTarget.title,
        id:e.currentTarget.id
      }
      navigate("/listen/audio",{state : state})
    }
    let handelSearch = (e)=>{    
      e.target.scrollIntoView({ behavior: "smooth" })
      setSearchVal(val => val = e.target.value)
            const newData = sorah.map(ele => {
              if(ele.name.includes(e.target.value)){
                return <Sorah_card key={ele.number} transform={handelClick} sorahId={ele.number} title={ele.name} ayaCount={ele.numberOfAyahs} theClass={"show"}/>
              }
              return <Sorah_card key={ele.number}  transform={handelClick} sorahId={ele.number} title={ele.name} ayaCount={ele.numberOfAyahs} theClass={"hidden"}/>
            })
            setFillterSorah(newData)  
    }
    const responsive = {
        superLargeDesktop: {
          // the naming can be any, depends on you.
          breakpoint: { max: 4000, min: 3000 },
          items: 5
        },
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 3
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 2
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1
        }
      };
      const data = [
        {title:"سُورَةُ ٱلْفَاتِحَةِ",sorah_id:1,id:122,ro:112,name:"محمد صديق المنشاوي",img:"/img/المنشاوي.jpg"},
        {title:"سُورَةُ ٱلْفَاتِحَةِ",sorah_id:1,id:118,ro:270,name:"محمود خليل الحصري",img:"/img/الحصري.jpg"},
        {title:"سُورَةُ ٱلْفَاتِحَةِ",sorah_id:1,id:111,ro:111,name:"محمد حسنين جبريل",img:"/img/محمد جبريل.jpg"},
        {title:"سُورَةُ ٱلْفَاتِحَةِ",sorah_id:1,id:51,ro:53,name:"عبد الباسط عبد الصمد",img:"/img/عبد الباسط.jpg"},
        {title:"سُورَةُ ٱلْفَاتِحَةِ",sorah_id:1,id:102,ro:102,name:"ماهر المعيقلي",img:"/img/ماهر المعيقلي.jpg"},
        {title:"سُورَةُ ٱلْفَاتِحَةِ",sorah_id:1,id:31,ro:31,name:"سعود الشريم",img:"/img/سعود الشريم.jpg"}
      ]
      // console.log(fillterSorah)
      let handelNavegateAudio = (data)=>{
        navigate("/listen/audio",{state : data })
      }
      let l = fillterSorah.filter(ele => ele.props.theClass == "hidden")
      return (
<>
<div className="hero">
<Carousel
customTransition={"transform 300ms linear"}
  additionalTransfrom={10}
  arrows
  customLeftArrow={<MdKeyboardArrowLeft className="arrow arrow-left"/>}
  customRightArrow={<MdKeyboardArrowRight className="arrow arrow-right" />}
  autoPlay
  autoPlaySpeed={5000}
  className="carousel"
  containerClass="container-with-dots"
  dotListClass=""
  draggable
  focusOnSelect={false}
  infinite={true}
  itemClass=""
  minimumTouchDrag={80}
  pauseOnHover
  renderArrowsWhenDisabled={false}
  renderButtonGroupOutside={false}
  renderDotsOutside={false}
  responsive={{
    desktop: {
      breakpoint: {
        max: 3000,
        min: 1024
      },
      items: 3,
      partialVisibilityGutter: 40
    },
    mobile: {
      breakpoint: {
        max: 464,
        min: 0
      },
      items: 1,
      partialVisibilityGutter: 10
    },
    tablet: {
      breakpoint: {
        max: 1024,
        min: 464
      },
      items: 2,
      partialVisibilityGutter: 30
    }
  }}
  rewind={true}
  rewindWithAnimation={true}
  shouldResetAutoplay
  showDots={false}
  sliderClass=""
  slidesToSlide={1}
>
 {data.map((item ) => <CardSlider data={{...item}} key={item.id} navigateAudio={handelNavegateAudio} name={item.name} image={item.img}  ro={item.ro}/>)}
</Carousel>
<div className="sorah">
<Section_header title="السُور" />
<Search_component change={handelSearch} value={searchVal}/>
<div className="cards">
{sorah.length > 0 && fillterSorah}
{l.length == 114 && <div className="noResults"><h4>لا يوجد نتائج</h4><p>تأكد من كتابة اول ثلاث احرف فقط من اسم السورة</p></div>}
</div>
</div>
  </div>
  </>
      )
}
