import React from "react";
import styles from "./locations.module.css";
import { locationsData } from "../../api/locations";
import { EditIcon, PlusIcon } from "lucide-react";
import { DragIcon } from "../../components/SVGIcons/DragIcon";

export const Locations = () => {
  return (
    <div className={styles.locationsContainer}>
      {locationsData &&
        locationsData?.map((location, idx) => (
          <div className={styles.location}>
            <div className={styles.locationHeader}>
              <div className={styles.number}>{idx + 1}</div>{" "}
              <div className={styles.region}>{location.region}</div>
            </div>
            <ul className={styles.townList}>
              {location.towns.map((town, i) => (
                <li key={i}>
                  <span>
                    <DragIcon />
                  </span>
                  <p>{town}</p>
                  <span>
                    <EditIcon size={16} />
                  </span>
                </li>
              ))}
            </ul>
            <div className={styles.addSection}>
              <input type="text" placeholder="Type new area" />
              <span>
                <PlusIcon size={16} />
              </span>
            </div>
          </div>
        ))}
    </div>
  );
};
