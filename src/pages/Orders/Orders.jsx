import React, { useState } from "react";
import styles from "./orders.module.css";
import { CheckMark } from "../../components/SVGIcons/CheckMark";
import { EditIcon } from "../../components/SVGIcons/EditIcon";
import { orderPageInfo } from "../../api/orders";

export const Orders = () => {
  const [currentOption, setCurrentOption] = useState(orderPageInfo?.periods[1]);

  const tiers = orderPageInfo?.subscription;
  const data = orderPageInfo?.dataCards;
  const recents = orderPageInfo?.recentOrders;

  // const tiers = [1, 2, 3];
  // const data = [1, 2, 3, 4, 5];
  // const recents = [1, 2, 3, 4, 5, 6];
  return (
    <div className={styles.ordersContainer}>
      <div className={styles.subscriptionTiers}>
        {tiers &&
          tiers.length &&
          tiers.map((tier, i) => (
            <div key={i} className={styles.tiers}>
              <div classname={styles.details}>
                <h2>{tier?.name}</h2>
                <ul>
                  {tier?.tagLines &&
                    tier?.tagLines?.length &&
                    tier?.tagLines?.map((tag, idx) => (
                      <li>
                        <CheckMark size={12} />
                        {"     "}
                        {tag}
                      </li>
                    ))}
                </ul>
                <div className={styles.prices}>
                  {tier?.discountedPrice && (
                    <h2>&#x20B5; {tier?.discountedPrice}</h2>
                  )}
                  <h2 className={tier?.discountedPrice && styles.actualPrice}>
                    &#x20B5; {tier?.actualPrice}
                  </h2>
                </div>
              </div>
              <button className={styles.editicon}>
                <EditIcon size={25} />
              </button>
            </div>
          ))}
      </div>
      <div className={styles.lower}>
        <div className={styles.dataCards}>
          {data &&
            data.length &&
            data.map((card, i) => (
              <div key={i} className={styles.data}>
                {(card[i === 0 ? currentOption : orderPageInfo?.periods[0]]
                  ?.title ||
                  i < 2) && (
                  <div
                    className={styles.dropDown}
                    style={{
                      opacity:
                        card[
                          i === 0 ? currentOption : orderPageInfo?.periods[0]
                        ]?.title === "--"
                          ? 0
                          : 1,
                    }}
                  >
                    {
                      card[i === 0 ? currentOption : orderPageInfo?.periods[0]]
                        ?.title
                    }
                  </div>
                )}
                <div className={styles.items}>
                  {card[i === 0 ? currentOption : orderPageInfo?.periods[0]]
                    ?.data &&
                    card[
                      i === 0 ? currentOption : orderPageInfo?.periods[0]
                    ]?.data?.map((data, idx) => (
                      <div className={styles.titleWrapAround}>
                        <p className={styles.cardName}>{data?.name}</p>
                        <div key={idx} className={styles.item}>
                          <div className={styles.detailsBox}>
                            <h2>{data?.value}</h2>
                            <p>
                              {
                                card[
                                  i === 0
                                    ? currentOption
                                    : orderPageInfo?.periods[0]
                                ]?.period
                              }
                            </p>
                          </div>
                          {data?.change && (
                            <div
                              style={{
                                backgroundColor:
                                  idx !== idx ? "#F7CF94" : "#74FFA7",
                              }}
                              className={styles.change}
                            >
                              {data?.change}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
        <div className={styles.recentOrders}>
          <h2>Recent Orders</h2>
          <div className={styles.timelineLine} />
          {recents &&
            recents.length &&
            recents.map((recent, i) => (
              <div key={i} className={styles.recents}>
                <div className={styles.recentsNumber}>{recent?.quantity}x</div>
                <div className={styles.timeNameBox}>
                  <h2>{recent?.name}</h2>
                  <p>{recent?.timeAgo}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
