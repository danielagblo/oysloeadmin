import { getToken } from "./auth";

const API_BASE = `${import.meta.env.VITE_API_BASE || ""}/admin/users`;

/** Fetch helper */
async function fetchJson(path = "", opts = {}) {
  const token = getToken();
  const url = `${API_BASE}${path}`;
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

/** Map backend user -> UI shape */
export function mapUserToUI(user, detailed = false) {
  if (!user) return null;

  // Safe helpers
  const safe = (v, fallback = null) =>
    v === undefined || v === null ? fallback : v;
  const asNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    const n = Number(String(v).replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // Basic user info
  const wallet = user.wallet || {};
  const products = user.products || [];
  const reviews = user.reviews || [];

  // Calculate age from date of birth if available
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Determine verification status
  const verificationStatus = user.verificationStatus || "unverified";
  const isVerified = verificationStatus === "verified";

  // Calculate reviews stats
  const calculateReviewsStats = (reviews) => {
    if (!reviews.length) {
      return { averageRating: 0, totalReviews: 0, ratingBreakdown: {} };
    }

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach((review) => {
      const rating = Math.max(
        1,
        Math.min(5, asNumber(review.rating) || asNumber(review.stars))
      );
      breakdown[rating] = (breakdown[rating] || 0) + 1;
      totalRating += rating;
    });

    return {
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
      ratingBreakdown: breakdown,
    };
  };

  const reviewsStats = calculateReviewsStats(reviews);

  // Map to UI structure
  const mappedUser = {
    id: user.id,
    name:
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Unknown User",
    username: user.username || user.email?.split("@")[0] || "user",
    role: user.role || "user",
    subRole: user.subRole || user.role || "user",
    type: user.type || user.subscriptionPlan || "basic",
    verified: isVerified,
    level: user.level || "low",
    badge: user.badge || null,
    businessName: user.businessName || user.companyName || null,
    profileImage:
      user.profileImage ||
      user.avatar ||
      user.profileImageUrl ||
      `https://randomuser.me/api/portraits/lego/${user.id % 10}.jpg`,
    businessLogo: user.businessLogo || user.companyLogo || null,
    idFront: user.idFront || user.idDocumentFront || null,
    idBack: user.idBack || user.idDocumentBack || null,
    activeAds: products.filter((p) => p.status === "active").length,
    activeAdIds: products.filter((p) => p.status === "active").map((p) => p.id),
    joined: user.createdAt || user.joinedAt || user.registeredAt,
    reviewsCount: reviewsStats.totalReviews,
    rating: reviewsStats.averageRating,
    supportPercent: asNumber(user.supportPercent) || 0,
    email: user.email,
    phonePrimary: user.phone || user.phoneNumber || user.phonePrimary,
    phoneSecondary: user.phoneSecondary || null,
    paymentAccount: user.paymentAccount || wallet.paymentMethod,
    accountName: user.accountName || user.bankAccountName,
    accountNumber: user.accountNumber || user.bankAccountNumber,
    nationalId: user.nationalId || user.idNumber,
    mobileNetwork: user.mobileNetwork || user.carrier,
    passkey: user.passkey || null,
    notes: user.adminNotes || user.notes,
    applications: user.applications || [],
    locations: [user.location, user.city, user.country].filter(Boolean),
    muted: user.isMuted || user.muted || false,
    deleted: user.deleted || false,
    aggregatedReviews: reviewsStats,
    comments: reviews.map((review) => ({
      date: review.createdAt || review.date,
      stars: review.rating || review.stars,
      text: review.comment || review.text || review.feedback,
      user: {
        name: review.reviewer?.name || "Anonymous",
        avatar: review.reviewer?.avatar || review.reviewer?.profileImage,
      },
    })),
    _raw: user,
  };

  // Add detailed info if requested
  if (detailed && user.activityStats) {
    mappedUser.activityStats = user.activityStats;
    mappedUser.verificationHistory = user.verificationHistory || [];
    mappedUser.moderationHistory = user.moderationHistory || [];
  }

  return mappedUser;
}

/** PUBLIC: Get users list */
export async function getUsers(query = {}) {
  try {
    // Build query string from object
    const queryString = Object.keys(query)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
      )
      .join("&");

    const path = queryString ? `?${queryString}` : "";
    const res = await fetchJson(path, { method: "GET" });

    const rawUsers = res?.data?.users || [];
    const users = rawUsers.map((user) => mapUserToUI(user)).filter(Boolean);

    return {
      users,
      pagination: res?.data?.pagination || null,
      filters: res?.data?.filters || null,
      raw: res,
    };
  } catch (err) {
    console.error("getUsers error:", err);
    return { users: [], pagination: null, filters: null, raw: null };
  }
}

/** PUBLIC: Get user stats */
export async function getUserStats() {
  try {
    const res = await fetchJson("/stats", { method: "GET" });
    return res?.data || res;
  } catch (err) {
    console.error("getUserStats error:", err);
    throw err;
  }
}

/** PUBLIC: Get single user with full details */
export async function getUser(id) {
  try {
    if (!id) throw new Error("User ID required");
    const res = await fetchJson(`/${encodeURIComponent(String(id))}`, {
      method: "GET",
    });
    const user = mapUserToUI(res?.data?.user || res?.data, true);
    return user;
  } catch (err) {
    console.error("getUser error:", err);
    throw err;
  }
}

/** PUBLIC: Verify user */
export async function verifyUser(id, status, notes = null) {
  try {
    if (!id || !status) throw new Error("User ID and status required");

    const res = await fetchJson(`/${encodeURIComponent(String(id))}/verify`, {
      method: "POST",
      body: { status, notes },
    });

    return res?.data?.user || res?.data || res;
  } catch (err) {
    console.error("verifyUser error:", err);
    throw err;
  }
}

/** PUBLIC: Update user level */
export async function updateUserLevel(id, level, notes = null) {
  try {
    if (!id || !level) throw new Error("User ID and level required");

    const res = await fetchJson(`/${encodeURIComponent(String(id))}/level`, {
      method: "PUT",
      body: { level, notes },
    });

    return res?.data?.user || res?.data || res;
  } catch (err) {
    console.error("updateUserLevel error:", err);
    throw err;
  }
}

/** PUBLIC: Mute/Unmute user */
export async function muteUser(id, action, reason = null, duration = null) {
  try {
    if (!id || !action) throw new Error("User ID and action required");

    const res = await fetchJson(`/${encodeURIComponent(String(id))}/mute`, {
      method: "POST",
      body: { action, reason, duration },
    });

    return res?.data || res;
  } catch (err) {
    console.error("muteUser error:", err);
    throw err;
  }
}

/** PUBLIC: Delete user */
export async function deleteUser(id, reason = null, permanent = false) {
  try {
    if (!id) throw new Error("User ID required");

    const res = await fetchJson(`/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
      body: { reason, permanent },
    });

    return res;
  } catch (err) {
    console.error("deleteUser error:", err);
    throw err;
  }
}

/** PUBLIC: Create admin user */
export async function createAdminFunc(userData) {
  try {
    console.log("🔧 Sending admin creation data:", userData);

    const res = await fetchJson("/admin/create", {
      method: "POST",
      body: userData,
    });
    console.log("✅ Admin creation response:", res);
    return res?.data || res;
  } catch (err) {
    console.error("❌ createAdminFunc error:", err);
    console.log("📦 Failed request data was:", userData);
    throw err;
  }
}

/** PUBLIC: Export users */
export async function exportUsers(options = {}) {
  try {
    const queryString = Object.keys(options)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(options[key])}`
      )
      .join("&");

    const path = queryString ? `/export?${queryString}` : "/export";
    const res = await fetchJson(path, { method: "GET" });

    return res?.data || res;
  } catch (err) {
    console.error("exportUsers error:", err);
    throw err;
  }
}

// For backward compatibility - static data fallback
export const users = [];

export default {
  getUsers,
  getUser,
  getUserStats,
  verifyUser,
  updateUserLevel,
  muteUser,
  deleteUser,
  createAdminFunc,
  exportUsers,
  mapUserToUI,
  users,
};
