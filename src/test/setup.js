import "@testing-library/jest-dom/vitest";

class MockIntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

globalThis.IntersectionObserver = MockIntersectionObserver;
