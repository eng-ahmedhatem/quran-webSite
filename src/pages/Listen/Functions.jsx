import { getSurahs } from "../../services/api";

export function Sorah_card({ sorahId, title, ayaCount, theClass = "show", transform }) {
  return (
    <button title={title} onClick={transform} className={`card-sorah ${theClass}`} id={sorahId} type="button">
      <span className="sorahId">{sorahId}</span>
      <span className="title">{title}</span>
      <span className="ayaCount">{ayaCount} آية</span>
    </button>
  );
}

export const normalizeArabic = (value = "") => value
  .normalize("NFD")
  .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
  .replace(/[أإآٱ]/g, "ا")
  .replace(/ؤ/g, "و")
  .replace(/ئ/g, "ي")
  .replace(/ء/g, "")
  .replace(/ى/g, "ي")
  .replace(/ة/g, "ه")
  .replace(/ـ/g, "")
  .replace(/\s+/g, " ")
  .trim();

export async function get_SorahData(setSorah) {
  const surahs = await getSurahs();
  setSorah(surahs.map((surah) => ({ ...surah, name_2: normalizeArabic(surah.name.replace("سُورَةُ", "سورة")) })));
}

export function handelData_sorah(sorah, _unused, setFilteredSorah, handleClick) {
  if (!Array.isArray(sorah)) return;
  setFilteredSorah(sorah.map((item) => (
    <Sorah_card key={item.number} transform={handleClick} sorahId={item.number} title={item.name} ayaCount={item.numberOfAyahs} />
  )));
}
