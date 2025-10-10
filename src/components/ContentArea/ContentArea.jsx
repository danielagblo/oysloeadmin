import React from "react";
import styles from "./content-area.module.css";

export const ContentArea = ({ children }) => {
  return <div className={styles.contentContainer}>{children}</div>;
};
