// export const settingsData = {

//   reports: [
//     {
//       id: 1,
//       reporter: {
//         name: "Ama Serwaa",
//         avatar: "https://randomuser.me/api/portraits/men/23.jpg",
//       },
//       reportee: {
//         name: "George Asare",
//         avatar: "https://randomuser.me/api/portraits/men/24.jpg",
//       },
//       reason: "User posted misleading product information.",
//       status: "Pending",
//       createdAt: "2025-10-21T09:12:00Z",
//       resolvedAt: null,
//       resolvedBy: null,
//       resolveNote: null,
//     }]
// };

// src/api/settings.js
import { getToken } from "./auth";

const API_BASE_ROOT = import.meta.env.VITE_API_BASE || "";
const SETTINGS_BASE = `${API_BASE_ROOT}/admin/settings`;
const FEEDBACK_BASE = `${API_BASE_ROOT}/admin/feedback`;
const REPORTS_BASE = `${API_BASE_ROOT}/admin/reports`;

/** low-level fetch + JSON, throws on non-ok
 *  baseUrl - optional base (defaults to SETTINGS_BASE)
 */
async function fetchJson(path, opts = {}, baseUrl = SETTINGS_BASE) {
  const token = getToken();
  const url = `${baseUrl}${path}`;
  const headers = { Accept: "application/json", ...(opts.headers || {}) };

  if (!(opts.body instanceof FormData) && opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    credentials: opts.credentials ?? "include",
    body:
      opts.body instanceof FormData
        ? opts.body
        : opts.body !== undefined
        ? JSON.stringify(opts.body)
        : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const err = new Error(`Request failed ${res.status}: ${txt}`);
    err.status = res.status;
    throw err;
  }

  return res.json().catch(() => ({}));
}

/** map backend content object -> UI friendly shape */
export function mapSettingResponse(raw) {
  const c = raw?.data?.content ?? raw?.content ?? {};
  const lines = Array.isArray(c.content)
    ? c.content
    : typeof c.content === "string"
    ? [c.content]
    : [];

  return {
    title: c.title ?? "",
    content: lines, // array of strings/paragraphs (guaranteed)
    version: c.version ?? null,
    date: c.updatedAt ?? null,
    updatedBy: c.updatedBy ?? null,
    raw,
  };
}

/* ---------- SETTINGS PUBLIC API ---------- */

/** GET /privacy-policy -> { title, content[], version, updatedAt, updatedBy, raw } */
export async function getPrivacyPolicy() {
  const res = await fetchJson(
    "/privacy-policy",
    { method: "GET" },
    SETTINGS_BASE
  );
  return mapSettingResponse(res);
}

/** PUT /privacy-policy */
export async function updatePrivacyPolicy({ title, content, version } = {}) {
  const body = {};
  if (title !== undefined) body.title = title;
  if (content !== undefined) body.content = content;
  if (version !== undefined) body.version = version;

  const res = await fetchJson(
    "/privacy-policy",
    { method: "PUT", body },
    SETTINGS_BASE
  );
  return mapSettingResponse(res);
}

/** GET /terms-conditions */
export async function getTermsConditions() {
  const res = await fetchJson(
    "/terms-conditions",
    { method: "GET" },
    SETTINGS_BASE
  );
  return mapSettingResponse(res);
}

/** PUT /terms-conditions */
export async function updateTermsConditions({ title, content, version } = {}) {
  const body = {};
  if (title !== undefined) body.title = title;
  if (content !== undefined) body.content = content;
  if (version !== undefined) body.version = version;

  const res = await fetchJson(
    "/terms-conditions",
    { method: "PUT", body },
    SETTINGS_BASE
  );
  return mapSettingResponse(res);
}

/* ---------- FEEDBACK (admin/feedback) ---------- */

/** map single feedback to UI shape required by frontend */
function mapFeedbackToUI(fb) {
  if (!fb) return null;
  const user = fb.user ?? {};
  const avatar =
    user.avatarUrl ??
    user.avatar ??
    user.profileImageUrl ??
    user.avatarPublicId ??
    null;

  return {
    id: fb.id,
    avatar,
    name: user.name ?? user.username ?? user.email ?? "User",
    stars: Number(fb.rating ?? fb.stars ?? 0),
    timeStamp: fb.createdAt ?? fb.updatedAt ?? null,
    comment: fb.comment ?? fb.body ?? "",
    product: fb.product
      ? { id: fb.product.id, title: fb.product.name ?? fb.product.title }
      : null,
    _raw: fb,
  };
}

/** GET /admin/feedback -> { items, pagination, raw } */
export async function getFeedbackList(query = "") {
  try {
    const qs =
      typeof query === "string"
        ? query
        : Object.entries(query || {})
            .map(
              ([k, v]) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
            )
            .join("&");
    const path = qs ? `?${qs}` : "";
    const res = await fetchJson(path, { method: "GET" }, FEEDBACK_BASE);

    const rawArr = res?.data?.feedback ?? res?.feedback ?? res?.data ?? [];
    const arr = Array.isArray(rawArr) ? rawArr : rawArr.items ?? [];
    const items = Array.isArray(arr)
      ? arr.map(mapFeedbackToUI).filter(Boolean)
      : [];

    const pagination = res?.data?.pagination ?? res?.pagination ?? null;
    return { items, pagination, raw: res };
  } catch (err) {
    console.error("getFeedbackList error:", err);
    return { items: [], pagination: null, raw: null };
  }
}

/** GET /admin/feedback/:id */
export async function getFeedbackById(id) {
  if (!id) return null;
  try {
    const res = await fetchJson(
      `/${encodeURIComponent(String(id))}`,
      { method: "GET" },
      FEEDBACK_BASE
    );
    const fb = res?.data ?? res?.feedback ?? res;
    return mapFeedbackToUI(fb);
  } catch (err) {
    console.error("getFeedbackById error:", err);
    return null;
  }
}

/* optional snapshot for quick imports */
export const feedbackResponse = await getFeedbackList().catch((e) => {
  console.warn("feedback snapshot failed:", e?.message ?? e);
  return { items: [], pagination: null, raw: null };
});
export const feedbackData = feedbackResponse.items || [];

/* ---------- REPORTS (admin/reports) ---------- */

/** map backend report -> UI-friendly shape */
function mapReportToUI(r) {
  if (!r) return null;

  // reporter/reportee might be nested as user objects or reporter/reportee properties
  const reporter =
    r.reporter ?? r.reportedBy ?? r.user ?? r.reporterUser ?? null;
  const reportee =
    r.reportee ?? r.reportedUser ?? r.targetUser ?? r.userTarget ?? null;

  const reporterObj = reporter
    ? {
        name:
          reporter.name ?? reporter.username ?? reporter.email ?? "Reporter",
        avatar:
          reporter.avatarUrl ??
          reporter.avatar ??
          reporter.profileImageUrl ??
          null,
      }
    : { name: "Reporter", avatar: null };

  const reporteeObj = reportee
    ? {
        name:
          reportee.name ?? reportee.username ?? reportee.email ?? "Reportee",
        avatar:
          reportee.avatarUrl ??
          reportee.avatar ??
          reportee.profileImageUrl ??
          null,
      }
    : { name: "Reportee", avatar: null };

  return {
    id: r.id,
    reporter: reporterObj,
    reportee: reporteeObj,
    reason: r.reason ?? r.description ?? r.message ?? "",
    status: r.status ?? r.state ?? "Pending",
    createdAt: r.createdAt ?? r.reportedAt ?? null,
    resolvedAt: r.resolvedAt ?? r.closedAt ?? null,
    resolvedBy: r.resolvedBy ?? r.resolver ?? null,
    resolveNote: r.resolveNote ?? r.notes ?? null,
    _raw: r,
  };
}

/** GET /admin/reports -> { items, pagination, stats, raw } */
export async function getReportsList(query = "") {
  try {
    const qs =
      typeof query === "string"
        ? query
        : Object.entries(query || {})
            .map(
              ([k, v]) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
            )
            .join("&");
    const path = qs ? `?${qs}` : "";
    const res = await fetchJson(path, { method: "GET" }, REPORTS_BASE);

    const rawArr = res?.data?.reports ?? res?.reports ?? res?.data ?? [];
    const arr = Array.isArray(rawArr) ? rawArr : rawArr.items ?? [];
    const items = Array.isArray(arr)
      ? arr.map(mapReportToUI).filter(Boolean)
      : [];

    const pagination = res?.data?.pagination ?? res?.pagination ?? null;
    const stats = res?.data?.stats ?? null;
    return { items, pagination, stats, raw: res };
  } catch (err) {
    console.error("getReportsList error:", err);
    return { items: [], pagination: null, stats: null, raw: null };
  }
}

/** GET /admin/reports/:id -> { report } */
export async function getReportById(id) {
  if (!id) return null;
  try {
    const res = await fetchJson(
      `/${encodeURIComponent(String(id))}`,
      { method: "GET" },
      REPORTS_BASE
    );
    const r = res?.data?.report ?? res?.report ?? res?.data ?? null;
    return mapReportToUI(r);
  } catch (err) {
    console.error("getReportById error:", err);
    return null;
  }
}

/** PUT /admin/reports/:id/resolve (or adjust path to match backend) */
export async function resolveReport(id, { action, notes } = {}) {
  if (!id) throw new Error("report id required");
  try {
    // adjust path/method if your backend expects something else
    const res = await fetchJson(
      `/${encodeURIComponent(String(id))}/resolve`,
      {
        method: "PUT",
        body: { action, notes },
      },
      REPORTS_BASE
    );
    const r = res?.data?.report ?? res ?? null;
    return r ? mapReportToUI(r) : r;
  } catch (err) {
    console.error("resolveReport error:", err);
    throw err;
  }
}

/* ---------- getAllSettings (privacy + terms only) ---------- */
/** fetch both policy + terms in parallel, and ALWAYS return safe shapes */
// fetch privacy + terms + feedback + reports in parallel and always return safe shapes
export async function getAllSettings({
  feedbackQuery = "",
  reportsQuery = "",
} = {}) {
  const promises = [
    getPrivacyPolicy(), // 0
    getTermsConditions(), // 1
    getFeedbackList(feedbackQuery), // 2
    getReportsList(reportsQuery), // 3
  ];

  const settled = await Promise.allSettled(promises);

  const normalizeSetting = (result) => {
    if (result.status === "fulfilled") return result.value;
    return {
      ...mapSettingResponse({}), // title/content/version/date/updatedBy/raw
      error: result.reason
        ? result.reason.message || String(result.reason)
        : "unknown error",
    };
  };

  const normalizeList = (result) => {
    if (result.status === "fulfilled") return result.value;
    return {
      items: [],
      pagination: null,
      stats: null,
      raw: null,
      error: result.reason
        ? result.reason.message || String(result.reason)
        : "unknown error",
    };
  };

  const privacyPolicy = normalizeSetting(settled[0]);
  const termsConditions = normalizeSetting(settled[1]);
  const feedback = normalizeList(settled[2])?.items || [];
  const reports = normalizeList(settled[3])?.items || [];

  return { privacyPolicy, termsConditions, feedback, reports };
}

/* top-level awaited snapshot (optional; keep if your build supports it) */
export const settingsData = await (async () => {
  try {
    return await getAllSettings();
  } catch (e) {
    return {
      privacy: {
        title: "",
        content: [],
        version: null,
        updatedAt: null,
        updatedBy: null,
        raw: null,
        error: e?.message,
      },
      terms: {
        title: "",
        content: [],
        version: null,
        updatedAt: null,
        updatedBy: null,
        raw: null,
        error: e?.message,
      },
    };
  }
})();

/* ---------- exports ---------- */
export default {
  // settings
  getPrivacyPolicy,
  updatePrivacyPolicy,
  getTermsConditions,
  updateTermsConditions,
  getAllSettings,
  mapSettingResponse,
  settingsData,
  // feedback
  getFeedbackList,
  getFeedbackById,
  feedbackData,
  feedbackResponse,
  // reports
  getReportsList,
  getReportById,
  resolveReport,
};
