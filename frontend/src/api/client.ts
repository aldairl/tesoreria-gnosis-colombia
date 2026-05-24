import type { TesoreríaData } from "@/types/tesoreria";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function saveToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function login(
  username: string,
  password: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.trim(), password: password.trim() }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Credenciales incorrectas");
  }

  const { token } = await res.json();
  saveToken(token);
}

export async function generateExcel(data: TesoreríaData): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("No autenticado");

  // Convert mes_anio "YYYY-MM" → "YYYY-MM-01" for the backend
  const payload = {
    ...data,
    organizacion: {
      ...data.organizacion,
      mes_anio: `${data.organizacion.mes_anio}-01`,
    },
    salidas_admin: data.salidas_admin.map((item) => ({
      ...item,
      fecha: item.fecha || null,
    })),
  };

  const res = await fetch(`${BASE_URL}/excel/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error("Sesión expirada. Por favor iniciá sesión de nuevo.");
    }
    throw new Error("Error al generar el archivo");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="(.+)"/);
  a.download = match?.[1] || "tesoreria.xlsm";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
