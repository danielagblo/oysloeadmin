import React, { useEffect, useRef, useState } from "react";
import styles from "./support.module.css";
import { supportData } from "../../api/support";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { Caret } from "../../components/SVGIcons/Caret";
import { PlusIcon } from "lucide-react";
import { VoiceNotePlayer } from "../../components/VoiceNotePlayer/VoiceNotePlayer";
import { ImageCaptureIcon } from "../../components/SVGIcons/ImageCaptureIcon";
import { SendButtonIcon } from "../../components/SVGIcons/SendButtonIcon";
import { RecordVoiceNote } from "../../components/SVGIcons/RecordVoiceNote";

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

  // search / filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("All"); // All | Open | Closed | Unread | Recent

  // message input and attachments/record state
  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // mark messages read when selecting a case (per-agent read)
  useEffect(() => {
    if (!selectedCaseId) return;
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCaseId) return c;
        const updatedMessages = c.messages.map((m) => {
          // mark as read for the current agent
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

  // auto-scroll on cases/messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cases, selectedCaseId]);

  /* ---------- utility lookups ---------- */
  function getUser(userId) {
    return (
      users.find((u) => u.id === userId) || { name: "Unknown", avatar: "" }
    );
  }

  const getUnreadCountForAgent = (caseItem, agentId) =>
    (caseItem.messages || []).filter(
      (msg) => msg.senderId !== agentId && !msg.readBy.includes(agentId)
    ).length;

  /* ---------- search logic (live filter + submit jump) ---------- */
  // helper: returns true if case matches search term (user name, message text or attachment url/type)
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

  /* ---------- dropdown filter logic ---------- */
  const applyFilterAndSort = (list) => {
    let out = [...list];
    if (filterOption === "Open") {
      out = out.filter((c) => c.status === "Open");
    } else if (filterOption === "Closed") {
      out = out.filter((c) => c.status === "Closed");
    } else if (filterOption === "Unread") {
      out = out.filter((c) => getUnreadCountForAgent(c, CURRENT_USER) > 0);
    }
    // sort: Recent shows newest updatedAt first, otherwise keep default ordering
    if (filterOption === "Recent") {
      out.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    return out;
  };

  /* ---------- close case ---------- */
  const closeSelectedCase = () => {
    if (!selectedCaseId) return;
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCaseId) return c;
        // append a system message and mark as closed
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

  /* ---------- computed filtered + searched cases ---------- */
  const termLower = (searchTerm || "").trim().toLowerCase();
  const filteredByFilter = applyFilterAndSort(cases);
  const filteredCases = filteredByFilter.filter((c) =>
    caseMatchesSearch(c, termLower)
  );

  /* ---------- return JSX ---------- */
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

          {/* simple filter toggle button (no overlay menu). user asked overlays removed */}
          <div className={styles.dropDown}>
            <button
              type="button"
              onClick={() => {
                // placeholder — user will place dropdown UI themselves
                console.info("Filter toggle clicked (implement dropdown UI)");
              }}
              className={styles.dropToggle}
            >
              <span>{filterOption}</span>
              <Caret />
            </button>
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

        <button
          className={styles.addButton}
          onClick={() => {
            // overlays removed — provide a hook for you to implement your own modal
            console.info(
              "Make case clicked — implement your modal/overlay here"
            );
          }}
        >
          <p>Make case</p>
          <span>
            <PlusIcon size={15} />
          </span>
        </button>
      </div>

      {/* Right column: chat */}
      <div className={styles.actualChatBox}>
        <div className={styles.header}>
          <div className={styles.backButton}>
            <button type="button" onClick={() => setSelectedCaseId(null)}>
              <Caret />
            </button>
            <p>Make case</p>
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

        {/* chat messages */}
        <div className={styles.chatMessagesContainer}>
          {!selectedCaseId ? (
            <div className={styles.emptyState}>Select a conversation</div>
          ) : (
            <>
              <div className={styles.chatMessages}>
                {(() => {
                  const selectedCase = cases.find(
                    (c) => c.id === selectedCaseId
                  );
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

              {/* inputs */}
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
                      // simple optimistic image send
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
                      // append
                      setCases((prev) =>
                        prev.map((c) =>
                          c.id === selectedCaseId
                            ? { ...c, messages: [...c.messages, msg] }
                            : c
                        )
                      );
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
                        setCases((prev) =>
                          prev.map((c) =>
                            c.id === selectedCaseId
                              ? { ...c, messages: [...c.messages, msg] }
                              : c
                          )
                        );
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
                      setCases((prev) =>
                        prev.map((c) =>
                          c.id === selectedCaseId
                            ? { ...c, messages: [...c.messages, msg] }
                            : c
                        )
                      );
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
                      // stop
                      const mr = mediaRecorderRef.current;
                      if (mr && mr.state !== "inactive") mr.stop();
                      setIsRecording(false);
                      return;
                    }
                    // start
                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({
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
                            { id: makeId("att"), type: "audio", url: audioUrl },
                          ],
                          readBy: [CURRENT_USER],
                        };
                        setCases((prev) =>
                          prev.map((c) =>
                            c.id === selectedCaseId
                              ? { ...c, messages: [...c.messages, msg] }
                              : c
                          )
                        );
                        // stop tracks
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
            </>
          )}
        </div>
      </div>
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
