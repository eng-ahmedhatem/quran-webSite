import React, { useEffect, useState } from "react";
// import "node_modules/video-react/dist/video-react.css"; // import css
import Section_header from "../../Component/Section_header/Section_header";
import "./tv.css";
export default function Tv() {
  const data = [
    {
      id: "1",
      name: "قناة القرآن الكريم",
      url: "https://www.youtube.com/embed/0O-BzXQw9fU?si=lEgVkHgrH-Y_xNOz",
    },
    {
      id: "2",
      name: "قناة السنة النبوية",
      url: "https://www.youtube.com/embed/SY8j_i2hVbc?si=0jrTs9Brk6kPMwPd",
    },
  ];
  const [server, setServer] = useState(data[0].url);
  const [isLoading, setIsLoading] = useState(false);
  function handelClick(card, e) {
    e.currentTarget.parentElement.style.cssText = "justify-content: center;";
    document
      .querySelectorAll(".tv .tv-content .cards .card")
      .forEach((ele) => ele.classList.remove("active"));
    e.currentTarget.classList.add("active");
    setIsLoading(true);
    setServer(card.url);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }

  return (
    <div className="tv">
      <Section_header title={"القنوات المتاحة"} />
      <div className="tv-content">
        <div className="video">
          {server && (
            <div
              className={isLoading ? "loading_section" : "loading_section end"}
            >
              <span className="loader_section"></span>
            </div>
          )}
          {server && (
            <iframe
              src={server}
              title="🔴 بث مباشر قناة السنة النبوية "
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          )}
        </div>
        <div className="cards">
          {data.map((ele) => (
            <div
              key={ele.id}
              id= {ele.id}
              onClick={(e) => handelClick(ele, e)}
              className={`card ${ele.id ==  1  && "active"}`}
            >
              <span>{ele.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
