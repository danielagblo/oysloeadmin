import React, { useState } from "react";
import styles from "./orders.module.css";
import { CheckMark } from "../../components/SVGIcons/CheckMark";
import { EditIcon } from "../../components/SVGIcons/EditIcon";
import { orderPageInfo } from "../../api/orders";
import { Caret } from "../../components/SVGIcons/Caret";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { ArrowRight } from "lucide-react";
import formatNumber, { timeAgo } from "../../utils/numConverters";
// import { timeAgo, formatNumber } from "../../utils/numConverters";

export const Orders = () => {
  const [currentOption, setCurrentOption] = useState(orderPageInfo?.periods[1]);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [openModal, setOpenModal] = useState(-1);
  const [openPromo, setOpenPromo] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState(orderPageInfo?.dataCards);

  const tiers = orderPageInfo?.subscription;
  const recents = orderPageInfo?.recentOrders;
  const [rowData, setRowData] = useState(data[0]);

  const platinum = rowData?.buisnesses?.platinum || 0;
  const business = rowData?.buisnesses?.buisness || 0;
  const basic = rowData?.buisnesses?.basic || 0;

  const total = platinum + business + basic || 1; // prevent /0
  const p1 = (platinum / total) * 100;
  const p2 = (business / total) * 100;
  const p3 = (basic / total) * 100;

  const chartStyle = {
    background: `conic-gradient(
    var(--color-theme-blue) 0% ${p1}%,
    var(--color-theme-green) ${p1}% ${p1 + p2}%,
    var(--color-theme-red) ${p1 + p2}% 100%
  )`,
  };

  const filteredData = data.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchInput.toLowerCase())
  );

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
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e?.target?.value)}
                type="search"
                placeholder="Search..."
              />
            </div>
          </div>
          {filteredData &&
            filteredData?.map((row, idx) => (
              <div
                key={idx}
                className={styles.row}
                onClick={() => setRowData(row)}
              >
                <img src={row?.img} />
                <p>{row?.name}</p>
                <p>{row?.buisnessName}</p>
                <p>{row?.subscription}</p>
                <p>{timeAgo(row?.timeAgo)}</p>
              </div>
            ))}
        </div>
        <div className={styles.orderResult}>
          <div className={styles.head}>
            <img src={rowData?.img} />
            <h1>{rowData?.name}</h1>
            <div className={styles.levelBox}>
              <div className={styles.textMark}>
                <span className={styles.checkmark}>
                  <CheckMark />
                </span>
                <p>High Level</p>
              </div>

              <div className={styles.bar} />
            </div>
            <div className={styles.adsBox}>
              <div className={styles.adBox}>
                <h2>{formatNumber(rowData?.ads?.active)}</h2>
                <p>Active Ads</p>
              </div>
              <div className={styles.adBox}>
                <h2>{formatNumber(rowData?.ads?.taken)}</h2>
                <p>Sold Ads</p>
              </div>
            </div>
          </div>
          <div className={styles.chartBox}>
            <div className={styles.chart} style={chartStyle} />
            <div className={styles.labelBox}>
              <span className={styles.tag} />
              <div className={styles.info}>
                <p>Platinum</p>
                <h2>{formatNumber(platinum)}</h2>
              </div>
              <span className={styles.tag} />
              <div className={styles.info}>
                <p>Business</p>
                <h2>{formatNumber(business)}</h2>
              </div>
              <span className={styles.tag} />
              <div className={styles.info}>
                <p>Basic</p>
                <h2>{formatNumber(basic)}</h2>
              </div>
            </div>
          </div>
          <div className={styles.pendingBox}>
            <h3>{formatNumber(rowData?.ads?.pending)} Pending Ads</h3>
            <ArrowRight size={18} strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
};
