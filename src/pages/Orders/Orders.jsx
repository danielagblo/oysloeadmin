import React, { useState } from "react";
import styles from "./orders.module.css";
import { CheckMark } from "../../components/SVGIcons/CheckMark";
import { EditIcon } from "../../components/SVGIcons/EditIcon";
import { orderPageInfo } from "../../api/orders";
import { Caret } from "../../components/SVGIcons/Caret";

export const Orders = () => {
  const [currentOption, setCurrentOption] = useState(orderPageInfo?.periods[1]);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [openModal, setOpenModal] = useState(-1);

  const tiers = orderPageInfo?.subscription;
  const data = orderPageInfo?.dataCards;
  const recents = orderPageInfo?.recentOrders;

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
              <button
                className={styles.editicon}
                onClick={() => setOpenModal((prev) => (prev === i ? -1 : i))}
              >
                <EditIcon size={25} />
              </button>
              {openModal === i && (
                <form className={styles.editModal}>
                  <span className={styles.firstFields}>
                    <input type="text" placeholder={tier?.name.split(" ")[0]} />
                    <input type="text" placeholder={tier?.name.split(" ")[2]} />
                  </span>
                  <input type="text" placeholder="Feature" />
                  <input type="text" placeholder="Feature" />
                  <span className={styles.lastFields}>
                    <label>
                      New Price
                      <input type="text" />
                    </label>{" "}
                    <label>
                      Old Price
                      <input
                        type="text"
                        style={{ textDecoration: "line-through" }}
                      />
                    </label>
                  </span>
                  <button>Apply</button>
                </form>
              )}
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
                  <button
                    className={styles.dropDown}
                    onClick={() => setOpenDropDown((prev) => !prev)}
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
                    <p style={{ rotate: openDropDown ? "180deg" : "0deg" }}>
                      <Caret size={25} />
                    </p>
                    {openDropDown && (
                      <div className={styles.popup}>
                        {orderPageInfo?.periods?.map((period, idx) =>
                          idx !== 0 ? (
                            <button
                              onClick={() => setCurrentOption(period)}
                              key={idx}
                            >
                              {card[period]?.title}
                            </button>
                          ) : null
                        )}
                      </div>
                    )}
                  </button>
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
