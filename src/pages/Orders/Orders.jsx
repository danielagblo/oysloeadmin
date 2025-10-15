import React, { useState } from "react";
import styles from "./orders.module.css";
import { CheckMark } from "../../components/SVGIcons/CheckMark";
import { EditIcon } from "../../components/SVGIcons/EditIcon";
import { orderPageInfo } from "../../api/orders";
import { Caret } from "../../components/SVGIcons/Caret";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";

export const Orders = () => {
  const [currentOption, setCurrentOption] = useState(orderPageInfo?.periods[1]);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [openModal, setOpenModal] = useState(-1);
  const [openPromo, setOpenPromo] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  const tiers = orderPageInfo?.subscription;
  const data = orderPageInfo?.dataCards;
  const recents = orderPageInfo?.recentOrders;
  const [rowData, setRowData] = useState(data[0]);
  console.log(rowData);
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
                      <input type="number" />
                    </label>{" "}
                    <label>
                      Old Price
                      <input
                        type="number"
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
        <div className={styles.tables}>
          <div className={styles.header}>
            <div className={styles.dropbox}>
              <button className={styles.dropdown} s>
                <p>Promo</p>
                <button onClick={() => setOpenPromo((prev) => !prev)}>
                  <Caret />
                </button>
              </button>
              {openPromo && (
                <ul className={styles.dropdownitems}>
                  {orderPageInfo?.subscription &&
                    orderPageInfo?.subscription?.map((subscription, idx) => (
                      <li key={idx}>{subscription?.name?.split(" ")[0]}</li>
                    ))}
                </ul>
              )}
            </div>

            <div className={styles.dropbox}>
              <button className={styles.dropdown}>
                Time
                <button onClick={() => setOpenTime((prev) => !prev)}>
                  <Caret />
                </button>
              </button>
              {openTime && (
                <ul className={styles.dropdownitems}>
                  {orderPageInfo?.periods &&
                    orderPageInfo?.periods?.map((period, idx) => (
                      <li key={idx}>{period}</li>
                    ))}
                </ul>
              )}
            </div>

            <div className={styles.search}>
              <SearchIcon />
              <input type="search" placeholder="Search..." />
            </div>
          </div>
          {data &&
            data?.map((row, idx) => (
              <div
                key={idx}
                className={styles.row}
                onClick={() => setRowData(row)}
              >
                <img src={row?.img} />
                <p>{row?.name}</p>
                <p>{row?.buisnessName}</p>
                <p>{row?.subscription}</p>
                <p>{row?.timeAgo}</p>
              </div>
            ))}
        </div>
        <div className={styles.orderResult}>
          <img src={rowData?.img} />
          <h1>{rowData?.name}</h1>
        </div>
      </div>
    </div>
  );
};
