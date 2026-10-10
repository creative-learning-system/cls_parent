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

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/*
 * The API authenticates with an HttpOnly session cookie (it ignores bearer
 * tokens), so the stored user only tells the UI a session probably exists;
 * a 401 from the API is the real check.
 */
export function isAuthenticated(): boolean {
  return !!getUser();
}

export function saveSession(user: AuthUser) {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("access_token");  // left over from the old backend
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

function authFetch(path: string, body: unknown) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await authFetch("/api/auth/sign-in/email", { email, password });
  if (!res.ok) throw new Error(await readError(res, "Invalid email or password."));
  const { user } = (await res.json()) as { user: ApiAuthUser };
  const authUser: AuthUser = {
    id:                      user.id,
    email:                   user.email,
    role:                    user.role ?? "",
    full_name:               user.name,
    require_password_change: false,
  };
  saveSession(authUser);
  return authUser;
}

export async function logout(): Promise<void> {
  clearSession();
  // Revoke the session (and its cookie) server-side; the local session is already gone either way.
  await authFetch("/api/auth/sign-out", {}).catch(() => {});
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await authFetch("/api/auth/change-password", {
    currentPassword,
    newPassword,
    revokeOtherSessions: false,
  });
  if (!res.ok) throw new Error(await readError(res, "Password change failed"));

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
