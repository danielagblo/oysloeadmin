// src/api/auth.js

// prefer env var, fallback to staging constant
const API_BASE = import.meta.env.VITE_API_BASE;

const TOKEN_KEY = "admin_token";
const REFRESH_KEY = "admin_refresh";
const USER_KEY = "admin_user";
const IS_LOGGED_KEY = "isLoggedIn";
const EXPIRES_AT_KEY = "admin_token_expires_at";

/* -------------------- storage helpers -------------------- */
function setItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
}
function getItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}
function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

/* -------------------- expiry helpers -------------------- */
function setExpiresAt(msTimestamp) {
  try {
    localStorage.setItem(EXPIRES_AT_KEY, String(msTimestamp));
  } catch (e) {}
}
function getExpiresAt() {
  try {
    const v = localStorage.getItem(EXPIRES_AT_KEY);
    return v ? Number(v) : null;
  } catch (e) {
    return null;
  }
}
function removeExpiresAt() {
  try {
    localStorage.removeItem(EXPIRES_AT_KEY);
  } catch (e) {}
}

/** isTokenExpired(thresholdSeconds)
 *  - thresholdSeconds: treat token as expired earlier by this many seconds
 */
export function isTokenExpired(thresholdSeconds = 0) {
  const expiresAt = getExpiresAt();
  if (!expiresAt) return true;
  const now = Date.now();
  return now >= expiresAt - thresholdSeconds * 1000;
}

/* -------------------- exports for other modules -------------------- */
export function getToken() {
  return getItem(TOKEN_KEY);
}
export function getStoredAdmin() {
  const raw = getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function isLoggedIn() {
  try {
    const s = sessionStorage.getItem(IS_LOGGED_KEY);
    return !!(s && JSON.parse(s) === true);
  } catch (e) {
    return false;
  }
}

/* -------------------- session management -------------------- */
function storeSession({ token, refreshToken, adminUser, expiresIn } = {}) {
  if (token) setItem(TOKEN_KEY, token);
  if (refreshToken) setItem(REFRESH_KEY, refreshToken);
  if (adminUser) setItem(USER_KEY, JSON.stringify(adminUser));

  if (typeof expiresIn === "number") {
    const expiresAt = Date.now() + expiresIn * 1000;
    setExpiresAt(expiresAt);
  }

  try {
    sessionStorage.setItem(IS_LOGGED_KEY, JSON.stringify(true));
  } catch (e) {}
}

let _refreshTimeoutId = null;
function clearRefreshTimer() {
  if (_refreshTimeoutId) {
    clearTimeout(_refreshTimeoutId);
    _refreshTimeoutId = null;
  }
}

/* keep clearSession single-source-of-truth */
function clearSession() {
  removeItem(TOKEN_KEY);
  removeItem(REFRESH_KEY);
  removeItem(USER_KEY);
  removeExpiresAt();
  clearRefreshTimer();
  try {
    sessionStorage.setItem(IS_LOGGED_KEY, JSON.stringify(false));
  } catch (e) {}
}

/* -------------------- auto-refresh scheduler -------------------- */
function scheduleAutoRefresh() {
  clearRefreshTimer();
  const expiresAt = getExpiresAt();
  if (!expiresAt) return;

  const now = Date.now();
  const msUntilExpiry = expiresAt - now;
  // refresh 60s before expiry, but at least 1s out
  const msUntilRefresh = Math.max(1000, msUntilExpiry - 60 * 1000);

  _refreshTimeoutId = setTimeout(async () => {
    try {
      const refreshed = await tryRefreshToken();
      if (!refreshed) {
        // if refresh fails, clean up session
        clearSession();
      }
    } catch (e) {
      clearSession();
    }
  }, msUntilRefresh);
}

/* -------------------- helper: stringify JSON bodies -------------------- */
function shouldStringifyBody(body) {
  return (
    body != null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob)
  );
}

/* -------------------- token refresh flow -------------------- */
/** tryRefreshToken:
 *  - uses stored refresh token (or cookie via credentials: 'include')
 *  - on success updates session and schedules next refresh
 *  - returns { token, refreshToken, adminUser } or null on failure
 */
async function tryRefreshToken() {
  const refreshToken = getItem(REFRESH_KEY);
  // If you use httpOnly cookies for refresh, backend will read cookie; here we still try body when available.
  if (!refreshToken) {
    // still attempt cookie-based refresh (no body) — backend must support it
    try {
      const resNoBody = await fetch(`${API_BASE}/admin/auth/refresh`, {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!resNoBody.ok) return null;
      const bodyNo = await resNoBody.json().catch(() => null);
      const dataNo = bodyNo?.data ? bodyNo.data : bodyNo;
      if (!dataNo) return null;
      const token = dataNo.token || dataNo.accessToken;
      const newRefresh = dataNo.refreshToken || dataNo.refresh;
      const adminUser = dataNo.admin || dataNo.user;
      storeSession({
        token,
        refreshToken: newRefresh,
        adminUser,
        expiresIn: dataNo.expiresIn,
      });
      scheduleAutoRefresh();
      return { token, refreshToken: newRefresh, adminUser };
    } catch (e) {
      return null;
    }
  }

  try {
    const res = await fetch(`${API_BASE}/admin/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    const data = body?.data ? body.data : body;
    if (!data) return null;

    const token = data.token || data.accessToken;
    const newRefresh = data.refreshToken || data.refresh;
    const adminUser = data.admin || data.user;

    storeSession({
      token,
      refreshToken: newRefresh,
      adminUser,
      expiresIn: data.expiresIn,
    });
    scheduleAutoRefresh();
    return { token, refreshToken: newRefresh, adminUser };
  } catch (e) {
    return null;
  }
}

/* -------------------- fetchWithAuth -------------------- */
/** fetchWithAuth: attaches Authorization header, auto-stringifies JSON bodies,
 *  proactively refreshes if token is near expiry, and retries once on 401.
 */
export async function fetchWithAuth(pathOrFullUrl, opts = {}) {
  const isFull = /^https?:\/\//i.test(String(pathOrFullUrl));
  const url = isFull
    ? pathOrFullUrl
    : `${API_BASE}${
        pathOrFullUrl.startsWith("/") ? pathOrFullUrl : "/" + pathOrFullUrl
      }`;

  // proactive refresh: if token is within 30s of expiry, try to refresh first
  if (isTokenExpired(30)) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) {
      // session expired/couldn't refresh
      clearSession();
      return Promise.reject(new Error("Session expired"));
    }
  }

  const token = getItem(TOKEN_KEY);

  const headers = new Headers(opts.headers || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (token && !headers.has("Authorization"))
    headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const newOpts = {
    ...opts,
    headers,
    credentials: opts.credentials ?? "include",
  };

  if (
    shouldStringifyBody(newOpts.body) &&
    headers.get("Content-Type")?.includes("application/json")
  ) {
    newOpts.body = JSON.stringify(newOpts.body);
  }

  let res = await fetch(url, newOpts);

  if (res.status === 401) {
    // try refresh once
    const refreshed = await tryRefreshToken();
    if (refreshed?.token) {
      // update Authorization header and retry
      const retryHeaders = new Headers(opts.headers || {});
      if (!retryHeaders.has("Accept"))
        retryHeaders.set("Accept", "application/json");
      retryHeaders.set("Authorization", `Bearer ${refreshed.token}`);
      if (
        !retryHeaders.has("Content-Type") &&
        !(opts.body instanceof FormData)
      ) {
        retryHeaders.set("Content-Type", "application/json");
      }

      const retryOpts = {
        ...opts,
        headers: retryHeaders,
        credentials: opts.credentials ?? "include",
      };

      if (
        shouldStringifyBody(retryOpts.body) &&
        retryHeaders.get("Content-Type")?.includes("application/json")
      ) {
        retryOpts.body = JSON.stringify(retryOpts.body);
      }

      res = await fetch(url, retryOpts);
    } else {
      clearSession();
    }
  }

  return res;
}

/* -------------------- login & logout -------------------- */
/** handleLogin - call admin login endpoint and persist token + user */
export async function handleLogin(emailOrUsername, password, setLoggedin) {
  if (!emailOrUsername || !password) {
    throw new Error("Email/username and password are required");
  }

  const payload = { username: emailOrUsername, password };
  const res = await fetch(`${API_BASE}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = body?.message || body?.error || "Login failed";
    throw new Error(msg);
  }

  const data = body?.data ? body.data : body;
  const token = data?.token || data?.accessToken;
  const refreshToken = data?.refreshToken || data?.refresh;
  const adminUser = data?.admin || data?.user;
  const expiresIn = data?.expiresIn;

  if (!token) {
    throw new Error("No token returned from server");
  }

  storeSession({ token, refreshToken, adminUser, expiresIn });
  scheduleAutoRefresh();

  try {
    sessionStorage.setItem(IS_LOGGED_KEY, JSON.stringify(true));
  } catch (e) {}

  if (typeof setLoggedin === "function") setLoggedin(true);

  return { token, refreshToken, adminUser, expiresIn };
}

/** handleLogout - clears session and attempts server logout */
export async function handleLogout(setLoggedin) {
  try {
    const token = getItem(TOKEN_KEY);
    await fetch(`${API_BASE}/admin/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({}),
    }).catch(() => {});
  } finally {
    clearSession();
    try {
      sessionStorage.setItem(IS_LOGGED_KEY, JSON.stringify(false));
    } catch (e) {}
    if (typeof setLoggedin === "function") setLoggedin(false);
  }
}

/* -------------------- bootstrap -------------------- */
/** Call this once at app start (e.g. App.js useEffect) to resume session and schedule refresh */
export function bootstrapAuth() {
  const token = getToken();
  if (token && !isTokenExpired()) {
    // schedule auto refresh if token still valid
    scheduleAutoRefresh();
    return true;
  }
  // clear any stale session
  if (token && isTokenExpired()) {
    clearSession();
  }
  return false;
}
