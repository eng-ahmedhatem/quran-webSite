const VERSION = "quran-v3";
const APP_CACHE = `${VERSION}-app`;
const DATA_CACHE = `${VERSION}-data`;
const AUDIO_CACHE = `${VERSION}-audio`;
const SHELL = ["/", "/manifest.webmanifest", "/img/logo.png", "/quranApp.png", "/Fonts/ReadexPro.ttf"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

const canCache = (response) => response && (response.ok || response.type === "opaque");
async function networkFirst(request, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (canCache(response)) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (fallback ? await caches.match(fallback) : Response.error());
  }
}
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (canCache(response)) await cache.put(request, response.clone());
  return response;
}
async function trimCache(cacheName, maximumEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maximumEntries)).map((key) => cache.delete(key)));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (request.mode === "navigate") return event.respondWith(networkFirst(request, APP_CACHE, "/"));
  if (url.origin === location.origin) return event.respondWith(cacheFirst(request, APP_CACHE));
  if (["api.alquran.cloud", "api.aladhan.com", "www.mp3quran.net"].includes(url.hostname)) return event.respondWith(networkFirst(request, DATA_CACHE));
  if (url.hostname === "cdn.islamic.network" && url.pathname.includes("/quran/audio/") && !request.headers.has("range")) {
    event.respondWith(cacheFirst(request, AUDIO_CACHE).then((response) => { trimCache(AUDIO_CACHE, 180); return response; }));
  }
});

self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { payload = { body: event.data?.text() }; }
  event.waitUntil(self.registration.showNotification(payload.title || "موعد الصلاة", {
    body: payload.body || "حان الآن وقت الصلاة.", icon: "/img/logo.png", badge: "/img/logo.png",
    tag: payload.tag || "prayer-time", data: { url: payload.url || "/timings" }, dir: "rtl", lang: "ar",
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/timings";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => new URL(client.url).origin === location.origin);
    return existing ? existing.focus().then(() => existing.navigate(targetUrl)) : self.clients.openWindow(targetUrl);
  }));
});
