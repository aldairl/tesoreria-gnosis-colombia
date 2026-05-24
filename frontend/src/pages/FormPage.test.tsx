import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  generateExcel: vi.fn(),
  clearToken: vi.fn(),
  isAuthenticated: vi.fn(),
  saveToken: vi.fn(),
}));

// Bypass zod validation so handleGenerate is always called on submit
vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: unknown) => ({ values: values ?? {}, errors: {} }),
}));

import { generateExcel, isAuthenticated } from "@/api/client";
import { FormPage } from "./FormPage";

const DRAFT_KEY = "tesoreria-draft";

async function navigateToStep5AndSubmit() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /datos finales/i }));
  await user.click(screen.getByRole("button", { name: /generar y descargar/i }));
}

describe("FormPage — session expiry on generate", () => {
  beforeEach(() => {
    vi.mocked(generateExcel).mockReset();
    vi.mocked(isAuthenticated).mockReset();
  });

  it("calls onLogout when generateExcel fails due to expired session", async () => {
    vi.mocked(generateExcel).mockRejectedValue(new Error("Sesión expirada"));
    vi.mocked(isAuthenticated).mockReturnValue(false);

    const onLogout = vi.fn();
    render(<FormPage onLogout={onLogout} />);

    await navigateToStep5AndSubmit();

    await waitFor(() => expect(onLogout).toHaveBeenCalledOnce());
  });

  it("shows error message when generateExcel fails for non-auth reasons", async () => {
    vi.mocked(generateExcel).mockRejectedValue(new Error("Error al generar el archivo"));
    vi.mocked(isAuthenticated).mockReturnValue(true);

    const onLogout = vi.fn();
    render(<FormPage onLogout={onLogout} />);

    await navigateToStep5AndSubmit();

    await waitFor(() =>
      expect(screen.getByText("Error al generar el archivo")).toBeInTheDocument()
    );
    expect(onLogout).not.toHaveBeenCalled();
  });

  it("preserves the draft when the session expires so data survives re-login", async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ saved: true }));
    vi.mocked(generateExcel).mockRejectedValue(new Error("Sesión expirada"));
    vi.mocked(isAuthenticated).mockReturnValue(false);

    const onLogout = vi.fn();
    render(<FormPage onLogout={onLogout} />);

    await navigateToStep5AndSubmit();

    await waitFor(() => expect(onLogout).toHaveBeenCalled());
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
  });
});
