import React from "react";
import styles from "./dashboard.module.css";
import { dashboard } from "../../api/dashboard";
import { ArrowDown } from "../../components/SVGIcons/ArrowDown";
import { ArrowUp } from "../../components/SVGIcons/ArrowUp";

/**
 * Dashboard component
 * - uses the exported `dashboard` array (already awaited in your setup)
 * - chooses arrow + background color based on numeric change value
 * - defensive & accessible rendering
 */
export const Dashboard = () => {
  // if you later change `dashboard` to a promise, switch this to state + effect
  if (!Array.isArray(dashboard) || dashboard.length === 0) {
    return <div className={styles.loading}>Loading dashboard…</div>;
  }

  return (
    <div
      className={styles.dashboardContainer}
      role="list"
      aria-label="Dashboard metrics"
    >
      {dashboard.map((card, idx) => {
        const key = `${card?.title ?? "card"}-${idx}`;

        // normalize change (string like "1.1%" or "—")
        const rawChange = card?.change ?? "";
        // extract numeric value (handles "1.1%", "-2.3%", "—", null)
        const numericChange = (() => {
          if (typeof rawChange === "number") return rawChange;
          if (!rawChange || rawChange === "—") return NaN;
          // remove percent sign and commas, then parse
          const parsed = parseFloat(String(rawChange).replace(/[%,\s]/g, ""));
          return Number.isFinite(parsed) ? parsed : NaN;
        })();

        const isPositive = Number.isFinite(numericChange) && numericChange > 0;
        const isNegative = Number.isFinite(numericChange) && numericChange < 0;
        const isNeutral =
          !Number.isFinite(numericChange) || numericChange === 0;

        // background color choices (adjust to your design)
        const bgColor = isPositive
          ? "#74FFA7"
          : isNegative
          ? "#F7CF94"
          : "#E6E6E6";

        // prefer card.stats when present
        const hasStats = Array.isArray(card?.stats) && card.stats.length > 0;

        return (
          <div
            className={styles.gridBox}
            key={key}
            role="listitem"
            aria-label={card?.title}
          >
            <p className={styles.title}>{card?.title ?? "—"}</p>

            {hasStats ? (
              <div className={styles.gcard}>
                {card.stats.map((stat, id) => {
                  const statKey = `${key}-stat-${id}`;
                  return (
                    <div key={statKey} className={styles.statItem}>
                      <p className={styles.statLabel}>{stat?.label ?? "—"}</p>
                      <h1 className={styles.statValue}>{stat?.value ?? "0"}</h1>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.box}>
                <div className={styles.valueBlock}>
                  <h1 className={styles.mainValue}>{card?.value ?? "—"}</h1>
                  <p className={styles.period}>{card?.period ?? ""}</p>
                </div>

                {/* show change only if available; style by sign */}
                <div
                  className={styles.change}
                  style={{ backgroundColor: bgColor }}
                  aria-hidden={isNeutral}
                  title={
                    typeof rawChange === "string" ? rawChange : `${rawChange}`
                  }
                >
                  {isPositive ? <ArrowUp /> : isNegative ? <ArrowDown /> : null}
                  <span style={{ marginLeft: 8 }}>{rawChange || "—"}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
