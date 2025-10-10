import React from "react";
import styles from "./header.module.css";

export const Header = () => {
  return (
    <div className={styles.headerContainer}>
      <h1>Oysloe</h1>
      <div className={styles.rightHeader}>
        <div>
          <h3>Jeff07</h3>
          <p>Admin</p>
        </div>
        <div className={styles.avatar}>
          <img src="https://randomuser.me/api/portraits/men/1.jpg" />
        </div>
      </div>
    </div>
  );
};
