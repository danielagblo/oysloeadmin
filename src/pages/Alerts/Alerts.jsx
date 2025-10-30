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
  // --- UI state / modals ---
  const [openAdSelector, setOpenAdSelector] = React.useState(false);
  const [openCouponCreator, setOpenCouponCreator] = React.useState(false);

  // local alerts state so we can push new alerts (doesn't mutate imported file)
  const [alerts, setAlerts] = React.useState(() => alertsData.alerts ?? []);

  // used to trigger scroll-to-bottom when a new alert is appended
  const [lastAddedId, setLastAddedId] = React.useState(null);
  const alertsHolderRef = React.useRef(null);

  // maps for O(1) lookups
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

  // --- header filters + search debounce (user search) ---
  const statusOptions = ["all", "verified", "unverified"];
  const promoOptions = ["all", "premium", "business", "basic"];

  const [openStatus, setOpenStatus] = React.useState(false);
  const [openPromo, setOpenPromo] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPromo, setSelectedPromo] = React.useState("all");

  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // --- user filtering ---
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
      const hay = `${name} ${type} ${level} ${idStr} ${
        u.businessName ?? ""
      }`.toLowerCase();
      return tokens.every((tok) => hay.includes(tok));
    });
  }

  const filteredUsers = React.useMemo(
    () =>
      filterUsers(alertsData.users, {
        status: selectedStatus,
        promo: selectedPromo,
        search: debouncedSearch,
      }),
    [selectedStatus, selectedPromo, debouncedSearch]
  );

  // --- image fallback ---
  const onImgError = (e, fallback = "/images/fallback-ad.png") => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  };

  // --- SELECT recipients (explicit multi-select) ---
  const [selectedUserIds, setSelectedUserIds] = React.useState([]);
  const toggleUserSelection = (userId) =>
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );

  // --- AD SELECTOR logic (max 6) ---
  const [selectedAdIds, setSelectedAdIds] = React.useState([]);
  const MAX_AD_SELECTION = 6;

  const toggleAdSelection = (adId) => {
    setSelectedAdIds((prev) => {
      if (prev.includes(adId)) return prev.filter((id) => id !== adId);
      if (prev.length >= MAX_AD_SELECTION) {
        window.alert(`You can select up to ${MAX_AD_SELECTION} ads.`);
        return prev;
      }
      return [...prev, adId];
    });
  };

  // --- AD SEARCH (separate from user search) ---
  const [adSearchInput, setAdSearchInput] = React.useState("");
  const filteredAds = React.useMemo(() => {
    const q = String(adSearchInput || "")
      .trim()
      .toLowerCase();
    if (!q) return alertsData.ads ?? [];
    return (alertsData.ads || []).filter((a) => {
      const title = (a.title || "").toLowerCase();
      const category = (a.category || "").toLowerCase();
      const price = String(a.price || "").toLowerCase();
      return title.includes(q) || category.includes(q) || price.includes(q);
    });
  }, [adSearchInput]);

  // --- COUPON creator ---
  const couponOptions = alertsData.couponOption ?? [50, 100, 20, 10]; // fallback
  const [selectedCouponAmountIdx, setSelectedCouponAmountIdx] =
    React.useState(0);

  const genCouponCode = (len = 8) => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // avoid ambiguous chars
    let out = "";
    for (let i = 0; i < len; i++)
      out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };

  const [couponCode, setCouponCode] = React.useState(genCouponCode(8));

  // --- chat message state (also used as attachment text for promos/coupons) ---
  const [messageInput, setMessageInput] = React.useState("");

  // --- APPLY handlers (create new alerts locally) ---
  const currentSenderId = alertsData?.admins?.[0]?.id ?? 1; // default senderId (Jeff07)

  const appendAlert = (newAlert) => {
    // append to end (chat-like), not prepend
    setAlerts((prev) => {
      const next = [...prev, newAlert];
      return next;
    });
    setLastAddedId(newAlert.id);
  };

  const applyAdSelection = () => {
    if (!selectedAdIds.length) {
      window.alert("Select at least one ad before applying.");
      return;
    }

    // require explicit recipients
    const audienceCount = selectedUserIds.length;
    if (!audienceCount) {
      window.alert("Select at least one user as a recipient before sending.");
      return;
    }

    const newAlert = {
      id: Math.max(0, ...alerts.map((a) => a.id)) + 1,
      // attach typed message when available (fallback default)
      message: messageInput.trim() || "Check out our selected ads!",
      type: "adPromo",
      senderId: currentSenderId,
      time: new Date().toISOString(),
      audience: audienceCount,
      recipientIds: [...selectedUserIds],
      status: "active",
      relatedAds: selectedAdIds.slice(0, MAX_AD_SELECTION),
    };

    appendAlert(newAlert);

    // reset states
    setSelectedAdIds([]);
    setOpenAdSelector(false);
    setMessageInput("");
    // confirmation
    window.alert(`Ad promo queued for ${audienceCount} selected users.`);
  };

  const handleSendMessage = () => {
    const content = String(messageInput || "").trim();
    if (!content) return;

    // require explicit recipients
    const audienceCount = selectedUserIds.length;
    if (!audienceCount) {
      window.alert("Select at least one user as a recipient before sending.");
      return;
    }

    const newAlert = {
      id: Math.max(0, ...alerts.map((a) => a.id)) + 1,
      message: content,
      type: "info",
      senderId: currentSenderId,
      time: new Date().toISOString(),
      audience: audienceCount,
      recipientIds: [...selectedUserIds],
      status: "active",
      relatedAds: [],
    };

    appendAlert(newAlert);
    setMessageInput("");
    window.alert(`Message sent to ${audienceCount} selected users.`);
  };

  const applyCouponCreation = () => {
    const amount = couponOptions[selectedCouponAmountIdx];
    // coupon code MUST be auto-generated and compulsory
    const code = couponCode;

    if (!amount) {
      window.alert("Select an amount.");
      return;
    }

    // require explicit recipients
    const audienceCount = selectedUserIds.length;
    if (!audienceCount) {
      window.alert("Select at least one user as a recipient before sending.");
      return;
    }

    const newAlert = {
      id: Math.max(0, ...alerts.map((a) => a.id)) + 1,
      // attach typed message when available
      message:
        messageInput.trim() || `You've received a coupon — use code ${code}`,
      type: "coupon",
      senderId: currentSenderId,
      time: new Date().toISOString(),
      audience: audienceCount,
      recipientIds: [...selectedUserIds],
      status: "active",
      relatedAds: [],
      code,
      amount,
    };

    appendAlert(newAlert);

    // reset UI states
    setSelectedCouponAmountIdx(0);
    setOpenCouponCreator(false);
    setMessageInput("");

    // show the generated code
    window.alert(
      `Coupon ${code} (${amount}%) queued for ${audienceCount} selected users.`
    );
  };

  // --- small Dropdown component (keeps your previous behavior) ---
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
        const id = setTimeout(() => inputRef.current?.focus(), 0);
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

  // auto-scroll to bottom when a new alert was appended
  React.useEffect(() => {
    if (lastAddedId == null) return;
    const el = alertsHolderRef.current;
    if (!el) return;
    // animate scroll
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
  }, [lastAddedId, alerts.length]);

  // --- Render ---
  return (
    <div className={styles.alertsContainer}>
      <div className={styles.alertBox}>
        <div
          className={styles.alertsHolder}
          ref={alertsHolderRef}
          // style={{ overflowY: "auto" }}
        >
          {(alerts || []).map((alert) => {
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
                    onError={(e) => onImgError(e, "/images/fallback-user.png")}
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
                              onError={(e) =>
                                onImgError(e, "/images/fallback-ad.png")
                              }
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
            {/* Create Ad */}
            <button
              className={styles.dropdown}
              type="button"
              onClick={() => setOpenAdSelector((p) => !p)}
            >
              <p>Create Ad</p>
              <button>
                <Caret />
              </button>
              {openAdSelector && (
                <div className={styles.creatorModal}>
                  <div className={styles.search}>
                    <SearchIcon />
                    {/* AD search - separate from user search */}
                    <input
                      value={adSearchInput}
                      onChange={(e) => setAdSearchInput(e.target.value)}
                      type="search"
                      placeholder="Search ads (title, category, price)..."
                    />
                  </div>

                  <div className={styles.ads}>
                    {filteredAds.map((ad) => {
                      const selected = selectedAdIds.includes(ad.id);
                      return (
                        <div key={ad.id} className={styles.ad}>
                          <img
                            className={styles.adImg}
                            src={ad?.image}
                            alt={ad?.title}
                            onError={(e) =>
                              onImgError(e, "/images/fallback-ad.png")
                            }
                          />
                          <div className={styles.adDetails}>
                            <h3>{ad?.title}</h3>
                            <p>₵ {formatNumber(ad?.price)}</p>
                          </div>
                          <div className={styles.adSelection}>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleAdSelection(ad.id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.selected}>
                    {selectedAdIds.length} selected (max {MAX_AD_SELECTION})
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <button
                      onClick={applyAdSelection}
                      disabled={selectedAdIds.length === 0}
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAdIds([]);
                        setOpenAdSelector(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </button>

            {/* Create Coupon */}
            <button
              className={styles.dropdown}
              onClick={() => {
                setOpenCouponCreator((p) => !p);
                setCouponCode(genCouponCode(8));
              }}
            >
              <p>Create Coupon</p>
              <button>
                <Caret />
              </button>
              {openCouponCreator && (
                <div className={styles.creatorModal}>
                  {/* coupon code input remains visually present but is ignored: codes are auto-generated and compulsory */}
                  <input
                    type="text"
                    placeholder="Code"
                    className={styles.couponCode}
                    value={couponCode}
                    readOnly
                  />

                  <div className={styles.couponAmountOptions}>
                    {couponOptions.map((couponOption, idx) => (
                      <div
                        key={idx}
                        className={styles.couponOption}
                        onClick={() => setSelectedCouponAmountIdx(idx)}
                        role="button"
                        tabIndex={0}
                      >
                        <input
                          type="text"
                          readOnly
                          value={"₵   " + couponOption}
                        />
                        <div style={{ width: 28, height: 28 }}>
                          {selectedCouponAmountIdx === idx ? (
                            <span>
                              <CheckMark />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={applyCouponCreation}>Apply</button>
                    <button
                      onClick={() => {
                        setSelectedCouponAmountIdx(0);
                        setOpenCouponCreator(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </button>
          </div>

          <div className={styles.chatInputs}>
            <div className={styles.picInputSend}>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="button"
                aria-label="Send message"
                onClick={handleSendMessage}
                disabled={
                  !String(messageInput || "").trim() ||
                  selectedUserIds.length === 0
                }
              >
                <SendButtonIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* USERS PANEL */}
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

        <p className={styles.usersCount}>
          ~ {filteredUsers?.length} users{" "}
          {selectedUserIds.length > 0
            ? `· ${selectedUserIds.length} selected`
            : ""}
        </p>

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
                  onError={(e) => onImgError(e, "/images/fallback-user.png")}
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
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u.id)}
                    onChange={() => toggleUserSelection(u.id)}
                    aria-label={`Select ${u.name}`}
                  />
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
