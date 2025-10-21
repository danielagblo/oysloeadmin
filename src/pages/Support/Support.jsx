import React, { useState } from "react";
import styles from "./support.module.css";
import { supportData } from "../../api/support";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { Caret } from "../../components/SVGIcons/Caret";
import { PlusIcon } from "lucide-react";

const CURRENT_USER = "u2";

const getUnreadCountForAgent = (caseItem, agentId) =>
  caseItem.messages.filter(
    (msg) =>
      msg.senderId !== agentId && // don’t count your own messages
      !msg.readBy.includes(agentId) // only unread ones
  ).length;

function markCaseAsRead(caseItem, agentId) {
  caseItem.messages.forEach((msg) => {
    if (msg.senderId !== agentId && !msg.readBy.includes(agentId)) {
      msg.readBy.push(agentId);
    }
  });
}

function getUser(userId) {
  return supportData?.users.find((user) => user?.id === userId);
}

export const Support = () => {
  const [selectedCase, setSelectedCase] = useState({ id: "case-1" });
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
            <button onClick={() => setTimeOpen((p) => !p)}>
              <Caret />
            </button>
          </div>
        </div>
        <ul className={styles.casesContainer}>
          {supportData?.cases?.map((caseItem, idx) => {
            const user = getUser(caseItem?.userId);
            const count = getUnreadCountForAgent(caseItem, CURRENT_USER);
            return (
              <li
                key={idx}
                className={`${styles.case} ${
                  selectedCase?.id === caseItem?.id ? styles.activeCase : ""
                }`}
              >
                <div className={styles.imageBox}>
                  <img src={user?.avatar} />
                  {user?.online && <span className={styles.active} />}
                </div>
                <div className={styles.textBox}>
                  <div className={styles.name}>{user?.name}</div>
                  <div className={styles.lastMessage}>
                    {caseItem?.messages[caseItem?.messages.length - 1]?.text}
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
      <div className={styles.actualChatBox}>Actual Chat Box</div>
    </div>
  );
};
