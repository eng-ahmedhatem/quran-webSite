import { describe, expect, it } from "vitest";
import { cleanQuranText, displayAyahText, nextSequenceIndex } from "../pages/Read/readingUtils";

describe("Quran reading helpers", () => {
  it("removes hidden direction controls without altering Quran text", () => {
    expect(cleanQuranText("\u202bاللَّهُ أَحَدٌ\u202c")).toBe("اللَّهُ أَحَدٌ");
  });

  it("does not duplicate the basmala in a surah first ayah", () => {
    const ayah = { numberInSurah: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ يس" };
    expect(displayAyahText(ayah, { number: 36 })).toBe("يس");
  });

  it("moves through every ayah and stops after the last one", () => {
    expect(nextSequenceIndex(0, 3)).toBe(1);
    expect(nextSequenceIndex(1, 3)).toBe(2);
    expect(nextSequenceIndex(2, 3)).toBeNull();
  });
});
