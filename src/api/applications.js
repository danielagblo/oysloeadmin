// export const applicationsData = [
//   {
//     img: "https://randomuser.me/api/portraits/men/12.jpg",
//     name: "Daniel Kery",
//     phone: "0552892433",
//     email: "agblod@gmail.com",
//     location: "Accra",
//     age: 18,
//     coverLetter:
//       "I am passionate about digital marketing and want to join Oysloe to learn and contribute to the team.",
//     dateApplied: "Today 12:00",
//     fileLink: "/files/cover-letter-daniel.pdf",
//   },
//   {
//     img: "https://randomuser.me/api/portraits/women/12.jpg",
//     name: "Ama Nyarko",
//     phone: "0246123489",
//     email: "ama.nyarko@example.com",
//     location: "Kumasi",
//     age: 22,
//     coverLetter:
//       "As a creative designer, I’d love to work with your visual team to bring modern brand stories to life.",
//     dateApplied: "Yesterday 4:35 PM",
//     fileLink: "/files/cover-letter-ama.pdf",
//   },
//   {
//     img: "https://randomuser.me/api/portraits/men/13.jpg",
//     name: "Michael Tetteh",
//     phone: "0592017456",
//     email: "miketetteh@gmail.com",
//     location: "Tema",
//     age: 25,
//     coverLetter:
//       "Experienced in logistics and coordination, I’m applying to assist with supply chain management.",
//     dateApplied: "2 days ago",
//     fileLink: "/files/cover-letter-mike.pdf",
//   },
//   {
//     img: "https://randomuser.me/api/portraits/women/1.jpg",
//     name: "Esi Boadu",
//     phone: "0509312245",
//     email: "esi.boadu@example.com",
//     location: "Takoradi",
//     age: 20,
//     coverLetter:
//       "As a student in marketing, I’m excited to gain practical experience through this internship.",
//     dateApplied: "3 days ago",
//     fileLink: "/files/cover-letter-esi.pdf",
//   },
//   {
//     img: "https://randomuser.me/api/portraits/men/50.jpg",
//     name: "Kwame Adjei",
//     phone: "0276110098",
//     email: "kwame.adjei@example.com",
//     location: "Cape Coast",
//     age: 24,
//     coverLetter:
//       "I’m applying for the technical assistant position to help maintain and improve digital operations.",
//     dateApplied: "Last week",
//     fileLink: "/files/cover-letter-kwame.pdf",
//   },
// ];

import { getToken } from "./auth";

const API_BASE = `${import.meta.env.VITE_API_BASE || ""}/admin/applications`;

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

/** Map backend application -> UI shape */
export function mapApplicationToUI(app) {
  if (!app) return null;

  // Safe helpers
  const safe = (v, fallback = null) =>
    v === undefined || v === null ? fallback : v;

  const user = app.user || app.applicant || {};
  const documents = app.documents || app.files || [];

  return {
    id: app.id,
    img:
      user.avatar ||
      user.profileImage ||
      `https://randomuser.me/api/portraits/lego/${app.id % 10}.jpg`,
    name:
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.name ||
      "Unknown",
    phone: user.phone || user.phoneNumber || "N/A",
    email: user.email || "N/A",
    location: user.location || user.city || app.location || "N/A",
    age: user.age || calculateAge(user.dateOfBirth) || "N/A",
    coverLetter:
      app.coverLetter || app.message || app.notes || "No cover letter provided",
    dateApplied: app.createdAt || app.appliedAt || app.submittedAt,
    status: app.status || "pending",
    documents: documents,
    _raw: app,
  };
}

/** Calculate age from date of birth */
function calculateAge(dob) {
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
}

/** Format date for display */
function formatDateForDisplay(dateString) {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) {
    return `Today ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/** PUBLIC: Get applications list */
export async function getApplications(query = {}) {
  try {
    // Build query string from object
    const queryString = Object.keys(query)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
      )
      .join("&");

    const path = queryString ? `?${queryString}` : "";
    const res = await fetchJson(path, { method: "GET" });

    const rawApplications = res?.data?.applications || [];
    const applications = rawApplications
      .map(mapApplicationToUI)
      .filter(Boolean);

    return {
      applications,
      pagination: res?.data?.pagination || null,
      raw: res,
    };
  } catch (err) {
    console.error("getApplications error:", err);
    return { applications: [], pagination: null, raw: null };
  }
}

/** PUBLIC: Get single application */
export async function getApplication(id) {
  try {
    if (!id) throw new Error("Application ID required");
    const res = await fetchJson(`/${encodeURIComponent(String(id))}`, {
      method: "GET",
    });
    const application = mapApplicationToUI(res?.data?.application || res?.data);
    return application;
  } catch (err) {
    console.error("getApplication error:", err);
    throw err;
  }
}

/** PUBLIC: Download document */
export async function downloadDocument(applicationId, documentType) {
  try {
    if (!applicationId || !documentType)
      throw new Error("Application ID and document type required");

    const res = await fetchJson(
      `/${encodeURIComponent(String(applicationId))}/download`,
      {
        method: "POST",
        body: { documentType },
      }
    );

    return res?.data || res;
  } catch (err) {
    console.error("downloadDocument error:", err);
    throw err;
  }
}

/** PUBLIC: Update application status */
export async function updateApplicationStatus(
  applicationId,
  status,
  notes = null,
  feedback = null
) {
  try {
    if (!applicationId || !status)
      throw new Error("Application ID and status required");

    const res = await fetchJson(
      `/${encodeURIComponent(String(applicationId))}/status`,
      {
        method: "PUT",
        body: { status, notes, feedback },
      }
    );

    return res?.data?.application || res?.data || res;
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    throw err;
  }
}

// For backward compatibility - static data fallback
export const applicationsData = [];

export default {
  getApplications,
  getApplication,
  downloadDocument,
  updateApplicationStatus,
  mapApplicationToUI,
  applicationsData,
};
