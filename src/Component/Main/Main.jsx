import { memo, useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./main.css";

function Main({ children }) {
  const mainRef = useRef(null);
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const main = mainRef.current;
    const onScroll = () => {
      setShowTop(main.scrollTop > 500);
      const scrollable = main.scrollHeight - main.clientHeight;
      setProgress(scrollable > 0 ? Math.min(100, Math.round((main.scrollTop / scrollable) * 100)) : 0);
    };
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(onScroll);
    resizeObserver.observe(main);
    return () => {
      main.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <main id="main" ref={mainRef}>
      <div className="reading-progress" role="progressbar" aria-label="تقدمك في الصفحة" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
        <i style={{ width: `${progress}%` }} />
      </div>
      <button
        className={`scrollTo_top ${showTop ? "showBtn" : ""}`}
        type="button"
        aria-label="العودة إلى أعلى الصفحة"
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
      ><span>للأعلى</span><FaArrowUp aria-hidden="true" /></button>
      <div className="content">{children}</div>
    </main>
  );
}

export default memo(Main);
