import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { clearToken, generateExcel, isAuthenticated, login, saveToken } from "./client";
import type { TesoreríaData } from "@/types/tesoreria";

const API = "http://localhost:8000";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Token helpers ────────────────────────────────────────────────────────────

describe("isAuthenticated / saveToken / clearToken", () => {
  it("returns false when localStorage has no token", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("returns true after saving a token", () => {
    saveToken("jwt-abc");
    expect(isAuthenticated()).toBe(true);
  });

  it("returns false after clearing the token", () => {
    saveToken("jwt-abc");
    clearToken();
    expect(isAuthenticated()).toBe(false);
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe("login", () => {
  it("stores the token on a successful response", async () => {
    server.use(
      http.post(`${API}/auth/login`, () => HttpResponse.json({ token: "valid-jwt" }))
    );

    await login("admin", "secret");
    expect(isAuthenticated()).toBe(true);
  });

  it("throws the detail message from the error response", async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ detail: "Credenciales inválidas" }, { status: 401 })
      )
    );

    await expect(login("admin", "wrong")).rejects.toThrow("Credenciales inválidas");
  });

  it("throws the default message when the response has no detail field", async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({}, { status: 401 })
      )
    );

    await expect(login("admin", "wrong")).rejects.toThrow("Credenciales incorrectas");
  });
});

// ─── generateExcel ────────────────────────────────────────────────────────────

const minimalPayload: TesoreríaData = {
  organizacion: {
    diocesis: "CAUCA",
    codigo_diocesis: 23,
    santuario: "MICHAEL",
    codigo_santuario: 7,
    mes_anio: "2026-01",
  },
  miembros: [],
  otras_entradas: [],
  salidas_admin: [],
  salidas_1008: [],
  salidas_lumisial: [],
  actividades_lumisial: [],
  cuadre_caja: {
    comprobante_inicial: 100,
    recibo_desde: 1,
    recibo_hasta: 1,
    voucher_desde: 100,
    voucher_hasta: 100,
    saldo_anterior: 0,
    obolo: 0,
    cuentas_por_pagar: 0,
  },
};

describe("generateExcel", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws immediately when there is no auth token", async () => {
    await expect(generateExcel(minimalPayload)).rejects.toThrow("No autenticado");
  });

  it("clears the token and throws on a 401 response", async () => {
    saveToken("expired-jwt");
    server.use(
      http.post(`${API}/excel/generate`, () =>
        HttpResponse.json({}, { status: 401 })
      )
    );

    await expect(generateExcel(minimalPayload)).rejects.toThrow("Sesión expirada");
    expect(isAuthenticated()).toBe(false);
  });

  it("throws a generic error on any other non-ok response", async () => {
    saveToken("valid-jwt");
    server.use(
      http.post(`${API}/excel/generate`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    await expect(generateExcel(minimalPayload)).rejects.toThrow("Error al generar el archivo");
  });

  it("triggers an anchor click (file download) on a successful response", async () => {
    saveToken("valid-jwt");
    server.use(
      http.post(`${API}/excel/generate`, () =>
        new HttpResponse(new Blob(["xlsm-data"]), {
          status: 200,
          headers: {
            "Content-Disposition": 'attachment; filename="tesoreria_2026_01.xlsm"',
            "Content-Type": "application/vnd.ms-excel.sheet.macroEnabled.12",
          },
        })
      )
    );

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");
    await generateExcel(minimalPayload);

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
