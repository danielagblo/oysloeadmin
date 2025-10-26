import React from "react";
import styles from "./alerts.module.css";
import { alertsData } from "../../api/alerts";
import formatNumber, { timeAgo } from "../../utils/numConverters";
import { Caret } from "../../components/SVGIcons/Caret";
import { SendButtonIcon } from "../../components/SVGIcons/SendButtonIcon";

export const Alerts = () => {
  const getAdminById = (id, admins = alertsData?.admins) =>
    admins.find((admin) => admin.id === id) || null;

  const getAdById = (id, ads = alertsData?.ads) =>
    ads.find((ad) => ad.id === id) || null;

  return (
    <div className={styles.alertsContainer}>
      <div className={styles.alertBox}>
        <div className={styles.alertsHolder}>
          {alertsData?.alerts?.map((alert, idx) => (
            <div className={styles.alert} key={idx}>
              <div className={styles.imgName}>
                <p>By {getAdminById(alert?.senderId)?.name}</p>
              </div>
              <div className={styles.messageBox}>
                <img
                  src={getAdminById(alert?.senderId)?.avatar}
                  className={styles.avatar}
                />
                <p>{alert?.message}</p>
                {alert?.type === "adPromo" ? (
                  <ul className={styles.adPromo}>
                    {alert?.relatedAds?.map((ad, idx) => {
                      const currentAd = getAdById(ad);
                      return (
                        <li key={idx} className={styles.adMessage}>
                          <img src={currentAd?.image} />
                          <div className={styles.adDetails}>
                            <h3>{currentAd?.title}</h3>
                            <p>₵ {formatNumber(currentAd?.price)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : alert?.type === "coupon" ? (
                  <div className={styles.coupon}>
                    <p>
                      Code: <strong>{alert?.code}</strong>
                    </p>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className={styles.timeUsers}>
                <p>~ {alert?.audience} users</p>
                <p>{timeAgo(alert?.time)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.optionsInputs}>
          <div className={styles.dropdowns}>
            <button className={styles.dropdown}>
              <p>Create Ad</p>
              <button onClick={() => setOpenPromo((p) => !p)}>
                <Caret />
              </button>
            </button>
            <button className={styles.dropdown}>
              <p>Create Coupon</p>
              <button onClick={() => setOpenPromo((p) => !p)}>
                <Caret />
              </button>
            </button>
          </div>
          <div className={styles.chatInputs}>
            <div className={styles.picInputSend}>
              <input type="text" placeholder="Type a message..." />

              <button type="button" aria-label="Send message">
                <SendButtonIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.usersBox}>Users</div>
    </div>
  );
};
