import React, { memo, useEffect, useState, useRef } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import {useNavigate } from "react-router";
import Section_header from "../../Component/Section_header/Section_header";
import { Search_component } from "../../Component/Header/Header";
import {get_SorahData ,Sorah_card,handelData_sorah} from "./Functions"
function CardSlider({ name, image, navigateAudio, data }) {
  return (
    <div className="slider" onClick={(e) => navigateAudio(data)}>
      <div className="img-slider">
        <img src={image} alt="" />
      </div>
      <h6>{name}</h6>
    </div>
  );
}

export default memo(function Hero() {
  const hero = useRef();
  const navigate = useNavigate();
  const [sorah, setSorah] = useState({});
  const [fillterSorah, setFillterSorah] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [sorahName_foreSearch, set_sorahName_foreSearch] = useState();
  // console.log(sorahName_foreSearch)
  useEffect(() => {
    if (innerWidth < 768 && location.pathname == "/listen") {
      document.querySelector(".hero").style.cssText = `
        display: block;
        flex-direction: none;
          `;
    }
    get_SorahData(setSorah , set_sorahName_foreSearch)
  }, []);
  useEffect(() => {
    handelData_sorah(sorah,sorahName_foreSearch,setFillterSorah,handelClick)
  }, [sorah, sorahName_foreSearch]);
  function handelClick(e) {
    if (innerWidth < 1600) {
      document.querySelector("main").scrollTop = 0;
    }
    const state = {
      title: e.currentTarget.title,
      sorah_id: e.currentTarget.id,
      id: 112,
      ro: 112,
    };
    navigate("/listen/audio", { state: state });
  }
  let handelSearch = (e) => {
    document.querySelector("main").scrollTop;
    setSearchVal((val) => (val = e.target.value));
    const newData = sorah.map((ele) => {
      if (ele.name_2.includes(e.target.value)) {
        return (
          <Sorah_card
            key={ele.number}
            transform={handelClick}
            sorahId={ele.number}
            title={ele.name}
            ayaCount={ele.numberOfAyahs}
            theClass={"show"}
          />
        );
      }
      return (
        <Sorah_card
          key={ele.number}
          transform={handelClick}
          sorahId={ele.number}
          title={ele.name}
          ayaCount={ele.numberOfAyahs}
          theClass={"hidden"}
        />
      );
    });
    setFillterSorah(newData);
  };
  const data = [
    {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      fromSlider: true,
      sorah_id: 1,
      id: 112,
      ro: 112,
      name: "محمد صديق المنشاوي",
      img: "/img/المنشاوي.jpg",
    },
    {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      fromSlider: true,
      sorah_id: 1,
      id: 118,
      ro: 270,
      name: "محمود خليل الحصري",
      img: "/img/الحصري.jpg",
    },
    {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      fromSlider: true,
      sorah_id: 1,
      id: 111,
      ro: 111,
      name: "محمد حسنين جبريل",
      img: "/img/محمد جبريل.jpg",
    },
    {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      fromSlider: true,
      sorah_id: 1,
      id: 51,
      ro: 53,
      name: "عبد الباسط عبد الصمد",
      img: "/img/عبد الباسط.jpg",
    },
    {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      fromSlider: true,
      sorah_id: 1,
      id: 102,
      ro: 102,
      name: "ماهر المعيقلي",
      img: "/img/ماهر المعيقلي.jpg",
    },
    {
      title: "سُورَةُ ٱلْفَاتِحَةِ",
      fromSlider: true,
      sorah_id: 1,
      id: 31,
      ro: 31,
      name: "سعود الشريم",
      img: "/img/سعود الشريم.jpg",
    },
  ];
  // console.log(fillterSorah)
  let handelNavegateAudio = (data) => {
    if (innerWidth < 1600)
      hero.current.parentElement.parentElement.scrollIntoView({
        behavior: "smooth",
      });
    navigate("/listen/audio", { state: data });
  };
  let l = fillterSorah.filter((ele) => ele.props.theClass == "hidden");
  return (
    <>
      <div className="hero" ref={hero}>
        <div className="row-">
          <Section_header title="أفضل القٌراء" />
          <Carousel
            customTransition={"transform 300ms linear"}
            additionalTransfrom={10}
            arrows
            autoPlay
            autoPlaySpeed={5000}
            className="carousel"
            containerClass="container-with-dots"
            dotListClass=""
            draggable
            focusOnSelect={false}
            infinite={true}
            minimumTouchDrag={80}
            pauseOnHover
            renderArrowsWhenDisabled={false}
            renderButtonGroupOutside={false}
            renderDotsOutside={false}
            responsive={{
              desktop: {
                breakpoint: {
                  max: 3000,
                  min: 1024,
                },
                items: 3,
                partialVisibilityGutter: 40,
              },
              mobile: {
                breakpoint: {
                  max: 464,
                  min: 0,
                },
                items: 1,
                partialVisibilityGutter: 10,
              },
              tablet: {
                breakpoint: {
                  max: 1024,
                  min: 464,
                },
                items: 2,
                partialVisibilityGutter: 30,
              },
            }}
            rewind={true}
            rewindWithAnimation={true}
            shouldResetAutoplay
            showDots={false}
            sliderClass=""
            slidesToSlide={1}
          >
            {data.map((item) => (
              <CardSlider
                data={{ ...item }}
                key={item.id}
                navigateAudio={handelNavegateAudio}
                name={item.name}
                image={item.img}
                ro={item.ro}
              />
            ))}
          </Carousel>
        </div>
        <div className="sorah">
          <Section_header title=" السُور " />
          <Search_component
            change={handelSearch}
            value={searchVal}
            id={"search-2"}
          />
          <div className="cards">
            {sorah.length > 0 && fillterSorah}
            {l.length == 114 && (
              <div className="noResults">
                <h4>مفيش حاجة بالإسم دا 🙂</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
