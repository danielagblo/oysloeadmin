import React, { useState } from "react";
import styles from "./applications.module.css";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { Caret } from "../../components/SVGIcons/Caret";
import { applicationsData } from "../../api/applications";
import ImageIcon from "../../components/SVGIcons/ImageIcon";
import Download from "../../assets/downloadCopy.png";

export const Applcations = () => {
  const [rowData, setRowData] = useState(null);
  return (
    <div className={styles.applicationsContainer}>
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <SearchIcon />
          <input type="search" placeholder="Search" />
        </div>
        <div className={styles.dropDown}>
          <p>All</p>
          <Caret />
        </div>
      </div>
      <p className={styles.total}>~ {"567"}</p>
      <div className={styles.table}>
        {applicationsData &&
          applicationsData?.map((application, idx) => (
            <div className={styles.row}>
              <img src={application?.img} />
              <p>{application?.name}</p>
              <p>{application?.phone}</p>
              <p>{application?.email}</p>
              <p>{application?.location}</p>
              <p>{application?.age}</p>
              <button onClick={() => setRowData(application)}>
                Cover Letter
              </button>
              <div className={styles.downloadAndTime}>
                <button>
                  <ImageIcon src={Download} />
                  Download
                </button>
                <p>{application?.dateApplied}</p>
              </div>
            </div>
          ))}
      </div>
      {rowData && (
        <>
          <div className={styles.backdrop} />
          <div className={styles.modal}>
            <h1>Cover Letter</h1>
            <p> Dated {rowData?.dateApplied}</p>
            <textarea value={rowData?.coverLetter} />
            <button onClick={() => setRowData(null)}>Done</button>
          </div>
        </>
      )}
    </div>
  );
};
