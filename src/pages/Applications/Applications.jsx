import React, { useMemo, useState, useEffect, useRef } from "react";
import styles from "./applications.module.css";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { Caret } from "../../components/SVGIcons/Caret";
import {
  getApplications,
  downloadDocument,
  updateApplicationStatus,
} from "../../api/applications";
import ImageIcon from "../../components/SVGIcons/ImageIcon";
import Download from "../../assets/downloadCopy.png";

/**
 * Helpers to parse a few common human date strings that your mock uses.
 * Supports:
 *  - createdAt (ISO) if present
 *  - "Today HH:MM", "Yesterday HH:MM"
 *  - "X days ago"
 *  - "Last week"
 */
function parseDateApplied(raw) {
  if (!raw) return null;

  // if it's already an ISO-ish createdAt
  if (/\d{4}-\d{2}-\d{2}T/.test(raw)) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  // If already a Date object
  if (raw instanceof Date) return raw;

  const s = String(raw).trim().toLowerCase();

  const now = new Date();

  // Today 12:00 or today 9:30 pm
  if (s.startsWith("today")) {
    const timePart = s.replace(/^today/, "").trim();
    if (!timePart) return new Date(now);
    const parsed = new Date(`${now.toDateString()} ${timePart}`);
    return isNaN(parsed.getTime()) ? new Date(now) : parsed;
  }

  // Yesterday 4:35 PM
  if (s.startsWith("yesterday")) {
    const timePart = s.replace(/^yesterday/, "").trim();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!timePart) return yesterday;
    const parsed = new Date(`${yesterday.toDateString()} ${timePart}`);
    return isNaN(parsed.getTime()) ? yesterday : parsed;
  }

  // "2 days ago" or "3 days ago"
  const daysMatch = s.match(/(\d+)\s+days?\s+ago/);
  if (daysMatch) {
    const n = parseInt(daysMatch[1], 10);
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  }

  // "last week"
  if (s.includes("last week")) {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  // fallback: try Date parse
  const tryParse = new Date(raw);
  return isNaN(tryParse.getTime()) ? null : tryParse;
}

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

function matchesTimePeriod(row, period) {
  if (!period || period === "All") return true;

  const ts = row?.dateApplied || row?.createdAt || row?.appliedAt || null;
  const rowDate = parseDateApplied(ts);
  if (!rowDate) return false;

  const now = Date.now();
  const diffMs = now - rowDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  const p = (period || "").toLowerCase();
  if (p.includes("today")) {
    return new Date(rowDate).toDateString() === new Date().toDateString();
  }
  if (p.includes("yesterday")) {
    const y = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(rowDate).toDateString() === y.toDateString();
  }
  if (p.includes("7") || p.includes("week")) {
    return diffDays <= 7;
  }
  if (p.includes("1 month") || p.includes("month")) {
    return diffDays <= 30;
  }
  // default accept
  return true;
}

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedTime, setSelectedTime] = useState("All");
  const [timeOpen, setTimeOpen] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getApplications();
      setApplications(response.applications || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      alert("Failed to load applications: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle document download
  const handleDownload = async (applicationId, documentType = "resume") => {
    try {
      setActionLoading(true);
      const result = await downloadDocument(applicationId, documentType);

      if (result.downloadUrl) {
        // Create a temporary link to trigger download
        const link = document.createElement("a");
        link.href = result.downloadUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Download URL not available");
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download document: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (
    applicationId,
    status,
    notes = "",
    feedback = ""
  ) => {
    try {
      setActionLoading(true);
      await updateApplicationStatus(applicationId, status, notes, feedback);
      await fetchApplications(); // Refresh data
      alert("Application status updated successfully");
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ensure your periods list — you can replace with constants or API-provided periods
  const periods = ["All", "Today", "Yesterday", "7 days", "1 month"];

  // filtering logic: search across name / email / phone / location / coverLetter
  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return (applications || []).filter((app) => {
      // time filter
      if (!matchesTimePeriod(app, selectedTime)) return false;

      // search filter
      if (!q) return true;
      const hay = [
        app?.name,
        app?.email,
        app?.phone,
        app?.location,
        app?.coverLetter,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [applications, query, selectedTime]);

  if (loading) {
    return <div className={styles.loading}>Loading applications...</div>;
  }

  return (
    <div className={styles.applicationsContainer}>
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search by name, email, phone, location..."
          />
        </div>

        <div className={styles.dropDown}>
          <p>{selectedTime}</p>
          <button onClick={() => setTimeOpen((p) => !p)}>
            <Caret />
          </button>

          {timeOpen && (
            <ul className={styles.timeMenu}>
              {periods.map((p, i) => (
                <li
                  key={i}
                  className={p === selectedTime ? styles.timeActive : ""}
                  onClick={() => {
                    setSelectedTime(p);
                    setTimeOpen(false);
                  }}
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className={styles.total}>~ {String(filtered.length)} applications</p>

      <div className={styles.table}>
        {(filtered || []).map((application, idx) => (
          <div
            key={application.id || application.email || idx}
            className={styles.row}
          >
            <img
              src={
                application?.img ||
                `https://randomuser.me/api/portraits/lego/${idx}.jpg`
              }
              alt={application?.name}
            />
            <p>{application?.name}</p>
            <p>{application?.phone}</p>
            <p>{application?.email}</p>
            <p>{application?.location}</p>
            <p>{application?.age} yrs</p>

            <button
              className={styles.coverLetter}
              onClick={() => setRowData(application)}
            >
              Cover Letter
            </button>

            <div className={styles.downloadAndTime}>
              <button
                className={styles.download}
                onClick={() => handleDownload(application.id, "resume")}
                disabled={actionLoading}
              >
                <ImageIcon size={1.5} src={Download} />
                <p>{actionLoading ? "Downloading..." : "Download"}</p>
              </button>
              <p>{formatDateForDisplay(application?.dateApplied)}</p>
            </div>
          </div>
        ))}
      </div>

      {rowData && (
        <>
          {/* backdrop (click to close) */}
          <div
            className={styles.backdrop}
            onClick={() => setRowData(null)}
            role="button"
            tabIndex={0}
            aria-label="close modal"
          />

          <div className={styles.modal} role="dialog" aria-modal="true">
            <h1>Cover Letter - {rowData?.name}</h1>
            <p>Dated {formatDateForDisplay(rowData?.dateApplied)}</p>
            <textarea readOnly value={rowData?.coverLetter} />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: "1rem",
              }}
            >
              <button
                onClick={() =>
                  handleStatusUpdate(
                    rowData.id,
                    "approved",
                    "Cover letter reviewed",
                    "Good fit for the role"
                  )
                }
                disabled={actionLoading}
                style={{ background: "#4CAF50", color: "white" }}
              >
                {actionLoading ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={() =>
                  handleStatusUpdate(
                    rowData.id,
                    "rejected",
                    "Cover letter reviewed",
                    "Not a good fit"
                  )
                }
                disabled={actionLoading}
                style={{ background: "#f44336", color: "white" }}
              >
                {actionLoading ? "Processing..." : "Reject"}
              </button>
              <button onClick={() => setRowData(null)}>Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
