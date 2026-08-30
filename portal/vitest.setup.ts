import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL auto-cleanup relies on test globals; we run without them, so clean up
// the DOM between tests explicitly.
afterEach(() => {
  cleanup();
});
