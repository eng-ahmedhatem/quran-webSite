import axios from "axios";

const client = axios.create({ timeout: 12000 });

export const CAIRO_RADIO = {
  id: "cairo-quran-radio",
  name: "إذاعة القرآن الكريم من القاهرة",
  writer: "القاهرة • مصر • 98.2 FM",
  src: "https://n12.radiojar.com/8s5u5tpdtwzuv",
  url: "https://n12.radiojar.com/8s5u5tpdtwzuv",
  img: "/img/radio.png",
  isLive: true,
  country: "مصر",
  category: "إذاعة رسمية",
};

const readCache = (key) => {
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached && Date.now() - cached.savedAt < 1000 * 60 * 60 * 24) return cached.data;
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

async function cachedGet(key, url) {
  const cached = readCache(key);
  if (cached) return cached;
  const { data } = await client.get(url);
  return writeCache(key, data);
}

export async function getSurahs() {
  const response = await cachedGet("quran:surahs:v2", "https://api.alquran.cloud/v1/surah");
  return response.data;
}

export async function getSurah(number) {
  const response = await cachedGet(
    `quran:surah:${number}:v2`,
    `https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`,
  );
  return response.data;
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
    "quran:radios:v3",
    "https://www.mp3quran.net/api/v3/radios?language=ar",
  );
  return response.radios;
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
