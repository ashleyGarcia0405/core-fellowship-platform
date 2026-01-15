const API_BASE = import.meta.env.VITE_API_BASE || "";

// Auth token management
const TOKEN_KEY = "auth_token";

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// HTTP helpers
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Auth types
export type UserType = "STUDENT" | "STARTUP" | "ADMIN";
export type UserRole = "ROLE_USER" | "ROLE_ADMIN";

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  userType: UserType;
  role: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: UserType;
  fullName?: string;
  companyName?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  userType: UserType;
  message: string;
}

// Auth API
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await postJson<LoginResponse>("/v1/auth/login", {
    email,
    password,
  });
  setAuthToken(response.accessToken);
  return response;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return postJson<RegisterResponse>("/v1/auth/register", data);
}

export function logout() {
  clearAuthToken();
}
