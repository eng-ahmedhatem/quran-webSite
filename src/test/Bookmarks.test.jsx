import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import Bookmarks from "../pages/Bookmarks/Bookmarks";

describe("Bookmarks page", () => {
  beforeEach(() => localStorage.clear());

  it("shows an empty-state route to the Quran", () => {
    render(<MemoryRouter><Bookmarks /></MemoryRouter>);
    expect(screen.getByText("لم تحفظ أي آية بعد")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ابدأ القراءة/ })).toHaveAttribute("href", "/read");
  });

  it("filters and removes a saved ayah", () => {
    localStorage.setItem("quran:bookmarks", JSON.stringify([{ number: 2, surahNumber: 1, surahName: "سورة الفاتحة", ayahNumber: 2, text: "الحمد لله رب العالمين" }]));
    render(<MemoryRouter><Bookmarks /></MemoryRouter>);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "الحمد" } });
    expect(screen.getByText(/الحمد لله رب العالمين/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /حذف علامة/ }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    expect(screen.getByText("لم تحفظ أي آية بعد")).toBeInTheDocument();
  });
});
