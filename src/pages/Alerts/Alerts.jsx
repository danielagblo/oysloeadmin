// Alerts.jsx
import React from "react";
import styles from "./alerts.module.css";
import { alertsData } from "../../api/alerts";
import formatNumber, { timeAgo } from "../../utils/numConverters";
import { Caret } from "../../components/SVGIcons/Caret";
import { SendButtonIcon } from "../../components/SVGIcons/SendButtonIcon";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { CheckMark } from "../../components/SVGIcons/CheckMark";

export const Alerts = () => {
  // --- maps for O(1) lookups ---
  const adminMap = React.useMemo(() => {
    const m = Object.create(null);
    (alertsData?.admins || []).forEach((a) => (m[a.id] = a));
    return m;
  }, []);

  const adMap = React.useMemo(() => {
    const m = Object.create(null);
    (alertsData?.ads || []).forEach((a) => (m[a.id] = a));
    return m;
  }, []);

  const getAdminById = (id) => adminMap?.[id] ?? null;
  const getAdById = (id) => adMap?.[id] ?? null;

  // --- header UI state ---
  const statusOptions = ["all", "verified", "unverified"];
  const promoOptions = ["all", "premium", "business", "basic"];

  const [openStatus, setOpenStatus] = React.useState(false);
  const [openPromo, setOpenPromo] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPromo, setSelectedPromo] = React.useState("all");

  // search + debounce
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // --- filtering function (same behavior as you wanted) ---
  function filterUsers(
    users = [],
    { status = "all", promo = "all", search = "" } = {}
  ) {
    if (!Array.isArray(users)) return [];

    const promoSet =
      promo === "all"
        ? null
        : Array.isArray(promo)
        ? new Set(promo.map((p) => String(p).toLowerCase()))
        : new Set([String(promo).toLowerCase()]);

    const term = String(search || "")
      .trim()
      .toLowerCase();
    const tokens = term ? term.split(/\s+/).filter(Boolean) : [];

    return users.filter((u) => {
      const verified = Boolean(u.verified);
      const type = (u.type || "").toString().toLowerCase();
      const level = (u.level || "").toString().toLowerCase();
      const name = (u.name || "").toString().toLowerCase();
      const idStr = String(u.id || "").toLowerCase();

      if (status === "verified" && !verified) return false;
      if (status === "unverified" && verified) return false;

      if (promoSet && !promoSet.has(type)) return false;

      if (tokens.length === 0) return true;
      const hay = `${name} ${type} ${level} ${idStr}`;
      return tokens.every((tok) => hay.includes(tok));
    });
  }

  // memoized filtered users
  const filteredUsers = React.useMemo(
    () =>
      filterUsers(alertsData.users, {
        status: selectedStatus,
        promo: selectedPromo,
        search: debouncedSearch,
      }),
    [selectedStatus, selectedPromo, debouncedSearch]
  );

  // --- small reusable Dropdown component ---
  const Dropdown = ({
    label,
    open,
    setOpen,
    options = [],
    value,
    onSelect,
    allowSearch = false,
    searchValue,
    onSearchChange,
  }) => {
    const inputRef = React.useRef(null);

    React.useEffect(() => {
      if (open && allowSearch) {
        const id = setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return () => clearTimeout(id);
      }
    }, [open, allowSearch]);

    return (
      <div
        className={styles.dropdownWrapper}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.dropdown}
          type="button"
          onClick={() => setOpen((s) => !s)}
        >
          <p>
            {label}: {value}
          </p>
          <button type="button" aria-hidden>
            <Caret />
          </button>
        </button>

        <div
          className={styles.dropdownMenu}
          style={{ display: open ? "block" : "none" }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {allowSearch && (
            <div className={styles.dropDownUserSearch}>
              <SearchIcon />
              <input
                ref={inputRef}
                autoComplete="off"
                type="search"
                placeholder="Search option..."
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}

          {options.map((opt) => (
            <div
              key={String(opt)}
              className={styles.dropdownItem}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.alertsContainer}>
      <div className={styles.alertBox}>
        <div className={styles.alertsHolder}>
          {alertsData?.alerts?.map((alert) => {
            const admin = getAdminById(alert?.senderId);
            return (
              <div className={styles.alert} key={alert.id}>
                <div className={styles.imgName}>
                  <p>By {admin?.name ?? "Unknown"}</p>
                </div>

                <div className={styles.messageBox}>
                  <img
                    src={admin?.avatar}
                    className={styles.avatar}
                    alt={admin?.name ?? "avatar"}
                  />
                  <p>{alert?.message}</p>

                  {alert?.type === "adPromo" ? (
                    <ul className={styles.adPromo}>
                      {alert?.relatedAds?.map((adId) => {
                        const ad = getAdById(adId);
                        return (
                          <li key={adId} className={styles.adMessage}>
                            <img
                              src={ad?.image}
                              alt={ad?.title}
                              width={160}
                              height={120}
                            />
                            <div className={styles.adDetails}>
                              <h3>{ad?.title}</h3>
                              <p>₵ {formatNumber(ad?.price)}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : alert?.type === "coupon" ? (
                    <div className={styles.coupon}>
                      <p>
                        Code: <strong>{alert?.code}</strong>{" "}
                        {typeof alert?.amount === "number" && (
                          <span> — {alert.amount}%</span>
                        )}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className={styles.timeUsers}>
                  <p>~ {alert?.audience} users</p>
                  <p>{timeAgo(alert?.time)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.optionsInputs}>
          <div className={styles.dropdowns}>
            <button className={styles.dropdown}>
              <p>Create Ad</p>
              <button
                type="button"
                onClick={() => {
                  /* hook up creation modal */
                }}
              >
                <Caret />
              </button>
            </button>
            <button className={styles.dropdown}>
              <p>Create Coupon</p>
              <button
                type="button"
                onClick={() => {
                  /* hook up creation modal */
                }}
              >
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

      <div className={styles.usersBox}>
        <div className={styles.header}>
          <div className={styles.dropDownTray}>
            <Dropdown
              label="Status"
              open={openStatus}
              setOpen={setOpenStatus}
              options={statusOptions}
              value={selectedStatus}
              onSelect={(v) => setSelectedStatus(v)}
            />

            <Dropdown
              label="Promo"
              open={openPromo}
              setOpen={setOpenPromo}
              options={promoOptions}
              value={selectedPromo}
              onSelect={(v) => setSelectedPromo(v)}
            />
          </div>

          <div className={styles.search}>
            <SearchIcon />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="search"
              placeholder="Search users (name, type, level, id)..."
            />
          </div>
        </div>
        <p className={styles.usersCount}>~ {filteredUsers?.length} users</p>

        <div className={styles.usersList}>
          {filteredUsers.length === 0 ? (
            <div className={styles.empty}>No users found</div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className={styles.userRow}>
                <img
                  src={u.avatar}
                  alt={u.name}
                  className={styles.userAvatar}
                />
                <div className={styles.userName}>
                  <strong>{u.name}</strong>
                  <p>{u?.businessName}</p>
                </div>
                <div className={styles.userLevel}>
                  <span
                    style={{
                      backgroundColor:
                        u?.level === "high"
                          ? "var(--color-theme-green)"
                          : u?.level === "middle"
                          ? "var(--color-muted-1)"
                          : "var(--color-theme-red)",
                    }}
                  >
                    <CheckMark />
                  </span>
                  <p>{u?.level} Level</p>
                </div>
                <div className={styles.adsCount}>
                  {formatNumber(u?.adsCount)} ads
                </div>
                <div className={styles.isVerified}>
                  {u?.verified ? "Verified" : "Not Verified"}
                </div>
                <div className={styles.selectRow}>
                  <input type="radio" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
