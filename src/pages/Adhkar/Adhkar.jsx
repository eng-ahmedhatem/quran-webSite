import { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck, FaCopy, FaRedo, FaSearch, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { normalizeArabic } from "../Listen/Functions";
import Breadcrumb from "../../Component/Breadcrumb/Breadcrumb";
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
  sleep: [
    { id: "s-muawidhat", title: "المعوذات قبل النوم", target: 3, source: "رواه البخاري", text: "قُلْ هُوَ اللَّهُ أَحَدٌ، وقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، وقُلْ أَعُوذُ بِرَبِّ النَّاسِ. تُقرأ في الكفين مع النفث، ثم يُمسح بهما ما استطاع من الجسد" },
    { id: "s-kursi", title: "آية الكرسي", target: 1, source: "رواه البخاري", text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ" },
    { id: "s-name", title: "باسمك أموت وأحيا", target: 1, source: "رواه البخاري", text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا" },
    { id: "s-side", title: "عند وضع الجنب", target: 1, source: "متفق عليه", text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ" },
    { id: "s-torment", title: "اللهم قني عذابك", target: 3, source: "رواه أبو داود والترمذي", text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ" },
    { id: "s-submit", title: "دعاء التسليم لله", target: 1, source: "متفق عليه", text: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ" },
    { id: "s-subhan", title: "سبحان الله", target: 33, source: "متفق عليه", text: "سُبْحَانَ اللَّهِ" },
    { id: "s-hamd", title: "الحمد لله", target: 33, source: "متفق عليه", text: "الْحَمْدُ لِلَّهِ" },
    { id: "s-akbar", title: "الله أكبر", target: 34, source: "متفق عليه", text: "اللَّهُ أَكْبَرُ" },
  ],
  waking: [
    { id: "w-life", title: "الحمد لله الذي أحيانا", target: 1, source: "رواه البخاري", text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ" },
    { id: "w-body", title: "العافية ورد الروح", target: 1, source: "رواه الترمذي", text: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ" },
    { id: "w-night", title: "ذكر الاستيقاظ في الليل", target: 1, source: "رواه البخاري", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، الْحَمْدُ لِلَّهِ، وَسُبْحَانَ اللَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، اللَّهُمَّ اغْفِرْ لِي" },
  ],
  afterPrayer: [
    { id: "p-astaghfir", title: "الاستغفار", target: 3, source: "رواه مسلم", text: "أَسْتَغْفِرُ اللَّهَ" },
    { id: "p-salam", title: "اللهم أنت السلام", target: 1, source: "رواه مسلم", text: "اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ" },
    { id: "p-tawhid", title: "لا إله إلا الله وحده", target: 1, source: "متفق عليه", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ" },
    { id: "p-subhan", title: "سبحان الله", target: 33, source: "رواه مسلم", text: "سُبْحَانَ اللَّهِ" },
    { id: "p-hamd", title: "الحمد لله", target: 33, source: "رواه مسلم", text: "الْحَمْدُ لِلَّهِ" },
    { id: "p-akbar", title: "الله أكبر", target: 33, source: "رواه مسلم", text: "اللَّهُ أَكْبَرُ" },
    { id: "p-complete", title: "تمام المائة", target: 1, source: "رواه مسلم", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ" },
    { id: "p-help", title: "أعني على ذكرك", target: 1, source: "رواه أبو داود والنسائي", text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ" },
  ],
  travel: [
    { id: "t-akbar", title: "التكبير عند الركوب", target: 3, source: "رواه مسلم", text: "اللَّهُ أَكْبَرُ" },
    { id: "t-ride", title: "دعاء الركوب والسفر", target: 1, source: "رواه مسلم", text: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ" },
    { id: "t-companion", title: "أنت الصاحب في السفر", target: 1, source: "رواه مسلم", text: "اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ" },
    { id: "t-return", title: "ذكر الرجوع من السفر", target: 1, source: "متفق عليه", text: "آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ" },
  ],
  home: [
    { id: "h-exit", title: "عند الخروج من البيت", target: 1, source: "رواه أبو داود والترمذي", text: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ" },
    { id: "h-exit-protection", title: "دعاء الحفظ عند الخروج", target: 1, source: "رواه أبو داود والترمذي", text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ" },
    { id: "h-enter", title: "عند دخول البيت", target: 1, source: "رواه أبو داود", text: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا" },
  ],
  mosque: [
    { id: "q-enter", title: "عند دخول المسجد", target: 1, source: "رواه مسلم", text: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ" },
    { id: "q-enter-protection", title: "الاستعاذة عند الدخول", target: 1, source: "رواه أبو داود", text: "أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ" },
    { id: "q-exit", title: "عند الخروج من المسجد", target: 1, source: "رواه مسلم", text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ" },
    { id: "q-salawat", title: "الصلاة والسلام على النبي", target: 1, source: "رواه أبو داود", text: "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ" },
  ],
};

const CATEGORY_META = {
  morning: { label: "أذكار الصباح", icon: "☀", eyebrow: "بداية مطمئنة ليومك" },
  evening: { label: "أذكار المساء", icon: "☾", eyebrow: "سكينة تحفظ ليلتك" },
  sleep: { label: "أذكار النوم", icon: "◐", eyebrow: "اختم يومك بطمأنينة" },
  waking: { label: "أذكار الاستيقاظ", icon: "↥", eyebrow: "أول ما يبدأ به يومك" },
  afterPrayer: { label: "بعد الصلاة", icon: "۞", eyebrow: "ذكرٌ دبر كل صلاة" },
  travel: { label: "دعاء السفر", icon: "✦", eyebrow: "رفيق الطريق" },
  home: { label: "دخول وخروج البيت", icon: "⌂", eyebrow: "ذكر البيت وحفظه" },
  mosque: { label: "دعاء المسجد", icon: "♢", eyebrow: "بين أبواب الرحمة والفضل" },
};

const CATEGORY_KEYS = Object.keys(CATEGORY_META);

const todayKey = () => new Date().toLocaleDateString("en-CA");
const readCounts = (category) => {
  try { return JSON.parse(localStorage.getItem(`quran:adhkar:${todayKey()}:${category}`)) || {}; } catch { return {}; }
};

export function LegacyAdhkar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(() => {
    const requestedCategory = searchParams.get("category") || searchParams.get("period");
    if (CATEGORY_KEYS.includes(requestedCategory)) return requestedCategory;
    return new Date().getHours() >= 16 || new Date().getHours() < 4 ? "evening" : "morning";
  });
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState(() => Object.fromEntries(CATEGORY_KEYS.map((key) => [key, readCounts(key)])));
  const [muted, setMuted] = useState(() => localStorage.getItem("quran:adhkar-muted") === "true");
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);
  const audioContextRef = useRef(null);
  const pulseTimerRef = useRef(null);
  const list = ADHKAR[category];
  const item = list[index];
  const count = Math.min(counts[category][item.id] || 0, item.target);
  const complete = count >= item.target;
  const completedItems = list.filter((dhikr) => (counts[category][dhikr.id] || 0) >= dhikr.target).length;
  const totalRepeats = list.reduce((sum, dhikr) => sum + dhikr.target, 0);
  const doneRepeats = list.reduce((sum, dhikr) => sum + Math.min(counts[category][dhikr.id] || 0, dhikr.target), 0);
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

  const changeCategory = (nextCategory) => {
    setCategory(nextCategory);
    setSearchParams({ category: nextCategory }, { replace: true });
    setIndex(0);
    setCopied(false);
  };

  const increment = () => {
    if (complete) return;
    playTap();
    const nextCount = count + 1;
    if ("vibrate" in navigator) navigator.vibrate(nextCount >= item.target ? [35, 35, 70] : 28);
    setCounts((current) => {
      const next = { ...current, [category]: { ...current[category], [item.id]: nextCount } };
      localStorage.setItem(`quran:adhkar:${todayKey()}:${category}`, JSON.stringify(next[category]));
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
      const nextCategory = { ...current[category], [item.id]: 0 };
      localStorage.setItem(`quran:adhkar:${todayKey()}:${category}`, JSON.stringify(nextCategory));
      return { ...current, [category]: nextCategory };
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
  const categoryMeta = CATEGORY_META[category];
  const pageLabel = categoryMeta.label;

  return <section className={`adhkar-page period-${category}`}>
    <div className="adhkar-hero">
      <div><span className="adhkar-eyebrow">{categoryMeta.eyebrow}</span><h1>{pageLabel}</h1><p>اقرأ بهدوء، واضغط العداد بعد كل مرة. يُحفظ تقدم اليوم تلقائيًا على هذا الجهاز.</p></div>
      <div className="adhkar-day-progress" style={{ "--day-progress": `${overallProgress}%` }}><span aria-hidden="true">{categoryMeta.icon}</span><strong>{overallProgress.toLocaleString("ar-EG")}%</strong><small>{completedItems.toLocaleString("ar-EG")} من {list.length.toLocaleString("ar-EG")} مكتملة</small></div>
    </div>

    <div className="adhkar-tabs" role="tablist" aria-label="اختر قسم الأذكار">
      {CATEGORY_KEYS.map((key) => <button type="button" key={key} role="tab" aria-selected={category === key} className={category === key ? "active" : ""} onClick={() => changeCategory(key)}><span aria-hidden="true">{CATEGORY_META[key].icon}</span>{CATEGORY_META[key].label}</button>)}
    </div>

    <div className="adhkar-workspace">
      <aside className="adhkar-list" aria-label={`قائمة ${pageLabel}`}>
        <div><span>الورد اليومي</span><strong>{doneRepeats.toLocaleString("ar-EG")} / {totalRepeats.toLocaleString("ar-EG")}</strong></div>
        {list.map((dhikr, itemIndex) => {
          const itemCount = Math.min(counts[category][dhikr.id] || 0, dhikr.target);
          const itemComplete = itemCount >= dhikr.target;
          return <button type="button" key={dhikr.id} className={itemIndex === index ? "active" : ""} onClick={() => setIndex(itemIndex)}><span>{itemComplete ? <FaCheck /> : (itemIndex + 1).toLocaleString("ar-EG")}</span><div><strong>{dhikr.title}</strong><small>{itemCount.toLocaleString("ar-EG")} من {dhikr.target.toLocaleString("ar-EG")}</small></div></button>;
        })}
      </aside>

      <article className="dhikr-card">
        <div className="dhikr-card-head"><div><span>{pageLabel} • الذكر {(index + 1).toLocaleString("ar-EG")}</span><h2>{item.title}</h2><small className="dhikr-source">{item.source || "حصن المسلم"}</small></div><div className="dhikr-utilities"><button type="button" onClick={copyDhikr} aria-label="نسخ الذكر">{copied ? <FaCheck /> : <FaCopy />}</button><button type="button" onClick={toggleSound} aria-label={muted ? "تشغيل صوت العداد" : "كتم صوت العداد"}>{muted ? <FaVolumeMute /> : <FaVolumeUp />}</button></div></div>
        <p className="dhikr-text">{item.text}</p>
        <div className="dhikr-counter-area">
          <button type="button" className={`dhikr-counter ${pulse ? "is-pulsing" : ""} ${complete ? "is-complete" : ""}`} style={{ "--count-angle": progressAngle }} onClick={increment} aria-label={complete ? "اكتمل الذكر" : `تسجيل تكرار، المتبقي ${item.target - count}`}>
            <span>{complete ? <FaCheck /> : count.toLocaleString("ar-EG")}</span>
            <small>{complete ? "اكتمل" : `من ${item.target.toLocaleString("ar-EG")}`}</small>
          </button>
          <div><strong>{complete ? "أحسنت، تم هذا الذكر" : `متبقي ${(item.target - count).toLocaleString("ar-EG")} مرة`}</strong><span>اضغط الدائرة بعد كل قراءة؛ مع صوت واهتزاز على الأجهزة الداعمة</span><button type="button" onClick={resetCurrent}><FaRedo /> تصفير هذا العداد</button></div>
        </div>
        <div className="dhikr-navigation"><button type="button" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}><FaArrowRight /> السابق</button><span>{(index + 1).toLocaleString("ar-EG")} / {list.length.toLocaleString("ar-EG")}</span><button type="button" disabled={index === list.length - 1} onClick={() => setIndex((current) => current + 1)}>التالي <FaArrowLeft /></button></div>
      </article>
    </div>
  </section>;
}

export default function Adhkar() {
  const [searchParams] = useSearchParams();
  const [counts, setCounts] = useState(() => Object.fromEntries(CATEGORY_KEYS.map((key) => [key, readCounts(key)])));
  const [muted, setMuted] = useState(() => localStorage.getItem("quran:adhkar-muted") === "true");
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [pulseId, setPulseId] = useState("");
  const audioContextRef = useRef(null);
  const pulseTimerRef = useRef(null);
  const copyTimerRef = useRef(null);
  const requestedCategory = searchParams.get("category") || searchParams.get("period");

  useEffect(() => {
    if (!CATEGORY_KEYS.includes(requestedCategory)) return;
    const scrollTimer = window.setTimeout(() => document.getElementById(`adhkar-${requestedCategory}`)?.scrollIntoView({ behavior: "auto", block: "start" }), 120);
    return () => window.clearTimeout(scrollTimer);
  }, [requestedCategory]);

  useEffect(() => () => {
    window.clearTimeout(pulseTimerRef.current);
    window.clearTimeout(copyTimerRef.current);
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
    oscillator.frequency.setValueAtTime(540, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(750, context.currentTime + .055);
    gain.gain.setValueAtTime(.024, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .07);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .075);
  }, [muted]);

  const increment = (categoryKey, item) => {
    const currentCount = Math.min(counts[categoryKey]?.[item.id] || 0, item.target);
    if (currentCount >= item.target) return;
    const nextCount = currentCount + 1;
    playTap();
    if ("vibrate" in navigator) navigator.vibrate(nextCount >= item.target ? [35, 35, 70] : 28);
    setCounts((current) => {
      const nextCategory = { ...current[categoryKey], [item.id]: nextCount };
      localStorage.setItem(`quran:adhkar:${todayKey()}:${categoryKey}`, JSON.stringify(nextCategory));
      return { ...current, [categoryKey]: nextCategory };
    });
    setPulseId("");
    window.clearTimeout(pulseTimerRef.current);
    requestAnimationFrame(() => {
      setPulseId(item.id);
      pulseTimerRef.current = window.setTimeout(() => setPulseId(""), 260);
    });
  };

  const resetItem = (categoryKey, item) => {
    setCounts((current) => {
      const nextCategory = { ...current[categoryKey], [item.id]: 0 };
      localStorage.setItem(`quran:adhkar:${todayKey()}:${categoryKey}`, JSON.stringify(nextCategory));
      return { ...current, [categoryKey]: nextCategory };
    });
  };

  const toggleSound = () => {
    setMuted((current) => {
      localStorage.setItem("quran:adhkar-muted", String(!current));
      return !current;
    });
  };

  const copyDhikr = async (item) => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopiedId(""), 1600);
    } catch { setCopiedId(""); }
  };

  const allItems = CATEGORY_KEYS.flatMap((key) => ADHKAR[key].map((item) => ({ ...item, categoryKey: key })));
  const totalRepeats = allItems.reduce((sum, item) => sum + item.target, 0);
  const doneRepeats = allItems.reduce((sum, item) => sum + Math.min(counts[item.categoryKey]?.[item.id] || 0, item.target), 0);
  const completedItems = allItems.filter((item) => (counts[item.categoryKey]?.[item.id] || 0) >= item.target).length;
  const overallProgress = Math.round((doneRepeats / totalRepeats) * 100);
  const normalizedQuery = normalizeArabic(query.trim());
  const visibleSections = CATEGORY_KEYS.map((key) => ({
    key,
    items: normalizedQuery ? ADHKAR[key].filter((item) => normalizeArabic(`${item.title} ${item.text}`).includes(normalizedQuery)) : ADHKAR[key],
  })).filter((section) => section.items.length);

  return <section className="adhkar-page adhkar-unified-page">
    <Breadcrumb items={[{ label: "الأذكار" }]} />
    <header className="adhkar-hero adhkar-unified-hero">
      <div className="adhkar-hero-copy"><span className="adhkar-eyebrow">موسوعة الأذكار اليومية</span><h1>وردك كله<br /><em>في مكان واحد</em></h1><p>من الصباح حتى النوم، اقرأ كل الأذكار في صفحة واحدة واحفظ تقدمك تلقائيًا على جهازك.</p><button type="button" className="adhkar-sound-toggle" onClick={toggleSound}>{muted ? <FaVolumeMute /> : <FaVolumeUp />} {muted ? "تشغيل صوت العداد" : "الصوت والاهتزاز مفعّلان"}</button></div>
      <div className="adhkar-hero-summary">
        <div className="adhkar-day-progress" style={{ "--day-progress": `${overallProgress}%` }}><span aria-hidden="true">۞</span><strong>{overallProgress.toLocaleString("ar-EG")}%</strong><small>تقدم ورد اليوم</small></div>
        <div className="adhkar-hero-stats"><div><strong>{CATEGORY_KEYS.length.toLocaleString("ar-EG")}</strong><span>أقسام</span></div><div><strong>{completedItems.toLocaleString("ar-EG")}</strong><span>ذكر مكتمل</span></div><div><strong>{allItems.length.toLocaleString("ar-EG")}</strong><span>ذكر ودعاء</span></div></div>
      </div>
    </header>

    <div className="adhkar-directory">
      <label className="adhkar-search"><FaSearch /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في كل الأذكار…" aria-label="البحث في الأذكار" />{query && <button type="button" onClick={() => setQuery("")} aria-label="مسح البحث">×</button>}</label>
      <nav aria-label="انتقل إلى قسم"><span>انتقل إلى</span><div>{CATEGORY_KEYS.map((key) => <a key={key} href={`#adhkar-${key}`}><i aria-hidden="true">{CATEGORY_META[key].icon}</i>{CATEGORY_META[key].label}</a>)}</div></nav>
    </div>

    <div className="adhkar-sections">
      {visibleSections.map(({ key, items }) => {
        const categoryCompleted = ADHKAR[key].filter((item) => (counts[key]?.[item.id] || 0) >= item.target).length;
        return <section className="adhkar-unified-section" id={`adhkar-${key}`} key={key}>
          <header className="adhkar-section-head"><span aria-hidden="true">{CATEGORY_META[key].icon}</span><div><small>{CATEGORY_META[key].eyebrow}</small><h2>{CATEGORY_META[key].label}</h2></div><strong>{categoryCompleted.toLocaleString("ar-EG")} / {ADHKAR[key].length.toLocaleString("ar-EG")} مكتملة</strong></header>
          <div className="adhkar-card-grid">
            {items.map((item) => {
              const count = Math.min(counts[key]?.[item.id] || 0, item.target);
              const complete = count >= item.target;
              const progressAngle = `${Math.round((count / item.target) * 360)}deg`;
              return <article className={`dhikr-unified-card ${complete ? "is-complete" : ""}`} key={item.id}>
                <div className="dhikr-unified-head"><div><h3>{item.title}</h3><small>{item.source || "حصن المسلم"}</small></div><button type="button" onClick={() => copyDhikr(item)} aria-label={`نسخ ${item.title}`}>{copiedId === item.id ? <FaCheck /> : <FaCopy />}</button></div>
                <p dir="rtl" lang="ar">{item.text}</p>
                <div className="dhikr-unified-footer">
                  <button type="button" className={`dhikr-mini-counter ${pulseId === item.id ? "is-pulsing" : ""}`} style={{ "--count-angle": progressAngle }} onClick={() => increment(key, item)} aria-label={complete ? `اكتمل ${item.title}` : `تسجيل تكرار ${item.title}، المتبقي ${item.target - count}`}><span>{complete ? <FaCheck /> : count.toLocaleString("ar-EG")}</span><small>{complete ? "تم" : `من ${item.target.toLocaleString("ar-EG")}`}</small></button>
                  <div><strong>{complete ? "أحسنت، اكتمل الذكر" : `متبقي ${(item.target - count).toLocaleString("ar-EG")}`}</strong><span>اضغط العداد بعد كل قراءة</span>{count > 0 && <button type="button" onClick={() => resetItem(key, item)}><FaRedo /> تصفير</button>}</div>
                </div>
              </article>;
            })}
          </div>
        </section>;
      })}
      {!visibleSections.length && <div className="adhkar-empty"><FaSearch /><h2>لا توجد نتيجة بهذا النص</h2><p>جرّب كلمة أقصر أو ابحث باسم الذكر.</p><button type="button" onClick={() => setQuery("")}>عرض كل الأذكار</button></div>}
    </div>
  </section>;
}
