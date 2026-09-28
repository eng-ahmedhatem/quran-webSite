import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { MyContext } from "../App";
import Nav from "../Component/Nav/Nav";

describe("mobile navigation", () => {
  it("keeps four primary destinations and exposes secondary services", () => {
    const { container } = render(<MyContext.Provider value={["light", vi.fn(), false, vi.fn()]}><MemoryRouter><Nav /></MemoryRouter></MyContext.Provider>);
    const mobileNav = container.querySelector("nav.mobile-navigation");
    expect(within(mobileNav).getAllByRole("link", { hidden: true })).toHaveLength(4);
    fireEvent.click(within(mobileNav).getByRole("button", { name: "المزيد", hidden: true }));
    const menu = screen.getByText("خدمات التطبيق").closest("aside");
    expect(within(menu).getByRole("link", { name: "الصلاة", hidden: true })).toHaveAttribute("href", "/timings");
    expect(within(menu).getByRole("link", { name: "المحفوظات", hidden: true })).toHaveAttribute("href", "/bookmarks");
  });
});
