import { describe, expect, it } from "vitest";
import { matchRoutes } from "react-router-dom";
import { APP_ROUTE_PATHS, routeTitleFor } from "../routes";

const cases = [
  ["/", "/"], ["/read", "/read"], ["/read/2", "/read/:surahNumber/:ayahNumber?"],
  ["/read/2/255", "/read/:surahNumber/:ayahNumber?"], ["/read/juz/30", "/read/juz/:juzNumber"],
  ["/listen", "/listen"], ["/listen/audio", "/listen/audio"], ["/adhkar", "/adhkar"],
  ["/bookmarks", "/bookmarks"], ["/radio", "/radio"], ["/tv", "/tv"], ["/timings", "/timings"],
];

describe("application routes", () => {
  it.each(cases)("matches %s", (url, expectedPattern) => {
    const matches = matchRoutes(APP_ROUTE_PATHS.map((path) => ({ path })), url);
    expect(matches?.at(-1)?.route.path).toBe(expectedPattern);
  });

  it("provides an Arabic title for bookmarks", () => {
    expect(routeTitleFor("/bookmarks")).toContain("الآيات المحفوظة");
  });
});
