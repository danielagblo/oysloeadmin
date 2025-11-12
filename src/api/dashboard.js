// src/api/dashboard.js
import { getToken } from "./auth";
import { timeAgo } from "../utils/numConverters";

const API_BASE = (import.meta.env.VITE_API_BASE || "") + "/admin/analytics";

/** safe fetch helper that reads token at request time */
async function fetchJson(path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    // try to get body for debugging
    const txt = await res.text().catch(() => "");
    throw new Error(`Fetch ${path} failed: ${res.status} ${txt}`);
  }

  // try parse JSON, return empty object on parse failure
  return res.json().catch(() => ({}));
}

/** safe number formatter (won't crash on null/undefined) */
function formatValue(n) {
  if (n == null) return "0";
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return String(n);
  if (num >= 1_000_000)
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(num);
}

/** main aggregator */
export async function getDashboardData() {
  try {
    const [overviewRes, usersRes, adsRes, revenueRes, supportRes] =
      await Promise.all([
        fetchJson("overview"),
        fetchJson("users"),
        fetchJson("ads"),
        fetchJson("revenue"),
        fetchJson("support"),
      ]);

    // defensive extraction
    const overview = overviewRes?.data ?? {};
    const usersData = usersRes?.data ?? {};
    const adsData = adsRes?.data ?? {};
    const revenueData = revenueRes?.data ?? {};
    const supportData = supportRes?.data ?? {};

    // user growth stats (map registrations if available)
    const userGrowthStats = (usersData.registrations || []).map((r) => ({
      label: timeAgo(r.date),
      value: formatValue(r.count),
    })) || [
      { label: "Today", value: formatValue(overview.users?.newToday ?? 0) },
    ];

    // revenue summary: try revenueData.trends, fallback to overview.revenue
    const revenueSummaryStats = (revenueData.trends || [])
      .slice(0, 3)
      .map((t) => ({
        label: timeAgo(t.date || t.timestamp || new Date().toISOString()),
        value: `$${formatValue(t.amount ?? t.count ?? 0)}`,
      })) || [
      {
        label: "Today Orders",
        value: formatValue(overview.revenue?.today ?? 0),
      },
    ];

    const dashboard = [
      // Users
      {
        title: "Total Users",
        value: formatValue(overview.users?.total ?? usersData.total ?? 0),
        change: "—",
        period: "6 months",
      },
      {
        title: "Verified Users",
        value: formatValue(overview.users?.verified ?? 0),
        change: "—",
        period: "6 months",
      },
      {
        title: "Active Users",
        value: formatValue(overview.users?.active ?? 0),
        change: "—",
        period: "6 months",
      },
      {
        title: "New Users Today",
        value: formatValue(overview.users?.newToday ?? 0),
        change: "—",
        period: "Today",
      },
      {
        title: "New Users This Week",
        value: formatValue(overview.users?.newWeek ?? 0),
        change: "—",
        period: "This Week",
      },
      {
        title: "User Growth",
        stats: userGrowthStats,
        period: "6 months",
      },

      // Ads
      {
        title: "Total Ads",
        value: formatValue(overview.ads?.total ?? adsData.total ?? 0),
        change: "—",
        period: "6 months",
      },
      {
        title: "Ads Active",
        value: formatValue(overview.ads?.active ?? 0),
        change: "—",
        period: "6 months",
      },
      {
        title: "Ads Pending",
        value: formatValue(overview.ads?.pending ?? 0),
        change: "—",
        period: "6 months",
      },
      {
        title: "Ads Taken",
        value: formatValue(
          (adsData.approvals || []).reduce(
            (s, x) => s + (Number(x.count) || 0),
            0
          )
        ),
        change: "—",
        period: "6 months",
      },
      {
        title: "Ads Suspended",
        value: formatValue(overview.ads?.suspended ?? 0),
        change: "—",
        period: "6 months",
      },
      {
        title: "New Ads Today",
        value: formatValue(overview.ads?.newToday ?? 0),
        change: "—",
        period: "Today",
      },
      {
        title: "New Ads This Week",
        value: formatValue(overview.ads?.newWeek ?? 0),
        change: "—",
        period: "This Week",
      },
      {
        title: "Top Categories",
        stats:
          (adsData.topCategories || []).map((c) => ({
            label: c.categoryName ?? "Unknown",
            value: formatValue(c.count),
          })) || [],
        period: "6 months",
      },
      {
        title: "Top Sellers",
        stats:
          (adsData.topSellers || []).map((s) => ({
            label: s.sellerName ?? `Seller ${s.sellerId ?? ""}`,
            value: formatValue(s.adCount),
          })) || [],
        period: "6 months",
      },

      // Revenue
      {
        title: "Total Revenue",
        value: `$${formatValue(
          overview.revenue?.total ?? revenueData.total ?? 0
        )}`,
        change: "—",
        period: "6 months",
      },
      {
        title: "Revenue Today",
        value: `$${formatValue(
          overview.revenue?.today ?? revenueData.today ?? 0
        )}`,
        change: "—",
        period: "Today",
      },
      {
        title: "Revenue This Week",
        value: `$${formatValue(
          overview.revenue?.week ?? revenueData.week ?? 0
        )}`,
        change: "—",
        period: "This Week",
      },
      {
        title: "Revenue This Month",
        value: `$${formatValue(
          overview.revenue?.month ?? revenueData.month ?? 0
        )}`,
        change: "—",
        period: "This Month",
      },
      {
        title: "Revenue Summary",
        stats: revenueSummaryStats,
        period: "6 months",
      },

      // Support
      {
        title: "Total Support Cases",
        value: formatValue(supportData.totalCases ?? 0),
        change: "—",
        period: "6 months",
      },
      {
        title: "Open Support Cases",
        value: formatValue(
          overview.support?.openCases ?? supportData.openCases ?? 0
        ),
        change: "—",
        period: "6 months",
      },
      {
        title: "Resolved Today",
        value: formatValue(
          overview.support?.resolvedToday ?? supportData.resolvedToday ?? 0
        ),
        change: "—",
        period: "Today",
      },
      {
        title: "Avg Response Time",
        value: `${formatValue(
          overview.support?.avgResponseTime ??
            supportData.avgResolutionTime ??
            0
        )}h`,
        change: "—",
        period: "6 months",
      },
      {
        title: "Case Categories",
        stats:
          (supportData.caseCategories || []).map((c) => ({
            label: c.category ?? "uncategorized",
            value: formatValue(c.count),
          })) || [],
        period: "6 months",
      },
      {
        title: "Agent Performance",
        stats:
          (supportData.agentPerformance || []).map((a) => ({
            label: a.adminUsername ?? `Admin ${a.adminId ?? ""}`,
            value: formatValue(a.casesResolved),
          })) || [],
        period: "6 months",
      },
      {
        title: "Response Times",
        stats:
          (supportData.responseTimes || []).map((r) => ({
            label: timeAgo(r.date),
            value: `${formatValue(r.avgHours)}h`,
          })) || [],
        period: "6 months",
      },
    ];

    return dashboard;
  } catch (err) {
    console.error("getDashboardData error:", err);
    return []; // safe fallback so UI doesn't break
  }
}

// Export promise (UI can await or use .then)
export const dashboard = await getDashboardData();
