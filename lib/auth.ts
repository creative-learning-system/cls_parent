const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.creativelearningsystem.com";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  full_name: string;
  school_id: number | null;
  permissions: string[];
  require_password_change: boolean;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function saveSession(accessToken: string, refreshToken: string, user: AuthUser) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("auth_user");
}

export async function login(email: string, password: string): Promise<AuthUser & { require_password_change: boolean }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Login failed");
  const { access_token, refresh_token, user } = json.data;
  saveSession(access_token, refresh_token, user);
  return user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Password change failed");

  // Update the stored user to clear the require_password_change flag
  const user = getUser();
  if (user) {
    user.require_password_change = false;
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
}
