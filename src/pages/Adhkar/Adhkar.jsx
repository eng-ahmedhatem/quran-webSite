import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck, FaCopy, FaMoon, FaRedo, FaSun, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import "./adhkar.css";

const ADHKAR = {
  morning: [
    { id: "m-ayat-kursi", title: "آية الكرسي", target: 1, text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ" },
    { id: "m-ikhlas", title: "سورة الإخلاص", target: 3, text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ" },
    { id: "m-falaq", title: "سورة الفلق", target: 3, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ" },
    { id: "m-nas", title: "سورة الناس", target: 3, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ" },
    { id: "m-mulk", title: "أصبحنا وأصبح الملك لله", target: 1, text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ" },
    { id: "m-by-you", title: "اللهم بك أصبحنا", target: 1, text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ" },
    { id: "m-raditu", title: "رضيت بالله ربًّا", target: 3, text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا" },
    { id: "m-subhan", title: "سبحان الله وبحمده", target: 100, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ" },
  ],
  evening: [
    { id: "e-ayat-kursi", title: "آية الكرسي", target: 1, text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ" },
    { id: "e-ikhlas", title: "سورة الإخلاص", target: 3, text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ" },
    { id: "e-falaq", title: "سورة الفلق", target: 3, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ" },
    { id: "e-nas", title: "سورة الناس", target: 3, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ" },
    { id: "e-mulk", title: "أمسينا وأمسى الملك لله", target: 1, text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا" },
    { id: "e-by-you", title: "اللهم بك أمسينا", target: 1, text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ" },
    { id: "e-raditu", title: "رضيت بالله ربًّا", target: 3, text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا" },
    { id: "e-subhan", title: "سبحان الله وبحمده", target: 100, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ" },
  ],
};

const todayKey = () => new Date().toLocaleDateString("en-CA");
const readCounts = (period) => {
  try { return JSON.parse(localStorage.getItem(`quran:adhkar:${todayKey()}:${period}`)) || {}; } catch { return {}; }
};

export default function Adhkar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [period, setPeriod] = useState(() => {
    const requestedPeriod = searchParams.get("period");
    if (requestedPeriod === "morning" || requestedPeriod === "evening") return requestedPeriod;
    return new Date().getHours() >= 16 || new Date().getHours() < 4 ? "evening" : "morning";
  });
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState(() => ({ morning: readCounts("morning"), evening: readCounts("evening") }));
  const [muted, setMuted] = useState(() => localStorage.getItem("quran:adhkar-muted") === "true");
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);
  const audioContextRef = useRef(null);
  const pulseTimerRef = useRef(null);
  const list = ADHKAR[period];
  const item = list[index];
  const count = Math.min(counts[period][item.id] || 0, item.target);
  const complete = count >= item.target;
  const completedItems = list.filter((dhikr) => (counts[period][dhikr.id] || 0) >= dhikr.target).length;
  const totalRepeats = list.reduce((sum, dhikr) => sum + dhikr.target, 0);
  const doneRepeats = list.reduce((sum, dhikr) => sum + Math.min(counts[period][dhikr.id] || 0, dhikr.target), 0);
  const overallProgress = Math.round((doneRepeats / totalRepeats) * 100);

  useEffect(() => () => {
    window.clearTimeout(pulseTimerRef.current);
    audioContextRef.current?.close();
  }, []);

  const playTap = useCallback(() => {
    if (muted) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = audioContextRef.current || new AudioContext();
    audioContextRef.current = context;
    if (context.state === "suspended") context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(560, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(760, context.currentTime + .055);
    gain.gain.setValueAtTime(.025, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .07);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .075);
  }, [muted]);

  const changePeriod = (nextPeriod) => {
    setPeriod(nextPeriod);
    setSearchParams({ period: nextPeriod }, { replace: true });
    setIndex(0);
    setCopied(false);
  };

  const increment = () => {
    if (complete) return;
    playTap();
    const nextCount = count + 1;
    setCounts((current) => {
      const next = { ...current, [period]: { ...current[period], [item.id]: nextCount } };
      localStorage.setItem(`quran:adhkar:${todayKey()}:${period}`, JSON.stringify(next[period]));
      return next;
    });
    setPulse(false);
    window.clearTimeout(pulseTimerRef.current);
    requestAnimationFrame(() => {
      setPulse(true);
      pulseTimerRef.current = window.setTimeout(() => setPulse(false), 260);
    });
  };

  const resetCurrent = () => {
    setCounts((current) => {
      const nextPeriod = { ...current[period], [item.id]: 0 };
      localStorage.setItem(`quran:adhkar:${todayKey()}:${period}`, JSON.stringify(nextPeriod));
      return { ...current, [period]: nextPeriod };
    });
  };

  const toggleSound = () => {
    setMuted((current) => {
      localStorage.setItem("quran:adhkar-muted", String(!current));
      return !current;
    });
  };

  const copyDhikr = async () => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { setCopied(false); }
  };

  const progressAngle = `${Math.round((count / item.target) * 360)}deg`;
  const pageLabel = period === "morning" ? "أذكار الصباح" : "أذكار المساء";
  const periodIcon = period === "morning" ? <FaSun /> : <FaMoon />;

  return <section className={`adhkar-page period-${period}`}>
    <div className="adhkar-hero">
      <div><span className="adhkar-eyebrow">وردٌ يحفظ يومك</span><h1>{pageLabel}</h1><p>اقرأ بهدوء، واضغط العداد بعد كل مرة. يُحفظ تقدم اليوم تلقائيًا على هذا الجهاز.</p></div>
      <div className="adhkar-day-progress" style={{ "--day-progress": `${overallProgress}%` }}><span>{periodIcon}</span><strong>{overallProgress.toLocaleString("ar-EG")}%</strong><small>{completedItems.toLocaleString("ar-EG")} من {list.length.toLocaleString("ar-EG")} مكتملة</small></div>
    </div>

    <div className="adhkar-tabs" role="tablist" aria-label="اختر وقت الأذكار">
      <button type="button" role="tab" aria-selected={period === "morning"} className={period === "morning" ? "active" : ""} onClick={() => changePeriod("morning")}><FaSun /> أذكار الصباح</button>
      <button type="button" role="tab" aria-selected={period === "evening"} className={period === "evening" ? "active" : ""} onClick={() => changePeriod("evening")}><FaMoon /> أذكار المساء</button>
    </div>

    <div className="adhkar-workspace">
      <aside className="adhkar-list" aria-label={`قائمة ${pageLabel}`}>
        <div><span>الورد اليومي</span><strong>{doneRepeats.toLocaleString("ar-EG")} / {totalRepeats.toLocaleString("ar-EG")}</strong></div>
        {list.map((dhikr, itemIndex) => {
          const itemCount = Math.min(counts[period][dhikr.id] || 0, dhikr.target);
          const itemComplete = itemCount >= dhikr.target;
          return <button type="button" key={dhikr.id} className={itemIndex === index ? "active" : ""} onClick={() => setIndex(itemIndex)}><span>{itemComplete ? <FaCheck /> : (itemIndex + 1).toLocaleString("ar-EG")}</span><div><strong>{dhikr.title}</strong><small>{itemCount.toLocaleString("ar-EG")} من {dhikr.target.toLocaleString("ar-EG")}</small></div></button>;
        })}
      </aside>

      <article className="dhikr-card">
        <div className="dhikr-card-head"><div><span>{pageLabel} • الذكر {(index + 1).toLocaleString("ar-EG")}</span><h2>{item.title}</h2></div><div className="dhikr-utilities"><button type="button" onClick={copyDhikr} aria-label="نسخ الذكر">{copied ? <FaCheck /> : <FaCopy />}</button><button type="button" onClick={toggleSound} aria-label={muted ? "تشغيل صوت العداد" : "كتم صوت العداد"}>{muted ? <FaVolumeMute /> : <FaVolumeUp />}</button></div></div>
        <p className="dhikr-text">{item.text}</p>
        <div className="dhikr-counter-area">
          <button type="button" className={`dhikr-counter ${pulse ? "is-pulsing" : ""} ${complete ? "is-complete" : ""}`} style={{ "--count-angle": progressAngle }} onClick={increment} aria-label={complete ? "اكتمل الذكر" : `تسجيل تكرار، المتبقي ${item.target - count}`}>
            <span>{complete ? <FaCheck /> : count.toLocaleString("ar-EG")}</span>
            <small>{complete ? "اكتمل" : `من ${item.target.toLocaleString("ar-EG")}`}</small>
          </button>
          <div><strong>{complete ? "أحسنت، تم هذا الذكر" : `متبقي ${(item.target - count).toLocaleString("ar-EG")} مرة`}</strong><span>اضغط الدائرة بعد كل قراءة</span><button type="button" onClick={resetCurrent}><FaRedo /> تصفير هذا العداد</button></div>
        </div>
        <div className="dhikr-navigation"><button type="button" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}><FaArrowRight /> السابق</button><span>{(index + 1).toLocaleString("ar-EG")} / {list.length.toLocaleString("ar-EG")}</span><button type="button" disabled={index === list.length - 1} onClick={() => setIndex((current) => current + 1)}>التالي <FaArrowLeft /></button></div>
      </article>
    </div>
  </section>;
}
