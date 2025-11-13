import React, { useState } from "react";
import styles from "./settings.module.css";
import { Caret } from "../../components/SVGIcons/Caret";
import {
  settingsData as initialSettingsData,
  updatePrivacyPolicy,
  updateTermsConditions,
} from "../../api/settings";
import { formatChatTimestamp, timeAgo } from "../../utils/numConverters";
import { ReviewStars } from "../../components/ReviewStars/ReviewStars";

/**
 * Settings screen:
 * - Left nav as before
 * - Content: Privacy / Terms (textarea) OR Feedback OR Reports
 * - Feedback: filter by star count (All / 5..1)
 * - Reports: filter by status (All / Open / Pending / Resolved)
 * - Inline resolve UI for each report (mandatory note) -> marks as Resolved
 */

const CURRENT_USER = "Jeff07"; // name used as resolver when saving resolve

export const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState("privacyPolicy");

  // dropdown open toggle
  const [openDropDown, setOpenDropDown] = useState(false);

  // feedback filter (All | "5".."1")
  const [filterStars, setFilterStars] = useState("All");

  // reports filter (All | Open | Pending | Resolved)
  const [filterReportStatus, setFilterReportStatus] = useState("All");

  // local mutable copy of settingsData so we can mark reports resolved
  const [settingsData, setSettingsData] = useState(() => {
    // deep-ish clone to avoid mutating imported constant
    return JSON.parse(JSON.stringify(initialSettingsData));
  });

  // toggled resolve inputs (map reportId -> boolean) and resolve notes
  const [resolveOpenById, setResolveOpenById] = useState({});
  const [resolveNotesById, setResolveNotesById] = useState({});
  const [tcpContent, setTcpContent] = useState(() => {
    return {
      privacyPolicy: (settingsData.privacyPolicy?.content || []).join("\n\n"),
      termsConditions: (settingsData.termsConditions?.content || []).join(
        "\n\n"
      ),
    };
  });

  // left-side menu items
  const settings = [
    { name: "Privacy Policy", slug: "privacyPolicy" },
    { name: "Terms & Conditions", slug: "termsConditions" },
    { name: "Feedback", slug: "feedback" },
    { name: "Report", slug: "report" },
  ];

  /* ---------- derived lists ---------- */
  const feedbackList = settingsData?.feedback || [];
  const filteredFeedback =
    filterStars === "All"
      ? feedbackList
      : feedbackList.filter((f) => Number(f.stars) === Number(filterStars));

  const reportList = settingsData?.reports || [];
  const filteredReports =
    filterReportStatus === "All"
      ? reportList
      : reportList.filter((r) => r.status === filterReportStatus);

  /* ---------- handlers ---------- */

  // toggle resolve UI for a report
  const toggleResolveOpen = (reportId) => {
    setResolveOpenById((prev) => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  const handleResolveNoteChange = (reportId, value) => {
    setResolveNotesById((prev) => ({ ...prev, [reportId]: value }));
  };

  // Save resolve: require note, update report status to Resolved (and set resolvedBy/resolvedAt)
  const handleSaveResolve = (reportId) => {
    const note = (resolveNotesById[reportId] || "").trim();
    if (!note) {
      alert("Please add a resolve note (mandatory).");
      return;
    }

    setSettingsData((prev) => {
      const next = { ...prev };
      next.reports = (next.reports || []).map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: "Resolved",
            resolveNote: note,
            resolvedAt: new Date().toISOString(),
            resolvedBy: CURRENT_USER,
          };
        }
        return r;
      });
      return next;
    });

    // close the resolve UI and clear the note
    setResolveOpenById((prev) => ({ ...prev, [reportId]: false }));
    setResolveNotesById((prev) => ({ ...prev, [reportId]: "" }));
  };

  const handleCancelResolve = (reportId) => {
    setResolveOpenById((prev) => ({ ...prev, [reportId]: false }));
    setResolveNotesById((prev) => ({ ...prev, [reportId]: "" }));
  };

  /* ---------- rendering helpers ---------- */
  const currentTCPDate =
    settingsData[selectedSetting]?.date || settingsData.privacyPolicy?.date;

  // dynamic dropdown options depending on selected tab
  const dropdownOptions =
    selectedSetting === "feedback"
      ? ["All", "5", "4", "3", "2", "1"]
      : selectedSetting === "report"
      ? ["All", "Pending", "Resolved"]
      : [];

  // label for the dropdown when visible
  const dropdownLabel =
    selectedSetting === "feedback"
      ? filterStars === "All"
        ? "All ratings"
        : `${filterStars} ★`
      : selectedSetting === "report"
      ? filterReportStatus
      : "";

  return (
    <div className={styles.settingsContainer}>
      <ul className={styles.settingsListBox}>
        {settings?.map((setting, idx) => (
          <li
            key={idx}
            className={`${styles.setting} ${
              selectedSetting === setting?.slug && styles.active
            }`}
            onClick={() => {
              setSelectedSetting(setting?.slug);
              // reset dropdown states for clarity
              setOpenDropDown(false);
              setFilterStars("All");
              setFilterReportStatus("All");
            }}
            role="button"
            tabIndex={0}
          >
            <p>{setting?.name}</p>
            <span>
              <Caret />
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.settingBox}>
        {selectedSetting === "privacyPolicy" ||
        selectedSetting === "termsConditions" ? (
          <div className={styles.tcpContent}>
            <h1>{settings?.find((s) => s?.slug === selectedSetting)?.name}</h1>

            <p>Dated {timeAgo(currentTCPDate)}</p>

            <textarea
              value={tcpContent[selectedSetting]}
              onChange={(e) =>
                setTcpContent((prev) => ({
                  ...prev,
                  [selectedSetting]: e.target.value,
                }))
              }
            />
            {/* <textarea defaultValue={settingsData[selectedSetting]?.content} /> */}

            <button
              className={styles.saveButton}
              onClick={async () => {
                const contentArr = tcpContent[selectedSetting]
                  .split(/\n{2,}/)
                  .map((s) => s.trim())
                  .filter(Boolean);

                try {
                  let updated;
                  if (selectedSetting === "privacyPolicy") {
                    updated = await updatePrivacyPolicy({
                      title: settingsData.privacyPolicy.title,
                      content: contentArr,
                      version: settingsData.privacyPolicy.version,
                    });
                  } else if (selectedSetting === "termsConditions") {
                    updated = await updateTermsConditions({
                      title: settingsData.termsConditions.title,
                      content: contentArr,
                      version: settingsData.termsConditions.version,
                    });
                  }

                  // update local state so UI reflects latest
                  setSettingsData((prev) => ({
                    ...prev,
                    [selectedSetting]: updated,
                  }));

                  alert("Saved successfully!");
                } catch (err) {
                  console.error("Save failed:", err);
                  alert("Failed to save. " + (err?.message ?? ""));
                }
              }}
            >
              Save
            </button>
          </div>
        ) : (
          <div className={styles.feedbackContainer}>
            <div className={styles.feedbackHeader}>
              {/* Dynamic dropdown only for feedback & reports */}
              {(selectedSetting === "feedback" ||
                selectedSetting === "report") && (
                <div className={styles.dropDown}>
                  <span>
                    {dropdownLabel ||
                      (selectedSetting === "feedback" ? "All ratings" : "All")}
                  </span>

                  <button
                    type="button"
                    onClick={() => setOpenDropDown((p) => !p)}
                    className={styles.dropToggle}
                    aria-expanded={openDropDown}
                    aria-haspopup="menu"
                  >
                    <Caret />
                  </button>

                  {openDropDown && (
                    <ul className={styles.filterMenu} role="menu">
                      {dropdownOptions.map((opt) => {
                        // For feedback opt will be "All" or "5".."1"
                        // For reports opt will be status strings
                        const isActive =
                          (selectedSetting === "feedback" &&
                            filterStars === opt) ||
                          (selectedSetting === "report" &&
                            filterReportStatus === opt);

                        return (
                          <li
                            key={opt}
                            role="menuitem"
                            className={isActive ? styles.timeActive : ""}
                            onClick={() => {
                              if (selectedSetting === "feedback") {
                                setFilterStars(opt);
                              } else {
                                setFilterReportStatus(opt);
                              }
                              setOpenDropDown(false);
                            }}
                          >
                            {selectedSetting === "feedback"
                              ? opt === "All"
                                ? "All"
                                : `${opt} star${opt > 1 ? "s" : ""}`
                              : opt}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* FEEDBACK VIEW */}
            {selectedSetting === "feedback" && (
              <ul className={styles.feedbackBox}>
                {filteredFeedback?.length === 0 && (
                  <li className={styles.emptyRow}>No feedback found.</li>
                )}

                {filteredFeedback?.map((feedback, idx) => (
                  <li key={idx} className={styles.feedback}>
                    <div className={styles.feedbackItemHeader}>
                      <div className={styles.feedbackGiver}>
                        <img src={feedback?.avatar} alt={feedback?.name} />
                        <p>{feedback?.name}</p>
                      </div>
                      <div className={styles.stars}>
                        <ReviewStars count={feedback?.stars} />
                      </div>
                    </div>

                    <div className={styles.feedbackComments}>
                      {feedback?.comment}
                    </div>

                    <div className={styles.time}>
                      {formatChatTimestamp(feedback?.timeStamp)}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* REPORTS VIEW */}
            {selectedSetting === "report" && (
              <ul className={styles.feedbackBox}>
                {filteredReports?.length === 0 && (
                  <li className={styles.emptyRow}>No reports found.</li>
                )}

                {filteredReports?.map((r) => (
                  <li key={r.id} className={styles.feedback}>
                    <div className={styles.feedbackItemHeader}>
                      <div className={styles.reporterReportee}>
                        <div className={styles.feedbackGiver}>
                          <img src={r.reporter.avatar} alt={r.reporter.name} />
                          <div>
                            <div>{r.reporter.name}</div>
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--color-muted)",
                              }}
                            >
                              Reporter
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            marginBottom: 6,
                            fontWeight: 600,
                            fontSize: 12,
                            color: "var(--color-muted)",
                          }}
                        >
                          {">>"}
                        </div>
                        <div className={styles.feedbackGiver}>
                          <img src={r.reportee.avatar} alt={r.reportee.name} />
                          <div>
                            <div>{r.reportee.name}</div>
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--color-muted)",
                              }}
                            >
                              Reportee
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginLeft: "auto", textAlign: "right" }}>
                        {r.status === "Resolved" ? (
                          <div style={{ marginTop: 8 }}>
                            <button
                              className={styles.showButton}
                              type="button"
                              onClick={() =>
                                setResolveOpenById((prev) => ({
                                  ...prev,
                                  [r.id]: !prev[r.id],
                                }))
                              }
                            >
                              {resolveOpenById[r.id]
                                ? "Hide note"
                                : "Show note"}
                            </button>
                          </div>
                        ) : (
                          <div style={{ marginTop: 8 }}>
                            <button
                              className={styles.resolveButton}
                              type="button"
                              onClick={() =>
                                setResolveOpenById((prev) => ({
                                  ...prev,
                                  [r.id]: !prev[r.id],
                                }))
                              }
                            >
                              Resolve
                            </button>
                          </div>
                        )}

                        {/* Show resolved note block if report is resolved and toggle is open.
    Display a placeholder if no resolveNote exists. */}
                        {r.status === "Resolved" && resolveOpenById[r.id] && (
                          <div
                            className={styles.resolveBox}
                            style={{ marginTop: 10 }}
                          >
                            <div>
                              {r.resolveNote ? (
                                <textarea defaultValue={r.resolveNote} />
                              ) : (
                                <p
                                  style={{
                                    marginTop: 8,
                                    color: "var(--color-muted)",
                                  }}
                                >
                                  No resolve note provided.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>{r.reason}</div>

                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div className={styles.time}>
                        {/* Show resolved info if resolved, otherwise show createdAt */}
                        {r.status === "Resolved" ? (
                          <div className={styles.resolvedTime}>
                            <div>
                              Resolved by <b>{r.resolvedBy || "—"} </b>
                              {formatChatTimestamp(r?.resolvedAt)}
                            </div>

                            <div>{formatChatTimestamp(r.createdAt)}</div>
                          </div>
                        ) : (
                          <div>{formatChatTimestamp(r.createdAt)}</div>
                        )}
                      </div>
                    </div>

                    {/* If resolved and user clicked Show Note, show note (if exists) */}
                    {r.status === "Resolved" &&
                      resolveOpenById[r.id] &&
                      r.resolveNote && (
                        <div
                          className={styles.resolveBox}
                          style={{ marginTop: 10 }}
                        >
                          <div>
                            <textarea defaultValue={r.resolveNote} />
                          </div>
                        </div>
                      )}

                    {/* Resolve UI for unresolved reports */}
                    {resolveOpenById[r.id] && r.status !== "Resolved" && (
                      <div className={styles.resolveBox}>
                        <textarea
                          placeholder="Add a resolve note (mandatory)"
                          value={resolveNotesById[r.id] || ""}
                          onChange={(e) =>
                            handleResolveNoteChange(r.id, e.target.value)
                          }
                        />
                        <div className={styles.buttonBox}>
                          <button
                            onClick={() => handleSaveResolve(r.id)}
                            style={{ padding: "8px 10px", borderRadius: 8 }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleCancelResolve(r.id)}
                            style={{ padding: "8px 10px", borderRadius: 8 }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// helper used by groupMessagesByDate (kept here if needed elsewhere)
function getDateLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const oneDay = 24 * 60 * 60 * 1000;
  if (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
    return "Today";
  if (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate() - 1
  )
    return "Yesterday";
  // fallback
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
