import React from "react";
import styles from "./header.module.css";
import { MenuIcon } from "lucide-react";

export const Header = ({ setOpenSideBar }) => {
  return (
    <div className={styles.headerContainer}>
      <button
        className={styles.menuButtonIcon}
        onClick={() => setOpenSideBar((prev) => !prev)}
      >
        <MenuIcon />
      </button>
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
