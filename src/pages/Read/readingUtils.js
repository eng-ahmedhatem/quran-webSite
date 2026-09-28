const BASMALA_PREFIX = /^\s*ب\p{M}*س\p{M}*م\p{M}*\s+[ٱا]\p{M}*ل\p{M}*ل\p{M}*ه\p{M}*\s+[ٱا]\p{M}*ل\p{M}*ر\p{M}*ح\p{M}*م\p{M}*ن\p{M}*\s+[ٱا]\p{M}*ل\p{M}*ر\p{M}*ح\p{M}*ي\p{M}*م\p{M}*\s*/u;
const DIRECTION_CONTROLS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

export const cleanQuranText = (text = "") => text.replace(DIRECTION_CONTROLS, "").trim();

export const displayAyahText = (ayah, surah) => {
  const text = cleanQuranText(ayah.text);
  return ayah.numberInSurah === 1 && surah.number !== 1 && surah.number !== 9
    ? text.replace(BASMALA_PREFIX, "").trim()
    : text;
};

export const nextSequenceIndex = (currentIndex, length) => currentIndex + 1 < length ? currentIndex + 1 : null;
