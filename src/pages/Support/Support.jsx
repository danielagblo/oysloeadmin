import React, { useEffect, useRef, useState } from "react";
import styles from "./support.module.css";
import { supportData } from "../../api/support";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { Caret } from "../../components/SVGIcons/Caret";
import { PlusIcon } from "lucide-react";

const CURRENT_USER = "u2"; // logged-in support agent id

function getUser(userId) {
  return supportData?.users.find((user) => user?.id === userId);
}

const getUnreadCountForAgent = (caseItem, agentId) =>
  caseItem.messages.filter(
    (msg) =>
      msg.senderId !== agentId && // don’t count your own messages
      !msg.readBy.includes(agentId) // only unread ones
  ).length;

function cloneCases(cases) {
  // shallow clone structure so we can mutate local state safely
  return cases.map((c) => ({
    ...c,
    messages: c.messages.map((m) => ({
      ...m,
      readBy: Array.isArray(m.readBy) ? [...m.readBy] : [],
      attachments: m.attachments ? [...m.attachments] : undefined,
    })),
  }));
}

/* helpers for date labels */
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
  // locale-friendly format, short month
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

export const Support = () => {
  // clone initial cases so we can mutate readBy locally
  const [cases, setCases] = useState(() => cloneCases(supportData.cases));
  const [selectedCaseId, setSelectedCaseId] = useState("case-1");
  const messagesEndRef = useRef(null);

  // when selectedCaseId changes, mark messages as read for CURRENT_USER
  useEffect(() => {
    if (!selectedCaseId) return;
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCaseId) return c;
        const updatedMessages = c.messages.map((m) => {
          // only mark customer/other-agent messages as read for the current agent
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

  // helper to group messages by date label
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

  // auto-scroll on messages change or case change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cases, selectedCaseId]);

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className={styles.supportContainer}>
      <div className={styles.allChatBox}>
        <div className={styles.header}>
          <div className={styles.searchBox}>
            <SearchIcon />
            <input type="search" placeholder="Search" />
          </div>

          <div className={styles.dropDown}>
            <p>Chat</p>
            <button /* time dropdown placeholder */>
              <Caret />
            </button>
          </div>
        </div>

        <ul className={styles.casesContainer}>
          {cases?.map((caseItem) => {
            const user = getUser(caseItem?.userId);
            const count = getUnreadCountForAgent(caseItem, CURRENT_USER);
            const lastMessage =
              caseItem?.messages?.[caseItem.messages.length - 1] || null;
            return (
              <li
                key={caseItem.id}
                onClick={() => setSelectedCaseId(caseItem.id)}
                className={`${styles.case} ${
                  selectedCaseId === caseItem.id ? styles.activeCase : ""
                }`}
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

        <button className={styles.addButton}>
          <p>Add case</p>
          <span>
            <PlusIcon size={15} />
          </span>
        </button>
      </div>

      <div className={styles.actualChatBox}>
        <div className={styles.header}>
          <div className={styles.backButton}>
            <button>
              <Caret />
            </button>
            <p>Make case</p>
          </div>

          <div className={styles.closeButton}>Close Case</div>
        </div>

        {/* ------------------- CHAT MESSAGES SECTION ------------------- */}
        <div className={styles.chatMessagesContainer}>
          {!selectedCase ? (
            <div className={styles.emptyState}>Select a conversation</div>
          ) : (
            <>
              <div className={styles.chatMessages}>
                {groupMessagesByDate(selectedCase.messages).map((group) => (
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
                          {/* optional small avatar for incoming messages */}
                          {!isOutgoing && (
                            <div className={styles.messageAvatar}>
                              <img src={sender?.avatar} alt={sender?.name} />
                            </div>
                          )}

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
                                    <audio
                                      key={att.id}
                                      controls
                                      src={att.url}
                                      className={styles.attachmentAudio}
                                    />
                                  );
                                }
                                return null;
                              })}

                            <div className={styles.messageMeta}>
                              <span className={styles.messageTime}>
                                {formatTime(msg.timestamp)}
                              </span>

                              {/* simple seen indicator: if current agent has read it */}
                              {msg.readBy.includes(CURRENT_USER) && (
                                <span className={styles.seenCheck}>✓</span>
                              )}
                            </div>
                          </div>

                          {/* outgoing avatars optional */}
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
                ))}

                <div ref={messagesEndRef} className={styles.messagesEnd} />
              </div>
            </>
          )}
        </div>
        {/* ----------------- end chat messages ----------------- */}
      </div>
    </div>
  );
};
