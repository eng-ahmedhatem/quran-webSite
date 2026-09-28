export const APP_ROUTE_PATHS = [
  "/",
  "/listen",
  "/listen/audio",
  "/read",
  "/read/:surahNumber/:ayahNumber?",
  "/read/juz/:juzNumber",
  "/adhkar",
  "/bookmarks",
  "/radio",
  "/tv",
  "/timings",
];

export const routeTitleFor = (pathname) => {
  const routeTitles = {
    listen: "الاستماع للقرآن الكريم",
    read: "قراءة القرآن الكريم",
    radio: "إذاعات القرآن الكريم",
    tv: "البث القرآني المباشر",
    timings: "مواقيت الصلاة",
    adhkar: "موسوعة الأذكار اليومية",
    bookmarks: "الآيات المحفوظة",
  };
  const section = pathname.split("/").filter(Boolean)[0];
  return section ? `${routeTitles[section] || "القرآن الكريم"} — القرآن الكريم` : "القرآن الكريم — قراءة واستماع وإذاعات مباشرة";
};
