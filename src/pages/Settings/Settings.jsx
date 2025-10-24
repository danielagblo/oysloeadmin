import React, { useState } from "react";
import styles from "./settings.module.css";
import { Caret } from "../../components/SVGIcons/Caret";
import { settingsData } from "../../api/settings";
import { formatChatTimestamp } from "../../utils/numConverters";
import { ReviewStars } from "../../components/ReviewStars/ReviewStars";

export const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState("privacyPolicy");
  const [openStarsDropDown, setOpenStarsDropDown] = useState(false);

  // NEW: which star filter is active ("All" or "5".."1")
  const [filterStars, setFilterStars] = useState("All");

  // list of left-side items
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

  // Feedback list filtered by stars selection
  const feedbackList = settingsData?.feedback || [];
  const filteredFeedback =
    filterStars === "All"
      ? feedbackList
      : feedbackList.filter((f) => Number(f.stars) === Number(filterStars));

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
            <h1>
              {
                settings?.find((setting) => setting?.slug === selectedSetting)
                  ?.name
              }
            </h1>

            {/* Use date from the appropriate object */}
            <p>
              Dated{" "}
              {settingsData[selectedSetting]?.date ||
                settingsData?.privacyPolicy?.date ||
                ""}
            </p>

            {/* join the content array for display; defaultValue avoids controlled textarea warning */}
            <textarea
              defaultValue={
                Array.isArray(settingsData[selectedSetting]?.content)
                  ? settingsData[selectedSetting].content.join("\n\n")
                  : settingsData[selectedSetting]?.content || ""
              }
              readOnly
            />
          </div>
        ) : (
          <div className={styles.feedbackContainer}>
            <div className={styles.feedbackHeader}>
              <div className={styles.dropDown}>
                <span>
                  {filterStars === "All" ? "All ratings" : `${filterStars} ★`}
                </span>

                <button
                  type="button"
                  onClick={() => setOpenStarsDropDown((p) => !p)}
                  className={styles.dropToggle}
                  aria-expanded={openStarsDropDown}
                  aria-haspopup="menu"
                >
                  <Caret />
                </button>

                {openStarsDropDown && (
                  <ul className={styles.filterMenu} role="menu">
                    {/* Filter options: All, 5..1 */}
                    <li
                      role="menuitem"
                      className={filterStars === "All" ? styles.timeActive : ""}
                      onClick={() => {
                        setFilterStars("All");
                        setOpenStarsDropDown(false);
                      }}
                    >
                      All
                    </li>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <li
                        key={n}
                        role="menuitem"
                        className={
                          filterStars === String(n) ? styles.timeActive : ""
                        }
                        onClick={() => {
                          setFilterStars(String(n));
                          setOpenStarsDropDown(false);
                        }}
                      >
                        {n} star{n > 1 ? "s" : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
};
