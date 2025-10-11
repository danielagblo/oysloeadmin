import React from "react";
import styles from "./dashboard.module.css";
import { dashboard } from "../../api/dashboard";
import { ArrowDown } from "../../components/SVGIcons/ArrowDown";
import { ArrowUp } from "../../components/SVGIcons/ArrowUp";

export const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      {dashboard?.map((card, idx) => (
        <div className={styles.gridBox} key={idx}>
          <p className={styles.title}>{card?.title}</p>
          {card?.stats && card?.stats?.length ? (
            <div className={styles.gcard}>
              {card.stats.map((stat, id) => (
                <div key={id}>
                  <p>{stat.label}</p>
                  <h1>{stat.value}</h1>
                </div>
              ))}
            </div>
          ) : (
            <div key={idx} className={styles.box}>
              <div>
                <h1>{card?.value}</h1>
                <p>{card?.period}</p>
              </div>
              <div
                className={styles.change}
                style={{ backgroundColor: idx % 2 ? "#F7CF94" : "#74FFA7" }}
              >
                {idx % 2 ? <ArrowDown /> : <ArrowUp />} {card?.change}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
