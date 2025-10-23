import React, { useState } from "react";
import styles from "./settings.module.css";
import { Caret } from "../../components/SVGIcons/Caret";
import { settingsData } from "../../api/settings";
import { formatChatTimestamp } from "../../utils/numConverters";

export const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState("privacyPolicy");
  const settings = [
    {
      name: "Privacy Policy",
      slug: "privacyPolicy",
    },
    {
      name: "Terms & Conditions",
      slug: "termsConditions",
    },
    {
      name: "Feedback",
      slug: "feedback",
    },
    {
      name: "Report",
      slug: "report",
    },
  ];
  return (
    <div className={styles.settingsContainer}>
      <ul className={styles.settingsListBox}>
        {settings?.map((setting, idx) => (
          <li
            key={idx}
            className={`${styles.setting} ${
              selectedSetting === setting?.slug && styles.active
            }`}
            onClick={() => setSelectedSetting(setting?.slug)}
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
            <h1>
              {
                settings?.find((setting) => setting?.slug === selectedSetting)
                  ?.name
              }
            </h1>
            <p>Dated {settingsData?.privacyPolicy?.date}</p>
            <textarea value={settingsData[selectedSetting]?.content} />
          </div>
        ) : selectedSetting === "feedback" ? (
          <div className={styles.feedbackContainer}>
            <div className={styles.feedbackHeader}>Header</div>
            <ul className={styles.feedbackBox}>
              {settingsData?.feedback?.map((feedback, idx) => (
                <li key={idx} className={styles.feedback}>
                  <div className={styles.feedbackItemHeader}>
                    <div className={styles.feedbackGiver}>
                      <img src={feedback?.avatar} />
                      <p>{feedback?.name}</p>
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
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
