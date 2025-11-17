// export const locationsData = [
//   {
//     region: "Greater Accra",
//     towns: ["Accra", "Tema", "Madina", "Teshie", "Nungua"],
//   },
//   {
//     region: "Ashanti",
//     towns: ["Kumasi", "Obuasi", "Ejisu", "Konongo", "Bekwai"],
//   },
//   {
//     region: "Western",
//     towns: ["Takoradi", "Sekondi", "Tarkwa", "Axim", "Bogoso"],
//   },
//   {
//     region: "Central",
//     towns: ["Cape Coast", "Winneba", "Elmina", "Mankessim", "Kasoa"],
//   },
//   {
//     region: "Eastern",
//     towns: ["Koforidua", "Nkawkaw", "Oda", "Akosombo", "Asamankese"],
//   },
//   {
//     region: "Volta",
//     towns: ["Ho", "Keta", "Aflao", "Kpando", "Akatsi"],
//   },
//   {
//     region: "Northern",
//     towns: ["Tamale", "Yendi", "Bimbilla", "Savelugu", "Karaga"],
//   },
//   {
//     region: "Upper East",
//     towns: ["Bolgatanga", "Navrongo", "Bawku", "Zuarungu", "Sandema"],
//   },
//   {
//     region: "Upper West",
//     towns: ["Wa", "Tumu", "Nandom", "Lawra", "Jirapa"],
//   },
//   {
//     region: "Bono",
//     towns: ["Sunyani", "Berekum", "Dormaa Ahenkro", "Wamfie"],
//   },
//   {
//     region: "Bono East",
//     towns: ["Techiman", "Atebubu", "Nkoranza", "Kintampo"],
//   },
//   {
//     region: "Ahafo",
//     towns: ["Goaso", "Bechem", "Hwidiem", "Duayaw Nkwanta"],
//   },
//   {
//     region: "Oti",
//     towns: ["Dambai", "Nkwanta", "Jasikan", "Kadjebi"],
//   },
//   {
//     region: "Savannah",
//     towns: ["Damongo", "Bole", "Salaga", "Larabanga"],
//   },
//   {
//     region: "North East",
//     towns: ["Nalerigu", "Walewale", "Gambaga", "Langbinsi"],
//   },
//   {
//     region: "Western North",
//     towns: ["Sefwi Wiawso", "Bibiani", "Juaboso", "Enchi"],
//   },
// ];

import { getToken } from "./auth";

const API_BASE = `${import.meta.env.VITE_API_BASE || ""}/admin/locations`;

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

export function mapLocationsResponse(raw) {
  const res = raw ?? {};
  const data = res.data ?? res;

  let rawRegions = data.regions || [];

  if (!Array.isArray(rawRegions) && typeof rawRegions === "object") {
    const obj = rawRegions;
    rawRegions = Object.keys(obj).map((k) => ({
      name: k,
      towns: Array.isArray(obj[k]) ? obj[k] : [],
    }));
  }

  const regions = Array.isArray(rawRegions)
    ? rawRegions.map((r) => {
        const regionName = r.name ?? r.region ?? r.title ?? null;

        let townsArr = [];
        if (Array.isArray(r.towns)) {
          townsArr = r.towns
            .map((t) => {
              if (typeof t === "string") {
                return {
                  id: t, // Use the string as ID temporarily
                  name: t,
                };
              }
              if (t && typeof t === "object") {
                // ✅ CRITICAL FIX: Properly extract ID and name
                return {
                  id: t.id, // Use the actual database ID
                  name: t.name ?? t.title ?? t.town ?? "",
                };
              }
              return { id: String(t), name: String(t ?? "") };
            })
            .filter((t) => t.name);
        } else if (Array.isArray(r.townNames)) {
          townsArr = r.townNames
            .map((name) => ({ id: name, name }))
            .filter((t) => t.name);
        } else {
          townsArr = [];
        }

        return {
          region: regionName,
          towns: townsArr,
          _raw: r,
        };
      })
    : [];

  return { regions, raw: res };
}

export async function getLocations() {
  try {
    const res = await fetchJson("", { method: "GET" });
    const mapped = mapLocationsResponse(res);
    return mapped.regions;
  } catch (err) {
    console.error("getLocations error:", err);
    return [];
  }
}

export async function createRegion(body = { name: "" }) {
  try {
    const res = await fetchJson("/regions", { method: "POST", body });
    return res;
  } catch (err) {
    console.error("createRegion error:", err);
    throw err;
  }
}

export async function addTown(regionId, body = { name: "" }) {
  if (!regionId) throw new Error("regionId required");
  try {
    const path = `/regions/${encodeURIComponent(String(regionId))}/towns`;
    const res = await fetchJson(path, { method: "POST", body });
    return res;
  } catch (err) {
    console.error("addTown error:", err);
    throw err;
  }
}

export async function updateTown(regionId, townId, body = {}) {
  if (!regionId || !townId) throw new Error("regionId and townId required");
  try {
    const path = `/regions/${encodeURIComponent(
      String(regionId)
    )}/towns/${encodeURIComponent(String(townId))}`;
    const res = await fetchJson(path, { method: "PUT", body });
    return res;
  } catch (err) {
    console.error("updateTown error:", err);
    throw err;
  }
}

export async function deleteTown(regionId, townId) {
  if (!regionId || !townId) throw new Error("regionId and townId required");
  try {
    const path = `/regions/${encodeURIComponent(
      regionId
    )}/towns/${encodeURIComponent(townId)}`;
    const res = await fetchJson(path, { method: "DELETE" });
    return res;
  } catch (err) {
    console.error("deleteTown error:", err);
    throw err;
  }
}

export const locationsData = await getLocations();

export default {
  getLocations,
  createRegion,
  addTown,
  updateTown,
  deleteTown,
  mapLocationsResponse,
  locationsData,
};
