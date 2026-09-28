import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Onboarding from "../Component/Onboarding/Onboarding";

describe("first-use onboarding", () => {
  beforeEach(() => localStorage.clear());

  it("explains the main features and remembers completion", () => {
    render(<Onboarding />);
    expect(screen.getByRole("dialog")).toHaveTextContent("اقرأ بالطريقة التي تريحك");
    fireEvent.click(screen.getByRole("button", { name: /التالي/ }));
    expect(screen.getByRole("dialog")).toHaveTextContent("كل الأذكار في مكان واحد");
    fireEvent.click(screen.getByRole("button", { name: /التالي/ }));
    fireEvent.click(screen.getByRole("button", { name: /ابدأ الآن/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem("quran:onboarding-complete-v1")).toBe("true");
  });
});
