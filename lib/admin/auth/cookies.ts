// Cookie phiên của FE. Backend không đặt cookie nào: token đi qua body JSON (POST /auth/login, /auth/refresh)
// và server Next cất vào các cookie dưới đây bằng applySessionCookies.
export const ADMIN_TOKEN_COOKIE = "admin_token";
export const ADMIN_REFRESH_COOKIE = "admin_rt";
export const ADMIN_REFRESHED_COOKIE = "admin_just_refreshed";

export type SessionTokens = {
  accessToken: string;
  refreshToken: string | null;
  refreshMaxAge: number | null;
};

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge?: number;
};

// Giao diện tối thiểu của `NextResponse.cookies` (và của kho cookie giả trong test).
export type CookieJar = {
  set(name: string, value: string, options: CookieOptions): unknown;
};

const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;
const REFRESHED_MARK_SECONDS = 10;
const REFRESH_COOKIE_PATH = "/api/admin";
const REFRESHED_MARK_PATH = "/admin";

function base() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
}

// Ghi cookie phiên của FE. `markRefreshed` đặt cookie dấu để layout không vòng lặp khi vừa refresh xong.
export function applySessionCookies(
  jar: CookieJar,
  session: SessionTokens,
  options: { markRefreshed?: boolean } = {},
): void {
  jar.set(ADMIN_TOKEN_COOKIE, session.accessToken, {
    ...base(),
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
  });
  if (session.refreshToken) {
    jar.set(ADMIN_REFRESH_COOKIE, session.refreshToken, {
      ...base(),
      path: REFRESH_COOKIE_PATH,
      ...(session.refreshMaxAge ? { maxAge: session.refreshMaxAge } : {}),
    });
  }
  if (options.markRefreshed) {
    jar.set(ADMIN_REFRESHED_COOKIE, "1", {
      ...base(),
      path: REFRESHED_MARK_PATH,
      maxAge: REFRESHED_MARK_SECONDS,
    });
  }
}

// Xóa cookie phiên: phải dùng đúng path lúc ghi thì trình duyệt mới xóa.
export function clearSessionCookies(jar: CookieJar): void {
  jar.set(ADMIN_TOKEN_COOKIE, "", { ...base(), path: "/", maxAge: 0 });
  jar.set(ADMIN_REFRESH_COOKIE, "", { ...base(), path: REFRESH_COOKIE_PATH, maxAge: 0 });
  jar.set(ADMIN_REFRESHED_COOKIE, "", { ...base(), path: REFRESHED_MARK_PATH, maxAge: 0 });
}
