import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("axios", () => ({ default: { create: () => ({ get: mocks.get }) } }));

import { getJuz, getSurahs } from "../services/api";

describe("Quran API resilience", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.get.mockReset();
  });

  it("loads and normalizes a juz response", async () => {
    mocks.get.mockResolvedValue({ data: { data: { number: 2, ayahs: [{ number: 149, text: "قُولُوا" }] } } });
    await expect(getJuz(2)).resolves.toMatchObject({ number: 2, ayahs: [{ number: 149, text: "قُولُوا" }] });
    expect(mocks.get).toHaveBeenCalledWith(expect.stringContaining("/juz/2/"));
  });

  it("surfaces an API failure when no cache exists", async () => {
    mocks.get.mockRejectedValue(new Error("offline"));
    await expect(getSurahs()).rejects.toThrow("offline");
  });

  it("uses stale cached data during an API outage", async () => {
    localStorage.setItem("quran:surahs:v2", JSON.stringify({ savedAt: 1, data: { data: [{ number: 1, name: "الفاتحة" }] } }));
    mocks.get.mockRejectedValue(new Error("offline"));
    await expect(getSurahs()).resolves.toEqual([{ number: 1, name: "الفاتحة" }]);
  });
});
