import React from "react";
import styles from "./locations.module.css";
import { locationsData } from "../../api/locations";

export const Locations = () => {
  return (
    <div className={styles.locationsContainer}>
      {locationsData &&
        locationsData?.map((location, idx) => (
          <div className={styles.location}>
            <div className={styles.locationHeader}>
              <span>{idx + 1}</span> {location.region}
            </div>
            <ul className={styles.townList}>
              {location.towns.map((town, i) => (
                <li key={i}>{town}</li>
              ))}
            </ul>
            <div className={styles.addSection}>
              <input type="text" />+
            </div>
          </div>
        ))}
    </div>
  );
};
