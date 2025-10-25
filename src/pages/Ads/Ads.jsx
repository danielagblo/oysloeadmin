import React from "react";
import styles from "./ads.module.css";
import { Caret } from "../../components/SVGIcons/Caret";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";

export const Ads = () => {
  return (
    <div className={styles.adsContainer}>
      <div className={styles.header}>
        <div className={styles.dropDownTray}>
          <button className={styles.dropdown}>
            <p>Status</p>
            <button onClick={() => setOpenPromo((p) => !p)}>
              <Caret />
            </button>
          </button>
          <button className={styles.dropdown}>
            <p>Promo</p>
            <button onClick={() => setOpenPromo((p) => !p)}>
              <Caret />
            </button>
          </button>
          <button className={styles.dropdown}>
            <p>Ad Type</p>
            <button onClick={() => setOpenPromo((p) => !p)}>
              <Caret />
            </button>
          </button>
          <button className={styles.dropdown}>
            <p>Users</p>
            <button onClick={() => setOpenPromo((p) => !p)}>
              <Caret />
            </button>
          </button>
        </div>

        <div className={styles.search}>
          <SearchIcon />
          <input type="search" placeholder="Search..." />
        </div>
      </div>
    </div>
  );
};
