import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NetworkStatus from "../Component/NetworkStatus/NetworkStatus";

describe("network status feedback", () => {
  it("announces when the browser goes offline", () => {
    render(<NetworkStatus />);
    act(() => window.dispatchEvent(new Event("offline")));
    expect(screen.getByRole("status")).toHaveTextContent("أنت الآن دون إنترنت");
  });
});
