import React, { useState } from "react";
import styles from "./settings.module.css";
import { Caret } from "../../components/SVGIcons/Caret";

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
            <p>Dated 21 June 2025</p>
            <textarea />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
