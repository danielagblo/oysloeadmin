// src/api/ads.js
import { getToken } from "./auth";
// import { formatNumber, timeAgo } from "../utils/numConverters"; // optional helpers

const API_BASE_ROOT = import.meta.env.VITE_API_BASE || "";
const API_BASE = `${API_BASE_ROOT}/admin/ads`;

/** Helper: perform fetch and parse JSON (throws on non-ok) */
async function fetchJson(path, opts = {}) {
  const token = getToken();
  const url = `${API_BASE}${path}`;
  const headers = {
    Accept: "application/json",
    ...(opts.headers || {}),
  };
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

/** Safe helpers */
const asNumber = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/[, ]+/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const safe = (v, fallback = null) => (v === undefined ? fallback : v);

/** Map backend Product -> UI ad shape (used by getAdsList) */
function mapProductToUI(p) {
  if (!p || typeof p !== "object") return null;

  const id = safe(p.id, null);
  const title = safe(p.name ?? p.title ?? p.productTitle ?? "", "");
  const productCategory = {
    category: safe(p.category?.name ?? p.productCategory?.category ?? null),
    subcategory: safe(
      p.category?.subCategory ?? p.productCategory?.subcategory ?? null
    ),
  };
  const adPurpose = safe(p.adPurpose ?? p.type ?? "Sale");
  const price = asNumber(p.price ?? p.listingPrice ?? p.amount ?? 0);
  const currency = safe(p.currency ?? p.currencyCode ?? "GHS");

  const location = {
    city: safe(p.location?.city ?? p.city ?? p.user?.city ?? null),
    area: safe(p.location?.area ?? p.area ?? null),
    street: safe(p.location?.street ?? p.address ?? null),
  };

  const condition = safe(p.condition ?? p.itemCondition ?? "Unknown");
  const status = String(
    safe(p.moderationStatus ?? p.status ?? "active")
  ).toLowerCase();
  const suspensionReason = safe(
    p.suspensionReason ?? p.suspendedReason ?? null
  );
  const approvedBy = safe(
    p.approvedBy ?? p.approvedByUser ?? p.moderatedBy ?? null
  );
  const approvedOn = safe(
    p.approvedAt ?? p.approvedOn ?? p.moderatedAt ?? null
  );
  const postedOn = safe(p.createdAt ?? p.postedOn ?? p.postedAt ?? null);

  // seller/user
  const sellerSource = p.user ?? p.seller ?? p.owner ?? {};
  const seller = {
    id: safe(sellerSource.id ?? sellerSource.userId ?? null),
    name: safe(
      sellerSource.name ??
        sellerSource.username ??
        sellerSource.businessName ??
        "Unknown"
    ),
    avatar: safe(
      sellerSource.profileImageUrl ??
        sellerSource.avatar ??
        sellerSource.avatarUrl ??
        null
    ),
    businessName: safe(sellerSource.businessName ?? null),
    phone: safe(sellerSource.phone ?? sellerSource.phoneNumber ?? null),
    verified: !!(sellerSource.isVerified || sellerSource.verified),
    activeAdsCount: asNumber(
      sellerSource.activeAdsCount ?? sellerSource.activeCount ?? 0
    ),
    soldAdsCount: asNumber(
      sellerSource.soldAdsCount ?? sellerSource.soldCount ?? 0
    ),
  };

  // Stats (backend may expose different names)
  const statsSource = p.stats ?? p.metrics ?? {};
  const stats = {
    views: asNumber(statsSource.views ?? p.viewsCount ?? p.viewCount ?? 0),
    chats: asNumber(statsSource.chats ?? statsSource.messages ?? 0),
    calls: asNumber(statsSource.calls ?? 0),
    favorites: asNumber(statsSource.favorites ?? statsSource.likes ?? 0),
    reports: asNumber(statsSource.reports ?? statsSource.flags ?? 0),
    orders: asNumber(statsSource.orders ?? 0),
    boostMultiplier: asNumber(statsSource.boostMultiplier ?? 0),
  };

  const subscriptionPlan = safe(p.subscriptionPlan ?? p.plan ?? null);

  // images - try multiple field names
  const images =
    (Array.isArray(p.images) && p.images.map((x) => String(x))) ||
    (Array.isArray(p.photos) && p.photos.map((x) => String(x))) ||
    (Array.isArray(p.productImages) &&
      p.productImages.map((img) => img?.url || String(img))) ||
    (p.image ? [String(p.image)] : []) ||
    [];

  // attributes & parameters
  const attributes =
    (Array.isArray(p.attributes) &&
      p.attributes.map((a) => ({
        name: a.name ?? a.key ?? a.label,
        value: a.value ?? a.val ?? "",
      }))) ||
    [];

  const parameters =
    (Array.isArray(p.parameters) &&
      p.parameters.map((a) => ({
        name: a.name ?? a.key ?? a.label,
        slug: a.slug ?? a.key ?? "",
        value: a.value ?? "",
      }))) ||
    [];

  // reviews & comments
  const aggregatedReviews = {
    averageRating: asNumber(
      p.aggregatedReviews?.averageRating ?? p.ratingAvg ?? p.avgRating ?? 0
    ),
    totalReviews: asNumber(
      p.aggregatedReviews?.totalReviews ?? p.reviewsCount ?? 0
    ),
    ratingBreakdown:
      p.aggregatedReviews?.ratingBreakdown ?? p.ratingBreakdown ?? {},
  };

  const comments =
    (Array.isArray(p.comments) &&
      p.comments.map((c) => ({
        id: safe(c.id ?? c.commentId ?? null),
        user: {
          id: safe(c.user?.id ?? c.userId ?? null),
          name: safe(c.user?.name ?? c.authorName ?? "User"),
          avatar: safe(c.user?.avatar ?? c.user?.profileImage ?? null),
        },
        stars: asNumber(c.stars ?? c.rating ?? 0),
        text: safe(c.text ?? c.body ?? c.commentText ?? ""),
        date: safe(c.date ?? c.createdAt ?? c.postedAt ?? null),
        relatedAds: Array.isArray(c.relatedAds)
          ? c.relatedAds
          : c.relatedAdIds ?? [],
      }))) ||
    [];

  const tags = Array.isArray(p.tags) ? p.tags : p.keywords ?? p.labels ?? [];

  return {
    id,
    title,
    productCategory,
    adPurpose,
    price,
    currency,
    location,
    condition,
    status,
    suspensionReason,
    approvedBy,
    approvedOn,
    postedOn,
    seller,
    stats,
    subscriptionPlan,
    images,
    attributes,
    parameters,
    aggregatedReviews,
    comments,
    tags,
    _raw: p,
  };
}

/** PUBLIC: fetch list of ads (supports query string or object) */
export async function getAdsList(query = "") {
  try {
    // allow object -> querystring or string
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
    const res = await fetchJson(path, { method: "GET" });
    // expected: { success: true, data: { ads: [...], pagination: {...}, filters: {...} } }
    const rawAds = res?.data?.ads ?? res?.ads ?? res?.data ?? [];
    // rawAds may already be an object { items, pagination, filters, ... } if backend changed
    let arr;
    if (Array.isArray(rawAds)) {
      arr = rawAds;
    } else if (Array.isArray(res?.data?.items)) {
      arr = res.data.items;
    } else if (Array.isArray(res?.items)) {
      arr = res.items;
    } else {
      arr = [];
    }

    const mapped = arr.map(mapProductToUI).filter(Boolean);

    // preserve pagination & filters if present
    const pagination = res?.data?.pagination ?? res?.pagination ?? null;
    const filters = res?.data?.filters ?? res?.filters ?? null;

    return { items: mapped, pagination, filters, raw: res };
  } catch (err) {
    console.error("getAdsList error:", err);
    return { items: [], pagination: null, filters: null, raw: null };
  }
}

/** PUBLIC: fetch single ad by id */
export async function getAdById(id) {
  try {
    if (!id) return null;
    const res = await fetchJson(`/${encodeURIComponent(String(id))}`, {
      method: "GET",
    });
    const raw = res?.data?.ad ?? res?.data ?? res?.ad ?? res;
    return mapProductToUI(raw);
  } catch (err) {
    console.error("getAdById error:", err);
    return null;
  }
}

/** PUBLIC: fetch ads stats (GET /stats) */
export async function getAdsStats() {
  try {
    const res = await fetchJson("/stats", { method: "GET" });
    const d = res?.data ?? {};
    return {
      total: asNumber(d.total),
      active: asNumber(d.active),
      pending: asNumber(d.pending),
      suspended: asNumber(d.suspended),
      rejected: asNumber(d.rejected),
      todayPosted: asNumber(d.todayPosted),
      weekPosted: asNumber(d.weekPosted),
      monthPosted: asNumber(d.monthPosted),
      byCategory: d.byCategory ?? {},
      topSellers: Array.isArray(d.topSellers) ? d.topSellers : [],
      moderation: d.moderation ?? {},
      raw: res,
    };
  } catch (err) {
    console.error("getAdsStats error:", err);
    return {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0,
      rejected: 0,
      byCategory: {},
      topSellers: [],
      moderation: {},
      raw: null,
    };
  }
}

/** PUBLIC: update a single ad status (PUT /:id/status) */
export async function updateAdStatus(
  id,
  { status, reason = null, notes = null } = {}
) {
  try {
    if (!id) throw new Error("id required");
    const res = await fetchJson(`/${encodeURIComponent(String(id))}/status`, {
      method: "PUT",
      body: { status, reason, notes },
    });
    return res;
  } catch (err) {
    console.error("updateAdStatus error:", err);
    throw err;
  }
}

/** PUBLIC: bulk update ads status (POST /bulk/status) */
export async function bulkUpdateAds({
  adIds = [],
  status,
  reason = null,
  notes = null,
} = {}) {
  try {
    const res = await fetchJson(`/bulk/status`, {
      method: "POST",
      body: { adIds, status, reason, notes },
    });
    return res;
  } catch (err) {
    console.error("bulkUpdateAds error:", err);
    throw err;
  }
}

/** PUBLIC: delete ad image (DELETE /:id/images/:imageId) */
export async function deleteAdImage(adId, imageId, { reason = null } = {}) {
  try {
    const path = `/${encodeURIComponent(
      String(adId)
    )}/images/${encodeURIComponent(String(imageId))}`;
    const useBody = true;
    if (useBody) {
      return fetchJson(path, { method: "DELETE", body: { reason } });
    } else {
      const q = reason ? `?reason=${encodeURIComponent(String(reason))}` : "";
      return fetchJson(`${path}${q}`, { method: "DELETE" });
    }
  } catch (err) {
    console.error("deleteAdImage error:", err);
    throw err;
  }
}

/* ----------------- robust mapping utilities (accept raw backend or mapped object) ----------------- */

/** Map single ad in backend shape -> UI shape (used when you need to map raw responses) */
export function mapSingleAdToUI(ad) {
  if (!ad) return null;

  // safe helpers
  const _parseNumber = (v) => {
    if (v === undefined || v === null || v === "") return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = Number(String(v).trim().replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  const asNumber = (v) => _parseNumber(v) ?? 0;
  const safe = (v, fallback = null) => (v === undefined ? fallback : v);

  // category/subcategory
  const categoryName =
    ad.category?.name ?? ad.productCategory?.category ?? null;
  const subcategoryName =
    ad.subcategory?.name ??
    ad.subcategoryName ??
    ad.productCategory?.subcategory ??
    null;

  // images - prefer arrays, then productImages objects, then single image field
  let images = [];
  if (Array.isArray(ad.images) && ad.images.length) {
    images = ad.images.filter(Boolean).map(String);
  } else if (Array.isArray(ad.productImages) && ad.productImages.length) {
    images = ad.productImages
      .map((pi) => pi?.url ?? pi?.path ?? pi?.fileUrl ?? null)
      .filter(Boolean)
      .map(String);
  } else if (ad.image) {
    images = [String(ad.image)];
  } else if (ad.imageUrl) {
    images = [String(ad.imageUrl)];
  }

  // seller mapping (from `user` object)
  const sellerSource = ad.user ?? ad.seller ?? ad.owner ?? {};
  const seller = {
    id: sellerSource.id ?? sellerSource.userId ?? null,
    name:
      sellerSource.name ??
      sellerSource.username ??
      sellerSource.businessName ??
      "Unknown",
    avatar:
      sellerSource.avatarUrl ??
      sellerSource.avatar ??
      sellerSource.profileImage ??
      null,
    businessName: sellerSource.businessName ?? null,
    phone: sellerSource.phone ?? sellerSource.phoneNumber ?? null,
    verified:
      !!(
        sellerSource.emailVerified ||
        sellerSource.phoneVerified ||
        sellerSource.isVerified
      ) || false,
    activeAdsCount: asNumber(
      sellerSource.activeAdsCount ?? sellerSource.activeCount ?? 0
    ),
    soldAdsCount: asNumber(
      sellerSource.soldAdsCount ?? sellerSource.soldCount ?? 0
    ),
  };

  // STATS: be robust - try multiple possible field names
  const statsSource = ad.stats ?? ad.metrics ?? {};
  const pickFirst = (list) => {
    for (const x of list) {
      if (x !== undefined && x !== null && x !== "") return x;
    }
    return null;
  };

  const rawViews = pickFirst([
    statsSource.views,
    ad.viewsCount,
    ad.viewCount,
    ad.views,
  ]);
  const rawFavorites = pickFirst([
    statsSource.favorites,
    statsSource.likes,
    ad.favoritesCount,
    ad.favorites,
    ad.likesCount,
    ad.likes,
  ]);
  const rawChats = pickFirst([
    statsSource.chats,
    statsSource.messages,
    ad.chatsCount,
    ad.messagesCount,
  ]);
  const rawCalls = pickFirst([statsSource.calls, ad.callsCount, ad.callCount]);
  const rawReports = pickFirst([
    statsSource.reports,
    ad.reportsCount,
    ad.flags,
    ad.reports,
  ]);
  const rawOrders = pickFirst([statsSource.orders, ad.ordersCount, ad.orders]);

  const views = asNumber(rawViews);
  const favorites = asNumber(rawFavorites);
  const chats = asNumber(rawChats);
  const calls = asNumber(rawCalls);
  const reports = asNumber(rawReports);
  const orders = asNumber(rawOrders);

  // debug: warn if favorites is zero and no raw path contained a value
  if (favorites === 0 && rawFavorites == null) {
    // only warn while developing
    console.warn(
      `mapSingleAdToUI: favorites missing for ad ${
        ad.id ?? ad.pid ?? ad.name
      }. ` +
        `Checked paths: stats.favorites | stats.likes | favoritesCount | favorites | likesCount | likes. ` +
        `Raw ad snapshot (trimmed):`,
      { id: ad.id ?? ad.pid, name: ad.name ?? ad.title }
    );
  }

  const stats = {
    views,
    chats,
    calls,
    favorites,
    reports,
    orders,
    boostMultiplier: ad.isPromoted ? asNumber(ad.boostMultiplier ?? 1) : 0,
  };

  // attributes / parameters / comments / tags
  const attributes =
    Array.isArray(ad.attributes) && ad.attributes.length
      ? ad.attributes.map((a) => ({
          name: a.name ?? a.key ?? a.label ?? "",
          value: a.value ?? a.val ?? "",
        }))
      : [];

  const parameters =
    Array.isArray(ad.parameters) && ad.parameters.length
      ? ad.parameters.map((p) => ({
          name: p.name ?? p.key ?? p.label ?? "",
          slug: p.slug ?? p.key ?? "",
          value: p.value ?? p.val ?? "",
        }))
      : [];

  const aggregatedReviews = {
    averageRating: asNumber(
      ad.aggregatedReviews?.averageRating ??
        ad.ratingAvg ??
        ad.avgRating ??
        ad.avg_rating ??
        0
    ),
    totalReviews: asNumber(
      ad.aggregatedReviews?.totalReviews ?? ad.reviewsCount ?? 0
    ),
    ratingBreakdown:
      ad.aggregatedReviews?.ratingBreakdown ?? ad.ratingBreakdown ?? {},
  };

  const comments =
    Array.isArray(ad.comments) && ad.comments.length
      ? ad.comments.map((c) => ({
          id: c.id ?? c.commentId ?? null,
          user: {
            id: c.user?.id ?? c.userId ?? null,
            name: c.user?.name ?? c.authorName ?? "User",
            avatar: c.user?.avatar ?? c.user?.profileImage ?? null,
          },
          stars: asNumber(c.stars ?? c.rating ?? 0),
          text: c.text ?? c.body ?? c.commentText ?? "",
          date: c.date ?? c.createdAt ?? c.postedAt ?? null,
          relatedAds: Array.isArray(c.relatedAds)
            ? c.relatedAds
            : c.relatedAdIds ?? [],
        }))
      : [];

  const tags = Array.isArray(ad.tags)
    ? ad.tags
    : ad.keywords ?? ad.labels ?? [];

  return {
    id: ad.id ?? ad.pid ?? null,
    title: ad.name ?? ad.title ?? "",
    productCategory: { category: categoryName, subcategory: subcategoryName },
    adPurpose: ad.adPurpose ?? ad.type ?? "Sale",
    price: asNumber(ad.price ?? ad.listingPrice ?? 0),
    currency: ad.currency ?? ad.currencyCode ?? "GHS",
    location: {
      city: ad.location?.city ?? ad.city ?? ad.user?.city ?? null,
      area: ad.location?.area ?? ad.area ?? null,
      street: ad.location?.street ?? ad.street ?? ad.address ?? null,
    },
    condition: ad.condition ?? ad.itemCondition ?? null,
    status: ad.status ?? ad.moderationStatus ?? "active",
    suspensionReason: ad.suspensionReason ?? null,
    approvedBy:
      // NOTE: backend often returns an id for approvedBy; frontend expects a name.
      // If you want a name here, include it on the backend or fetch the user and map.
      ad.approvedBy ?? ad.approvedByUser ?? null,
    approvedOn: ad.approvedAt ?? ad.approvedOn ?? ad.moderatedAt ?? null,
    postedOn: ad.createdAt ?? ad.postedOn ?? ad.postedAt ?? null,
    seller,
    stats,
    subscriptionPlan: ad.subscriptionPlan ?? ad.plan ?? null,
    images,
    attributes,
    parameters,
    aggregatedReviews,
    comments,
    tags,
    _raw: ad, // keep raw for debugging
  };
}

/** map full response object -> { items: [...], pagination, filters, raw } */
export function mapAdsResponse(backendResponse) {
  const res = backendResponse ?? {};
  // If it's already in the mapped shape, return it
  if (res.items && Array.isArray(res.items)) {
    return {
      items: res.items,
      pagination: res.pagination ?? null,
      filters: res.filters ?? null,
      raw: res.raw ?? res,
    };
  }

  // normalized raw payload
  const data = res.data ?? res;
  const rawAds = data?.ads ?? data?.items ?? res?.ads ?? [];
  const arr = Array.isArray(rawAds) ? rawAds : [];

  // detect items already mapped to UI shape
  const looksMapped = (it) =>
    it &&
    (it.stats !== undefined ||
      it.productCategory !== undefined ||
      it._raw !== undefined);

  const items = arr
    .map((it) => (it ? (looksMapped(it) ? it : mapSingleAdToUI(it)) : null))
    .filter(Boolean);

  const pagination = data.pagination ?? res.pagination ?? null;
  const filters = data.filters ?? res.filters ?? null;
  return { items, pagination, filters, raw: res };
}

/** helper: a promise for quick import/use
 *  Note: getAdsList returns a mapped shape in the API helper; if it returns raw,
 *  mapAdsResponse handles raw -> mapped.
 */
let adsMapped = { items: [], pagination: null, filters: null, raw: null };
try {
  const adsResponse = await getAdsList();
  adsMapped = mapAdsResponse(adsResponse);
} catch (e) {
  console.error("adsMapper: failed to load ads at module init:", e);
}

export const adsData = adsMapped.items || [];
export const adsResponseExport = adsMapped;

/** default export */
export default {
  getAdsList,
  getAdById,
  getAdsStats,
  updateAdStatus,
  bulkUpdateAds,
  deleteAdImage,
  mapSingleAdToUI,
  mapAdsResponse,
  adsData,
  adsResponse: adsResponseExport,
};
