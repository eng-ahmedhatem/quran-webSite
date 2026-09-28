import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaBell, FaBookOpen, FaChevronLeft, FaChevronRight, FaHeart, FaTimes } from "react-icons/fa";
import "./onboarding.css";

const STORAGE_KEY = "quran:onboarding-complete-v1";
const shouldShowOnboarding = () => {
  try { return localStorage.getItem(STORAGE_KEY) !== "true"; }
  catch { return true; }
};
const slides = [
  { icon: FaBookOpen, kicker: "مصحفك اليومي", title: "اقرأ بالطريقة التي تريحك", text: "اختر سورة أو جزءًا، اضبط حجم الخط وتباعد السطور، واستمع للآيات مع متابعة موضع التلاوة تلقائيًا." },
  { icon: FaHeart, kicker: "وردٌ قريب", title: "كل الأذكار في مكان واحد", text: "أذكار الصباح والمساء والنوم والصلاة والسفر، مع عدّاد وصوت واهتزاز وحفظ لتقدمك اليومي." },
  { icon: FaBell, kicker: "لا يفوتك الوقت", title: "تابع الصلاة بهدوء", text: "اختر مدينتك من صفحة المواقيت، وفعّل التنبيهات عندما تكون مستعدًا. يمكنك تغيير الإعدادات في أي وقت." },
];

export default function Onboarding() {
  const [visible, setVisible] = useState(shouldShowOnboarding);
  const [index, setIndex] = useState(0);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const slide = slides[index];
  const Icon = slide.icon;
  const finish = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* Continue when private storage is unavailable. */ }
    setVisible(false);
    window.dispatchEvent(new Event("quran:onboarding-complete"));
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const main = document.querySelector("main");
    const previousOverflow = main?.style.overflow;
    previousFocusRef.current = document.activeElement;
    document.body.classList.add("onboarding-active");
    if (main) main.style.overflow = "hidden";
    window.requestAnimationFrame(() => dialogRef.current?.querySelector("button")?.focus());
    const onKeyDown = (event) => {
      if (event.key === "Escape") finish();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])")];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("onboarding-active");
      if (main) main.style.overflow = previousOverflow || "";
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [finish, visible]);

  if (!visible) return null;

  return createPortal(<div className="onboarding-backdrop" role="presentation">
    <section ref={dialogRef} className="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-copy">
      <button className="onboarding-skip" type="button" onClick={finish}><FaTimes aria-hidden="true" /> تخطي</button>
      <div className="onboarding-visual" aria-hidden="true"><span><Icon /></span><i /><i /><i /></div>
      <div className="onboarding-copy" key={index}>
        <small>{slide.kicker}</small>
        <h1 id="onboarding-title">{slide.title}</h1>
        <p id="onboarding-copy">{slide.text}</p>
      </div>
      <div className="onboarding-footer">
        <div className="onboarding-dots" aria-label={`الخطوة ${index + 1} من ${slides.length}`}>{slides.map((_, dotIndex) => <button type="button" key={dotIndex} className={dotIndex === index ? "active" : ""} onClick={() => setIndex(dotIndex)} aria-label={`الانتقال إلى الخطوة ${dotIndex + 1}`} aria-current={dotIndex === index ? "step" : undefined} />)}</div>
        <div className="onboarding-actions">
          {index > 0 && <button type="button" className="onboarding-back" onClick={() => setIndex((current) => current - 1)}><FaChevronRight /> السابق</button>}
          <button type="button" className="onboarding-next" onClick={() => index === slides.length - 1 ? finish() : setIndex((current) => current + 1)}>{index === slides.length - 1 ? "ابدأ الآن" : "التالي"}<FaChevronLeft /></button>
        </div>
      </div>
    </section>
  </div>, document.body);
}
