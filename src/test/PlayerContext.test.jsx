import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlayerProvider, usePlayer } from "../Component/Audio_track/PlayerContext";

function SequenceHarness() {
  const player = usePlayer();
  const playSequence = () => {
    const secondAyah = { id: "ayah-2", name: "الآية الثانية", src: "https://audio.test/2.mp3", sequence: true };
    player.playTrack({
      id: "ayah-1",
      name: "الآية الأولى",
      src: "https://audio.test/1.mp3",
      sequence: true,
      onEnded: () => {
        player.playTrack(secondAyah);
        return true;
      },
    });
  };

  return <><button type="button" onClick={playSequence}>ابدأ السورة</button><output>{player.track?.id || "none"}</output></>;
}

describe("Quran audio sequence", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("loads the next ayah when the current audio ends", async () => {
    const { container } = render(<PlayerProvider><SequenceHarness /></PlayerProvider>);
    fireEvent.click(screen.getByRole("button", { name: "ابدأ السورة" }));
    expect(screen.getByText("ayah-1")).toBeInTheDocument();
    const audio = container.querySelector("audio");
    Object.defineProperty(audio, "duration", { configurable: true, value: 120 });
    Object.defineProperty(audio, "currentTime", { configurable: true, value: 30, writable: true });
    fireEvent.durationChange(audio);
    fireEvent.timeUpdate(audio);
    expect(screen.getByRole("slider", { name: "موضع التلاوة" })).toHaveValue("30");

    fireEvent.ended(audio);
    expect(await screen.findByText("ayah-2")).toBeInTheDocument();
  });
});
