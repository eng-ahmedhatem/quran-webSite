import axios from "axios";

const client = axios.create({ timeout: 12000 });

export const CAIRO_RADIO = {
  id: "cairo-quran-radio",
  name: "إذاعة القرآن الكريم من القاهرة",
  writer: "القاهرة • مصر • 98.2 FM",
  src: "https://n12.radiojar.com/8s5u5tpdtwzuv",
  url: "https://n12.radiojar.com/8s5u5tpdtwzuv",
  fallbackSrcs: [
    "https://stream.radiojar.com/8s5u5tpdtwzuv",
    "https://n0e.radiojar.com/8s5u5tpdtwzuv",
  ],
  img: "/img/radio.png",
  isLive: true,
  country: "مصر",
  category: "إذاعة رسمية",
};

const readCache = (key) => {
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached?.savedAt && cached?.data) return cached;
  } catch {
    localStorage.removeItem(key);
  }
  return null;
};

const writeCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage can be unavailable in private browsing; the request still succeeds.
  }
  return data;
};

async function cachedGet(key, url, maxAge = 1000 * 60 * 60 * 24) {
  const cached = readCache(key);
  if (cached && Date.now() - cached.savedAt < maxAge) return cached.data;
  try {
    const { data } = await client.get(url);
    return writeCache(key, data);
  } catch (error) {
    // A stale response is preferable to an empty application during a temporary API outage.
    if (cached?.data) return cached.data;
    throw error;
  }
}

const normalizeStreamUrl = (value) => {
  try {
    const url = new URL(String(value || "").trim());
    if (url.protocol === "http:") url.protocol = "https:";
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
};

const cleanStationName = (value) => String(value || "")
  .replace(/\*+/g, "")
  .replace(/-{2,}\s*$/g, "")
  .replace(/\s+/g, " ")
  .trim();

const describeStationVariant = (name, url) => {
  const slug = decodeURIComponent(new URL(url).pathname).toLowerCase();
  const variants = [
    [/mojawwad|mujawwad/, "المصحف المجوّد"],
    [/murattal|morattal/, "المصحف المرتل"],
    [/warsh/, "رواية ورش"],
    [/qaloon|qalun/, "رواية قالون"],
    [/khalaf/, "رواية خلف"],
  ];
  const match = variants.find(([pattern]) => pattern.test(slug));
  return match && !name.includes(match[1]) ? `${name} — ${match[1]}` : name;
};

const radioFallbacks = (url) => {
  try {
    const stream = new URL(url);
    if (stream.hostname.toLowerCase() === "backup.qurango.net") {
      stream.hostname = "qurango.net";
      return [stream.href];
    }
    if (stream.hostname.toLowerCase() === "qurango.net") {
      stream.hostname = "backup.qurango.net";
      return [stream.href];
    }
  } catch {
    // The invalid primary URL is filtered before this function is called.
  }
  return [];
};

const normalizeRadios = (items = []) => {
  const seenUrls = new Set();
  return items.flatMap((item) => {
    const url = normalizeStreamUrl(item?.url);
    const rawName = cleanStationName(item?.name);
    const name = url && rawName ? describeStationVariant(rawName, url) : rawName;
    if (!url || !name || seenUrls.has(url) || name.includes("ترجمة")) return [];
    seenUrls.add(url);
    return [{
      ...item,
      id: `radio-${item.id || encodeURIComponent(name)}`,
      name,
      url,
      src: url,
      fallbackSrcs: radioFallbacks(url),
    }];
  });
};

export async function getSurahs() {
  const response = await cachedGet("quran:surahs:v2", "https://api.alquran.cloud/v1/surah");
  return response.data;
}

export async function getSurah(number) {
  const response = await cachedGet(
    `quran:surah:${number}:v3`,
    `https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`,
  );
  return {
    ...response.data,
    ayahs: response.data.ayahs.map((ayah) => ({
      ...ayah,
      text: String(ayah.text || "").normalize("NFC"),
    })),
  };
}

export async function getJuz(number) {
  const response = await cachedGet(
    `quran:juz:${number}:v1`,
    `https://api.alquran.cloud/v1/juz/${number}/quran-uthmani`,
  );
  return {
    ...response.data,
    ayahs: response.data.ayahs.map((ayah) => ({
      ...ayah,
      text: String(ayah.text || "").normalize("NFC"),
    })),
  };
}

export async function getReciters() {
  const response = await cachedGet(
    "quran:reciters:v3",
    "https://www.mp3quran.net/api/v3/reciters?language=ar",
  );
  return response.reciters;
}

export async function getRadios() {
  const response = await cachedGet(
    "quran:radios:v4",
    "https://www.mp3quran.net/api/v3/radios?language=ar",
    1000 * 60 * 30,
  );
  return normalizeRadios(response.radios);
}

export async function getLiveTv() {
  const response = await cachedGet(
    "quran:live-tv:v1",
    "https://www.mp3quran.net/api/v3/live-tv?language=ar",
  );
  return response.livetv || [];
}

export async function getPrayerTimes(city) {
  const date = new Date().toISOString().slice(0, 10);
  const response = await cachedGet(
    `quran:prayers:${city}:${date}`,
    `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Egypt&method=5`,
  );
  return response.data;
}

export function toSurahAudio(server, surahNumber) {
  return `${server}${String(surahNumber).padStart(3, "0")}.mp3`;
}
