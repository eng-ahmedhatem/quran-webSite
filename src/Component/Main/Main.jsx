import { memo, useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./main.css";

function Main({ children }) {
  const mainRef = useRef(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const main = mainRef.current;
    const onScroll = () => setShowTop(main.scrollTop > 500);
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main id="main" ref={mainRef}>
      <button
        className={`scrollTo_top ${showTop ? "showBtn" : ""}`}
        type="button"
        aria-label="العودة إلى أعلى الصفحة"
        onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
      ><span>للأعلى</span><FaArrowUp aria-hidden="true" /></button>
      <div className="content">{children}</div>
    </main>
  );
}

export default memo(Main);
