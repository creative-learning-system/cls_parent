import { clearCache } from "./cache";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.creativelearningsystem.com";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name: string;
  // The API doesn't expose a "must change password" flag for parents yet
  // (see API_GAP_ANALYSIS.md, M1), so this is always false for now.
  require_password_change: boolean;
}

/* better-auth user object, as returned by /api/auth/sign-in/email */
interface ApiAuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
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

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem("access_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token"); // left over from the old backend
  localStorage.removeItem("auth_user");
  localStorage.removeItem("parent_id");
  clearCache();
}

/* Reads `message` from an error body; NestJS validation errors send an array. */
export async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    const msg = json?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string" && msg) return msg;
  } catch {}
  return fallback;
}

function authFetch(path: string, body: unknown, token?: string | null) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await authFetch("/api/auth/sign-in/email", { email, password });
  if (!res.ok) throw new Error(await readError(res, "Invalid email or password."));
  const { token, user } = (await res.json()) as { token: string; user: ApiAuthUser };
  const authUser: AuthUser = {
    id:                      user.id,
    email:                   user.email,
    role:                    user.role ?? "",
    full_name:               user.name,
    require_password_change: false,
  };
  saveSession(token, authUser);
  return authUser;
}

export async function logout(): Promise<void> {
  const token = getAccessToken();
  clearSession();
  // Revoke the session server-side; the local session is already gone either way.
  if (token) await authFetch("/api/auth/sign-out", {}, token).catch(() => {});
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await authFetch(
    "/api/auth/change-password",
    { currentPassword, newPassword, revokeOtherSessions: false },
    getAccessToken(),
  );
  if (!res.ok) throw new Error(await readError(res, "Password change failed"));

  // A new token is only issued when other sessions are revoked
  const json = (await res.json().catch(() => null)) as { token?: string | null } | null;
  if (json?.token) localStorage.setItem("access_token", json.token);

  // Update the stored user to clear the require_password_change flag
  const user = getUser();
  if (user) {
    user.require_password_change = false;
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await authFetch("/api/auth/request-password-reset", {
    email,
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (!res.ok) throw new Error(await readError(res, "Could not send reset link."));
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await authFetch("/api/auth/reset-password", { token, newPassword });
  if (!res.ok) throw new Error(await readError(res, "This reset link is invalid or has expired."));
}
