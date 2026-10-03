// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "../App";

describe("client-side navigation", () => {
  beforeEach(() => {
    // Newer Chrome returns a Promise from scroll methods. Effects must not return it.
    window.scrollTo = vi.fn(() => Promise.resolve()) as unknown as typeof window.scrollTo;
    // Keep catalog-backed pages in their loading state; this test is about routing.
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("survives navigating between pages when scrollTo returns a Promise", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <MemoryRouter initialEntries={["/nowhere"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText(/page never came/i)).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByText(/take me home/i));
    });

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status").textContent).toMatch(/unpacking the catalog/i);
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});
