import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "../Component/ErrorBoundary/ErrorBoundary";

function BrokenView() { throw new Error("broken"); }

describe("ErrorBoundary", () => {
  it("shows a recoverable Arabic error screen", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorBoundary><BrokenView /></ErrorBoundary>);
    expect(screen.getByRole("alert")).toHaveTextContent("تعذّر عرض هذه الصفحة");
    expect(screen.getByRole("button", { name: /إعادة التحميل/ })).toBeInTheDocument();
    console.error.mockRestore();
  });
});
