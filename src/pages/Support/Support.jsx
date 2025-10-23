import React, { useEffect, useRef, useState } from "react";
import styles from "./support.module.css";
import { supportData } from "../../api/support";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { Caret } from "../../components/SVGIcons/Caret";
import { PlusIcon, X } from "lucide-react";
import { VoiceNotePlayer } from "../../components/VoiceNotePlayer/VoiceNotePlayer";
import { ImageCaptureIcon } from "../../components/SVGIcons/ImageCaptureIcon";
import { SendButtonIcon } from "../../components/SVGIcons/SendButtonIcon";
import { RecordVoiceNote } from "../../components/SVGIcons/RecordVoiceNote";
import formatNumber from "../../utils/numConverters";

const CURRENT_USER = "u3"; // logged-in support agent id

/* ---------- small helpers ---------- */
const makeId = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

function cloneCases(cases) {
  return cases.map((c) => ({
    ...c,
    messages: (c.messages || []).map((m) => ({
      ...m,
      readBy: Array.isArray(m.readBy) ? [...m.readBy] : [],
      attachments: m.attachments ? [...m.attachments] : [],
    })),
  }));
}

/* ---------- date helpers (unchanged) ---------- */
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isYesterday(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(date, yesterday);
}
function isToday(date) {
  const today = new Date();
  return isSameDay(date, today);
}
function getDateLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------- exported component ---------- */
export const Support = () => {
  // local copy of users so "Make case -> New user" can add temporarily
  const [users, setUsers] = useState(() => [...supportData.users]);
  const [cases, setCases] = useState(() => cloneCases(supportData.cases));
  const [selectedCaseId, setSelectedCaseId] = useState(cases?.[0]?.id || null);
  const messagesEndRef = useRef(null);

  // ... states (unchanged)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("All"); // All | Open | Closed | Unread | Recent

  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // user modal & selection (multi-select)
  const [openFilter, setOpenFilter] = useState(false);
  const [openUsersModal, setOpenUsersModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]); // temp selection in modal
  const [confirmedSelectedUserIds, setConfirmedSelectedUserIds] = useState([]); // selection confirmed by clicking "Select"

  // broadcast modal state & separate inputs (so it doesn't touch normal chat inputs)
  const [openBroadCastModal, setOpenBroadCastModal] = useState(false);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const broadcastEndRef = useRef(null);
  const broadcastFileRef = useRef(null);
  const [isBroadcastRecording, setIsBroadcastRecording] = useState(false);
  const broadcastChunksRef = useRef([]);
  const broadcastRecorderRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cases, selectedCaseId]);

  useEffect(() => {
    if (broadcastEndRef.current)
      broadcastEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [broadcastMessages]);

  // --- NEW: mark messages as read when opening a case ---
  useEffect(() => {
    if (!selectedCaseId) return;
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCaseId) return c;
        const updatedMessages = c.messages.map((m) => {
          if (m.senderId !== CURRENT_USER && !m.readBy.includes(CURRENT_USER)) {
            return { ...m, readBy: [...m.readBy, CURRENT_USER] };
          }
          return m;
        });
        return { ...c, messages: updatedMessages };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseId]);

  // utility
  function getUser(userId) {
    return (
      users.find((u) => u.id === userId) || { name: "Unknown", avatar: "" }
    );
  }
  const getUnreadCountForAgent = (caseItem, agentId) =>
    (caseItem.messages || []).filter(
      (msg) => msg.senderId !== agentId && !msg.readBy.includes(agentId)
    ).length;

  /* ---------- search logic ---------- */
  const caseMatchesSearch = (c, termLower) => {
    if (!termLower) return true;
    const user = getUser(c.userId);
    if (user?.name?.toLowerCase().includes(termLower)) return true;
    return (c.messages || []).some((m) => {
      if ((m.text || "").toLowerCase().includes(termLower)) return true;
      if (
        m.attachments &&
        m.attachments.some((a) => {
          if (a.type && a.type.toLowerCase().includes(termLower)) return true;
          if (a.url && a.url.toLowerCase().includes(termLower)) return true;
          return false;
        })
      )
        return true;
      return false;
    });
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    const termLower = (searchTerm || "").trim().toLowerCase();
    if (!termLower) return;
    const found = cases.find((c) => caseMatchesSearch(c, termLower));
    if (found) setSelectedCaseId(found.id);
  };

  const applyFilterAndSort = (list) => {
    let out = [...list];
    if (filterOption === "Open") out = out.filter((c) => c.status === "Open");
    else if (filterOption === "Closed")
      out = out.filter((c) => c.status === "Closed");
    else if (filterOption === "Unread")
      out = out.filter((c) => getUnreadCountForAgent(c, CURRENT_USER) > 0);
    if (filterOption === "Recent")
      out.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return out;
  };

  const termLower = (searchTerm || "").trim().toLowerCase();
  const filteredByFilter = applyFilterAndSort(cases);
  const filteredCases = filteredByFilter.filter((c) =>
    caseMatchesSearch(c, termLower)
  );

  /* ---------- user modal helpers ---------- */
  const userMatchesSearch = (user, termLower) => {
    if (!termLower) return true;
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    return name.includes(termLower) || email.includes(termLower);
  };
  const filteredUsersForModal = users.filter((u) => {
    if (filterOption === "Verified" && !u.verified) return false;
    if (filterOption === "Unverified" && u.verified) return false;
    if (filterOption === "Online" && !u.online) return false;
    if (filterOption === "Offline" && u.online) return false;
    return userMatchesSearch(u, (userSearchTerm || "").trim().toLowerCase());
  });

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // --- MODIFIED: handleConfirmUserSelect now opens a single user's case if only one selected ---
  const handleConfirmUserSelect = () => {
    if (!selectedUserIds || selectedUserIds.length === 0) {
      // If none selected, just close modal
      setOpenUsersModal(false);
      return;
    }

    // If exactly one user selected -> open or create that user's case and switch to it
    if (selectedUserIds.length === 1) {
      const userId = selectedUserIds[0];

      // confirm recipients (keeps broadcast flow usable later)
      setConfirmedSelectedUserIds([userId]);

      // try to find an existing non-closed case for that user
      const existingOpenCase = cases.find(
        (c) => c.userId === userId && c.status !== "Closed"
      );
      if (existingOpenCase) {
        setSelectedCaseId(existingOpenCase.id);
      } else {
        // if there's a closed case or no case at all, create a new open case for the user
        const now = new Date().toISOString();
        const sysMsg = {
          id: makeId("msg"),
          senderId: CURRENT_USER,
          text: "Case opened by support agent.",
          timestamp: now,
          type: "text",
          readBy: [CURRENT_USER],
        };
        const newCase = {
          id: makeId("case"),
          userId,
          agents: [CURRENT_USER],
          status: "Open",
          createdAt: now,
          updatedAt: now,
          messages: [sysMsg],
        };
        setCases((prev) => [newCase, ...prev]); // add to top
        setSelectedCaseId(newCase.id);
      }

      // close modal and clear temporary selection
      setOpenUsersModal(false);
      setSelectedUserIds([]);
      return;
    }

    // Otherwise (multiple selected) confirm recipients for broadcast
    setConfirmedSelectedUserIds([...selectedUserIds]);
    setOpenUsersModal(false);
    setSelectedUserIds([]);
  };

  const openUsersSelector = () => {
    setSelectedUserIds([]);
    setUserSearchTerm("");
    setOpenUsersModal(true);
  };

  /* ---------- broadcast helpers (unchanged) ---------- */
  const distributeMessageToConfirmedUsers = (msgTemplate) => {
    setCases((prevCases) => {
      const out = [...prevCases];
      const now = new Date().toISOString();

      confirmedSelectedUserIds.forEach((userId) => {
        const idx = out.findIndex(
          (c) => c.userId === userId && c.status !== "Closed"
        );
        if (idx >= 0) {
          const m = { ...msgTemplate, id: makeId("msg"), timestamp: now };
          out[idx] = {
            ...out[idx],
            messages: [...out[idx].messages, m],
            updatedAt: now,
          };
        } else {
          const newCase = {
            id: makeId("case"),
            userId,
            agents: [CURRENT_USER],
            status: "Open",
            createdAt: now,
            updatedAt: now,
            messages: [{ ...msgTemplate, id: makeId("msg"), timestamp: now }],
          };
          out.unshift(newCase);
        }
      });

      return out;
    });
  };

  const handleBroadcastSend = () => {
    if (!confirmedSelectedUserIds || confirmedSelectedUserIds.length === 0) {
      alert(
        "No recipients selected. Click 'Make case' → select users → Select to confirm recipients."
      );
      return;
    }
    if (!broadcastMessage.trim()) return;

    const ok = window.confirm(
      `Send this message to ${confirmedSelectedUserIds.length} users?`
    );
    if (!ok) return;

    const msgTemplate = {
      senderId: CURRENT_USER,
      text: broadcastMessage.trim(),
      type: "text",
      readBy: [CURRENT_USER],
    };

    const displayMsg = {
      ...msgTemplate,
      id: makeId("msg"),
      timestamp: new Date().toISOString(),
    };
    setBroadcastMessages((prev) => [...prev, displayMsg]);

    distributeMessageToConfirmedUsers(msgTemplate);

    setBroadcastMessage("");
  };

  const handleBroadcastImage = async (e) => {
    if (!confirmedSelectedUserIds || confirmedSelectedUserIds.length === 0) {
      alert("No recipients selected.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    const msgTemplate = {
      senderId: CURRENT_USER,
      text: "",
      type: "attachment",
      attachments: [{ id: makeId("att"), type: "image", url: preview }],
      readBy: [CURRENT_USER],
    };

    const ok = window.confirm(
      `Send this image to ${confirmedSelectedUserIds.length} users?`
    );
    if (!ok) {
      e.target.value = "";
      return;
    }

    const displayMsg = {
      ...msgTemplate,
      id: makeId("msg"),
      timestamp: new Date().toISOString(),
    };
    setBroadcastMessages((prev) => [...prev, displayMsg]);

    distributeMessageToConfirmedUsers(msgTemplate);
    e.target.value = "";
  };

  const handleBroadcastRecord = async () => {
    if (!confirmedSelectedUserIds || confirmedSelectedUserIds.length === 0) {
      alert("No recipients selected.");
      return;
    }

    if (isBroadcastRecording) {
      const mr = broadcastRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
      setIsBroadcastRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      broadcastChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      broadcastRecorderRef.current = mr;

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0)
          broadcastChunksRef.current.push(ev.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(broadcastChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(blob);
        const msgTemplate = {
          senderId: CURRENT_USER,
          text: "",
          type: "attachment",
          attachments: [{ id: makeId("att"), type: "audio", url: audioUrl }],
          readBy: [CURRENT_USER],
        };

        const ok = window.confirm(
          `Send this voice note to ${confirmedSelectedUserIds.length} users?`
        );
        if (!ok) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const displayMsg = {
          ...msgTemplate,
          id: makeId("msg"),
          timestamp: new Date().toISOString(),
        };
        setBroadcastMessages((prev) => [...prev, displayMsg]);

        distributeMessageToConfirmedUsers(msgTemplate);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setIsBroadcastRecording(true);
    } catch (err) {
      alert("Cannot access microphone.");
    }
  };

  /* ---------- single-chat send / attachments (unchanged) ---------- */
  const sendMessageToSelectedCase = (msgObj) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCaseId
          ? {
              ...c,
              messages: [...c.messages, msgObj],
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
  };

  /* ---------- close case ---------- */
  const closeSelectedCase = () => {
    if (!selectedCaseId) return;
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCaseId) return c;
        const sysMsg = {
          id: makeId("sys"),
          senderId: CURRENT_USER,
          text: "Case closed by support agent.",
          timestamp: new Date().toISOString(),
          type: "text",
          readBy: [CURRENT_USER],
        };
        return {
          ...c,
          status: "Closed",
          updatedAt: new Date().toISOString(),
          messages: [...c.messages, sysMsg],
        };
      })
    );
  };

  /* ---------- helpers to find selectedCase and its status ---------- */
  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const selectedCaseIsClosed = !!(
    selectedCase && selectedCase.status === "Closed"
  );

  /* ---------- JSX ---------- */
  return (
    <div className={styles.supportContainer}>
      {/* Left column: cases */}
      <div className={styles.allChatBox}>
        <div className={styles.header}>
          <div onSubmit={handleSearchSubmit} className={styles.searchBox}>
            <button
              type="submit"
              aria-label="Search"
              style={{ background: "transparent", border: "none", padding: 4 }}
            >
              <SearchIcon />
            </button>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cases"
              className={styles.searchBoxInput}
              aria-label="Search cases"
            />
          </div>

          <div className={styles.dropDown}>
            <span>{filterOption}</span>

            <button
              type="button"
              onClick={() => setOpenFilter((p) => !p)}
              className={styles.dropToggle}
            >
              <Caret />
            </button>
            {openFilter && (
              <ul className={styles.filterMenu}>
                {["All", "Open", "Closed", "Unread", "Recent"].map((p, i) => (
                  <li
                    key={i}
                    role="menuitem"
                    className={p === filterOption ? styles.timeActive : ""}
                    onClick={() => {
                      setFilterOption(p);
                      setOpenFilter(false);
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <ul className={styles.casesContainer}>
          {filteredCases?.map((caseItem) => {
            const user = getUser(caseItem.userId);
            const count = getUnreadCountForAgent(caseItem, CURRENT_USER);
            const lastMessage =
              caseItem.messages?.[caseItem.messages.length - 1] || null;
            return (
              <li
                key={caseItem.id}
                onClick={() => setSelectedCaseId(caseItem.id)}
                className={`${styles.case} ${
                  selectedCaseId === caseItem.id ? styles.activeCase : ""
                }`}
                role="button"
                tabIndex={0}
              >
                <div className={styles.imageBox}>
                  <img src={user?.avatar} alt={user?.name} />
                  {user?.online && <span className={styles.active} />}
                </div>

                <div className={styles.textBox}>
                  <div className={styles.name}>{user?.name}</div>
                  <div className={styles.lastMessage}>
                    {lastMessage?.text ||
                      (lastMessage?.attachments &&
                        lastMessage.attachments[0]?.type?.toUpperCase()) ||
                      ""}
                  </div>
                  {caseItem?.status === "Closed" && (
                    <div className={styles.closed}>{caseItem?.status}</div>
                  )}
                </div>

                {count > 0 && <div className={styles.count}>{count}</div>}
              </li>
            );
          })}
        </ul>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "1rem",
          }}
        >
          <button
            className={styles.addButton}
            onClick={() => openUsersSelector()}
          >
            <p>Make case</p>
            <span>
              <PlusIcon size={15} />
            </span>
          </button>

          {/* Broadcast main button: enabled only after selection is confirmed via Select */}
          <button
            className={styles.broadcastMainButton}
            disabled={!confirmedSelectedUserIds.length}
            onClick={() => {
              if (!confirmedSelectedUserIds.length) {
                alert(
                  "Select recipients first (Make case → pick users → Select)."
                );
                return;
              }
              setOpenBroadCastModal(true);
            }}
            style={{
              opacity: confirmedSelectedUserIds.length ? 1 : 0.5,
              padding: "0.6rem 0.9rem",
              borderRadius: 8,
            }}
          >
            Broadcast{" "}
            <span style={{ marginLeft: 8, fontWeight: 700 }}>
              {confirmedSelectedUserIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* Right column: chat */}
      <div className={styles.actualChatBox}>
        <div className={styles.header}>
          <div className={styles.backButton}>
            <button type="button" onClick={() => setSelectedCaseId(null)}>
              <Caret />
            </button>
            <p>Back</p>
          </div>

          <div>
            <button
              className={styles.closeButton}
              onClick={closeSelectedCase}
              disabled={!selectedCaseId}
            >
              Close Case
            </button>
          </div>
        </div>

        <div className={styles.chatMessagesContainer}>
          {!selectedCaseId ? (
            <div className={styles.emptyState}>Select a conversation</div>
          ) : (
            <>
              <div className={styles.chatMessages}>
                {(() => {
                  if (!selectedCase) return null;
                  return groupMessagesByDate(selectedCase.messages).map(
                    (group) => (
                      <div key={group.label} className={styles.dateGroup}>
                        <div className={styles.dateDivider}>{group.label}</div>

                        {group.messages.map((msg) => {
                          const sender = getUser(msg.senderId);
                          const isOutgoing =
                            msg.senderId === CURRENT_USER ||
                            sender?.role === "support";

                          return (
                            <div
                              key={msg.id}
                              className={`${styles.messageRow} ${
                                isOutgoing ? styles.outgoing : styles.incoming
                              }`}
                            >
                              {!isOutgoing && (
                                <div className={styles.messageAvatar}>
                                  <img
                                    src={sender?.avatar}
                                    alt={sender?.name}
                                  />
                                </div>
                              )}

                              <p className={styles.senderName}>
                                {sender?.name}
                              </p>

                              <div className={styles.messageBubble}>
                                {msg.text && (
                                  <div className={styles.messageText}>
                                    {msg.text}
                                  </div>
                                )}

                                {msg.attachments &&
                                  msg.attachments.map((att) => {
                                    if (att.type === "image") {
                                      return (
                                        <img
                                          key={att.id}
                                          src={att.url}
                                          alt="attachment"
                                          className={styles.attachmentImage}
                                        />
                                      );
                                    }
                                    if (att.type === "audio") {
                                      return (
                                        <VoiceNotePlayer
                                          key={att.id}
                                          src={att?.url}
                                          isSender={isOutgoing}
                                        />
                                      );
                                    }
                                    return null;
                                  })}
                              </div>

                              <div className={styles.messageMeta}>
                                <span className={styles.messageTime}>
                                  {formatTime(msg.timestamp)}
                                </span>
                                {msg.readBy.includes(CURRENT_USER) && (
                                  <span className={styles.seenCheck}>✓</span>
                                )}
                              </div>

                              {isOutgoing && (
                                <div className={styles.messageAvatar}>
                                  <img
                                    src={getUser(CURRENT_USER)?.avatar}
                                    alt="me"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )
                  );
                })()}

                <div ref={messagesEndRef} className={styles.messagesEnd} />
              </div>

              {/* inputs — hidden when case is closed */}
              {!selectedCaseIsClosed && (
                <div className={styles.chatInputs}>
                  <div className={styles.picInputSend}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Attach image"
                    >
                      <ImageCaptureIcon />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const preview = URL.createObjectURL(file);
                        const msg = {
                          id: makeId("msg"),
                          senderId: CURRENT_USER,
                          text: "",
                          timestamp: new Date().toISOString(),
                          type: "attachment",
                          attachments: [
                            { id: makeId("att"), type: "image", url: preview },
                          ],
                          readBy: [CURRENT_USER],
                        };
                        sendMessageToSelectedCase(msg);
                        e.target.value = "";
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newMessage.trim()) {
                          const msg = {
                            id: makeId("msg"),
                            senderId: CURRENT_USER,
                            text: newMessage.trim(),
                            timestamp: new Date().toISOString(),
                            type: "text",
                            readBy: [CURRENT_USER],
                          };
                          sendMessageToSelectedCase(msg);
                          setNewMessage("");
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (!newMessage.trim()) return;
                        const msg = {
                          id: makeId("msg"),
                          senderId: CURRENT_USER,
                          text: newMessage.trim(),
                          timestamp: new Date().toISOString(),
                          type: "text",
                          readBy: [CURRENT_USER],
                        };
                        sendMessageToSelectedCase(msg);
                        setNewMessage("");
                      }}
                      aria-label="Send message"
                    >
                      <SendButtonIcon />
                    </button>
                  </div>

                  <button
                    className={`${styles.recordButton} ${
                      isRecording && styles.recording
                    }`}
                    type="button"
                    onClick={async () => {
                      if (isRecording) {
                        const mr = mediaRecorderRef.current;
                        if (mr && mr.state !== "inactive") mr.stop();
                        setIsRecording(false);
                        return;
                      }
                      try {
                        const stream =
                          await navigator.mediaDevices.getUserMedia({
                            audio: true,
                          });
                        recordedChunksRef.current = [];
                        const mr = new MediaRecorder(stream);
                        mediaRecorderRef.current = mr;
                        mr.ondataavailable = (ev) => {
                          if (ev.data && ev.data.size > 0)
                            recordedChunksRef.current.push(ev.data);
                        };
                        mr.onstop = async () => {
                          const blob = new Blob(recordedChunksRef.current, {
                            type: "audio/webm",
                          });
                          const audioUrl = URL.createObjectURL(blob);
                          const msg = {
                            id: makeId("msg"),
                            senderId: CURRENT_USER,
                            text: "",
                            timestamp: new Date().toISOString(),
                            type: "attachment",
                            attachments: [
                              {
                                id: makeId("att"),
                                type: "audio",
                                url: audioUrl,
                              },
                            ],
                            readBy: [CURRENT_USER],
                          };
                          sendMessageToSelectedCase(msg);
                          stream.getTracks().forEach((t) => t.stop());
                        };
                        mr.start();
                        setIsRecording(true);
                      } catch (err) {
                        alert("Cannot access microphone.");
                      }
                    }}
                  >
                    <RecordVoiceNote />
                  </button>
                </div>
              )}

              {selectedCaseIsClosed && (
                <div
                  style={{
                    padding: 12,
                    textAlign: "center",
                    color: "var(--color-muted)",
                  }}
                >
                  This case is closed. You cannot send messages here.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Users Modal: pick recipients */}
      {openUsersModal && (
        <div className={styles.addCaseModalContainer}>
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <div className={styles.header}>
                <div className={styles.searchBox}>
                  <button
                    type="button"
                    aria-label="Search"
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 4,
                    }}
                  >
                    <SearchIcon />
                  </button>
                  <input
                    type="search"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search users"
                    className={styles.searchBoxInput}
                    aria-label="Search users"
                  />
                </div>

                <div className={styles.dropDown}>
                  <span>{filterOption}</span>
                  <button
                    type="button"
                    onClick={() => setOpenFilter((prev) => !prev)}
                    className={styles.dropToggle}
                    aria-expanded={openFilter}
                  >
                    <Caret />
                  </button>

                  {openFilter && (
                    <ul className={styles.filterMenu} role="menu">
                      {[
                        "All",
                        "Verified",
                        "Unverified",
                        "Online",
                        "Offline",
                      ].map((p) => (
                        <li
                          key={p}
                          role="menuitem"
                          className={
                            p === filterOption ? styles.timeActive : ""
                          }
                          onClick={() => {
                            setFilterOption(p);
                            setOpenFilter(false);
                          }}
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <ul className={styles.userItemList}>
                {filteredUsersForModal.length === 0 && (
                  <li className={styles.emptyRow}>No users found</li>
                )}

                {filteredUsersForModal.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <li
                      key={user.id}
                      className={`${styles.userItem} ${
                        isSelected ? styles.userItemActive : ""
                      }`}
                      role="listitem"
                    >
                      <img src={user.avatar} alt={user.name} />
                      <div className={styles.info}>
                        <p className={styles.userName}>{user.name}</p>
                        <p className={styles.userMeta}>
                          {user.verified ? "Verified" : "Unverified"} ●{" "}
                          {user.online ? "Online" : "Offline"}
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUserSelection(user.id)}
                        className={styles.selectionRadio}
                        aria-label={`Select ${user.name}`}
                      />
                    </li>
                  );
                })}
              </ul>

              <div className={styles.buttonsTray}>
                {/* Select confirms recipients and enables main Broadcast button */}
                <button
                  className={styles.selectButton}
                  type="button"
                  onClick={() => handleConfirmUserSelect()}
                >
                  {selectedUserIds.length
                    ? `Select (${selectedUserIds.length})`
                    : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast modal (opened from main Broadcast button) */}
      {openBroadCastModal && (
        <div className={styles.boradCastModalContainer}>
          <button
            onClick={() => {
              setOpenBroadCastModal(false);
              setConfirmedSelectedUserIds([]);
            }}
            className={styles.closeBroadcast}
          >
            <X />
          </button>
          <div className={styles.chatMessagesContainer}>
            <div className={styles.chatMessages}>
              {broadcastMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageRow} ${styles.outgoing}`}
                >
                  <div className={styles.messageBubble}>
                    {msg.text && (
                      <div className={styles.messageText}>{msg.text}</div>
                    )}
                    {msg.attachments?.map((att) => {
                      if (att.type === "image")
                        return (
                          <img
                            key={att.id}
                            src={att.url}
                            alt="attachment"
                            className={styles.attachmentImage}
                          />
                        );
                      if (att.type === "audio")
                        return (
                          <VoiceNotePlayer
                            key={att.id}
                            src={att.url}
                            isSender
                          />
                        );
                      return null;
                    })}
                  </div>
                  <div className={styles.messageMeta}>
                    <span className={styles.messageTime}>
                      {formatTime(msg.timestamp)}
                    </span>
                    <span className={styles.seenCheck}>✓</span>
                  </div>
                </div>
              ))}
              <div ref={broadcastEndRef} className={styles.messagesEnd} />
            </div>

            <div className={styles.chatInputs}>
              <div className={styles.picInputSend}>
                <button
                  type="button"
                  onClick={() => broadcastFileRef.current?.click()}
                  aria-label="Attach image"
                >
                  <ImageCaptureIcon />
                </button>
                <input
                  ref={broadcastFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleBroadcastImage}
                />

                <input
                  type="text"
                  placeholder="Type a broadcast message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && broadcastMessage.trim())
                      handleBroadcastSend();
                  }}
                />

                <button
                  type="button"
                  onClick={handleBroadcastSend}
                  aria-label="Send broadcast"
                >
                  <SendButtonIcon />
                </button>
              </div>

              <button
                className={`${styles.recordButton} ${
                  isBroadcastRecording && styles.recording
                }`}
                type="button"
                onClick={handleBroadcastRecord}
              >
                <RecordVoiceNote />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- helper used in render (kept outside to avoid recreation) ---------- */
function groupMessagesByDate(messages = []) {
  const groups = [];
  let currentLabel = null;
  messages
    .slice()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .forEach((msg) => {
      const label = getDateLabel(msg.timestamp);
      if (label !== currentLabel) {
        groups.push({ label, messages: [msg] });
        currentLabel = label;
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
  return groups;
}
