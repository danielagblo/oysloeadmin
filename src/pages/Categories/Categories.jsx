import React from "react";
import styles from "./categories.module.css";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";

export const Categories = () => {
  return (
    <div className={styles.categoryContainer}>
      <div className={styles.categoryHeader}>
        <div className={styles.searchBox}>
          <SearchIcon />
          <input type="search" placeholder="Search" />
        </div>
        <span>You can hold and drag to rearrange </span>
      </div>
      <div className={styles.categoryColumns}>Columns Section</div>
      <div className={styles.categoryInputs}>Inputs Section</div>
    </div>
  );
};
