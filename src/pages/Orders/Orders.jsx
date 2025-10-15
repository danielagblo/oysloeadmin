import React, { useState, useMemo } from "react";
import styles from "./orders.module.css";
import { CheckMark } from "../../components/SVGIcons/CheckMark";
import { EditIcon } from "../../components/SVGIcons/EditIcon";
import { orderPageInfo } from "../../api/orders";
import { Caret } from "../../components/SVGIcons/Caret";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { ArrowRight } from "lucide-react";
import formatNumber, { timeAgo } from "../../utils/numConverters";

export const Orders = () => {
  const [currentOption, setCurrentOption] = useState(
    orderPageInfo?.periods?.[1]
  );
  const [openDropDown, setOpenDropDown] = useState(false);
  const [openModal, setOpenModal] = useState(-1);
  const [openPromo, setOpenPromo] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState(orderPageInfo?.dataCards || []);

  const tiers = orderPageInfo?.subscription || [];
  const recents = orderPageInfo?.recentOrders || [];
  const [rowData, setRowData] = useState(data?.[0] || {});

  // filter state
  const [selectedPromo, setSelectedPromo] = useState(null); // e.g. "Platinum"
  const [selectedTime, setSelectedTime] = useState(null); // e.g. "7 days"

  // --- helpers ---
  const getRowTimestamp = (row) => {
    // adapt this to your actual field (time, createdAt, timestamp, etc.)
    return row?.time || row?.createdAt || row?.timeAgo || null;
  };

  function matchesTimePeriod(row, period) {
    if (!period) return true;
    const ts = getRowTimestamp(row);
    if (!ts) return false; // no timestamp -> exclude (adjust as needed)

    const now = Date.now();
    const rowMs = new Date(ts).getTime();
    const diffMs = now - rowMs;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    const p = (period || "").toLowerCase();
    if (p.includes("today")) {
      return new Date(rowMs).toDateString() === new Date().toDateString();
    }
    if (p.includes("yesterday")) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(rowMs).toDateString() === yesterday.toDateString();
    }
    if (p.includes("7") || p.includes("week")) {
      return diffDays <= 7;
    }
    if (p.includes("1 month") || p.includes("month")) {
      return diffDays <= 30;
    }
    if (p.includes("6 month") || p.includes("6 months")) {
      return diffDays <= 182;
    }
    // default fallback: accept
    return true;
  }

  function matchesPromo(row, promo) {
    if (!promo) return true;
    // row.subscription might be "Platinum Monthly" or just "Platinum"
    const rowSub = (row?.subscription || "").toString().toLowerCase();
    return rowSub.includes(promo.toLowerCase());
  }

  // Compose filters using useMemo for performance
  const filteredData = useMemo(() => {
    const q = (searchInput || "").toLowerCase().trim();

    return (data || []).filter((row) => {
      // 1) search across row values
      const rowText = Object.values(row || {})
        .map((v) => (v === null ? "" : String(v)))
        .join(" ")
        .toLowerCase();

      if (q && !rowText.includes(q)) return false;

      // 2) promo filter
      if (!matchesPromo(row, selectedPromo)) return false;

      // 3) time filter
      if (!matchesTimePeriod(row, selectedTime)) return false;

      return true;
    });
  }, [data, searchInput, selectedPromo, selectedTime]);

  // chart values (unchanged)
  const platinum = rowData?.buisnesses?.platinum || 0;
  const business = rowData?.buisnesses?.buisness || 0;
  const basic = rowData?.buisnesses?.basic || 0;
  const total = platinum + business + basic || 1;
  const p1 = (platinum / total) * 100;
  const p2 = (business / total) * 100;
  const chartStyle = {
    background: `conic-gradient(
      var(--color-theme-blue) 0% ${p1}%,
      var(--color-theme-green) ${p1}% ${p1 + p2}%,
      var(--color-theme-red) ${p1 + p2}% 100%
    )`,
  };

  // handlers when user selects promo/time
  const handleSelectPromo = (promo) => {
    setSelectedPromo(promo);
    setOpenPromo(false);
    // optionally reset selected row to first in filtered set
    // setRowData(filteredData[0] || {});
  };

  const handleSelectTime = (period) => {
    setSelectedTime(period);
    setOpenTime(false);
  };

  // small UI label helpers
  const promoLabel = selectedPromo ?? "Promo";
  const timeLabel = selectedTime ?? "Time";

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.subscriptionTiers}>
        {tiers.map((tier, i) => (
          <div key={i} className={styles.tiers}>
            <div className={styles.details}>
              <h2>{tier?.name}</h2>
              <ul>
                {tier?.tagLines?.map((tag, idx) => (
                  <li key={idx}>
                    <CheckMark size={12} /> {tag}
                  </li>
                ))}
              </ul>
              <div className={styles.prices}>
                {tier?.discountedPrice && (
                  <h2>&#x20B5; {tier?.discountedPrice}</h2>
                )}
                <h2 className={tier?.discountedPrice ? styles.actualPrice : ""}>
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
              <button className={styles.dropdown}>
                <p>{promoLabel}</p>
                <button onClick={() => setOpenPromo((p) => !p)}>
                  <Caret />
                </button>
              </button>

              {openPromo && (
                <ul className={styles.dropdownitems}>
                  <li
                    key="all"
                    onClick={() => handleSelectPromo(null)}
                    className={styles.dropdownitem}
                  >
                    All
                  </li>
                  {orderPageInfo?.subscription?.map((subscription, idx) => (
                    <li
                      key={idx}
                      onClick={() =>
                        handleSelectPromo(subscription?.name?.split(" ")[0])
                      }
                      className={styles.dropdownitem}
                    >
                      {subscription?.name?.split(" ")[0]}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.dropbox}>
              <button className={styles.dropdown}>
                <p>{timeLabel === "all" ? "Time" : timeLabel}</p>
                <button onClick={() => setOpenTime((p) => !p)}>
                  <Caret />
                </button>
              </button>

              {openTime && (
                <ul className={styles.dropdownitems}>
                  {orderPageInfo?.periods?.map((period, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectTime(period)}
                      className={styles.dropdownitem}
                    >
                      {period}
                    </li>
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

          {filteredData.map((row, idx) => (
            <div
              key={idx}
              className={styles.row}
              onClick={() => setRowData(row)}
            >
              <img src={row?.img} alt="" />
              <p>{row?.name}</p>
              <p>{row?.buisnessName}</p>
              <p>{row?.subscription}</p>
              <p>{timeAgo(getRowTimestamp(row))}</p>
            </div>
          ))}
        </div>

        <div className={styles.orderResult}>
          <div className={styles.head}>
            <img src={rowData?.img} alt="" />
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

          <button className={styles.pendingBox}>
            <h3>{formatNumber(rowData?.ads?.pending)} Pending Ads</h3>
            <ArrowRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};
