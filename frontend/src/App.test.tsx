import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("@/pages/LoginPage", () => ({
  LoginPage: ({ onLogin }: { onLogin: () => void }) => (
    <button onClick={onLogin}>login-page</button>
  ),
}));

vi.mock("@/pages/FormPage", () => ({
  FormPage: ({ onLogout }: { onLogout: () => void }) => (
    <button onClick={onLogout}>form-page</button>
  ),
}));

describe("App — auth routing", () => {
  it("renders LoginPage when no token is stored", () => {
    render(<App />);
    expect(screen.getByText("login-page")).toBeInTheDocument();
  });

  it("renders FormPage when a token is already in localStorage", () => {
    localStorage.setItem("auth_token", "valid-jwt");
    render(<App />);
    expect(screen.getByText("form-page")).toBeInTheDocument();
  });

  it("transitions to FormPage after a successful login", async () => {
    render(<App />);
    await userEvent.click(screen.getByText("login-page"));
    expect(screen.getByText("form-page")).toBeInTheDocument();
  });

  it("transitions back to LoginPage after logout", async () => {
    localStorage.setItem("auth_token", "valid-jwt");
    render(<App />);
    await userEvent.click(screen.getByText("form-page"));
    expect(screen.getByText("login-page")).toBeInTheDocument();
  });
});
