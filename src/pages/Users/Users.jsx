// Users.jsx
import React from "react";
import styles from "./users.module.css";
// <- new import: your generated dummy data file
import { users as usersPageData } from "../../api/users";
import formatNumber from "../../utils/numConverters";
import { timeAgo } from "../../utils/numConverters";
import { Caret } from "../../components/SVGIcons/Caret";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { CheckMark } from "../../components/SVGIcons/CheckMark";
import { ReviewStars } from "../../components/ReviewStars/ReviewStars";
// Imported StarIcon used in the rating breakdown UI
import { StarIcon } from "../../components/SVGIcons/StarIcon";

/**
 * Users screen — wired to usersPageData (no layout changes)
 */
export const Users = () => {
  // --- dropdown options ---
  const statusOptions = ["all", "verified", "unverified"];
  const promoOptions = ["all", "premium", "business", "basic"];
  const adTypeOptions = [
    "all",
    "Automobile",
    "Electronics",
    "Travel",
    "Subscription",
    "Real Estate",
  ];

  // --- dropdown open state ---
  const [openStatus, setOpenStatus] = React.useState(false);
  const [openPromo, setOpenPromo] = React.useState(false);
  const [openAdType, setOpenAdType] = React.useState(false);
  const [openUsers, setOpenUsers] = React.useState(false);

  // --- selected values ---
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPromo, setSelectedPromo] = React.useState("all");
  const [selectedAdType, setSelectedAdType] = React.useState("all");
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [createAdmin, setCreateAdmin] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React?.useState(-1);

  // header search (debounced)
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // use the generated users data
  const users = Array.isArray(usersPageData)
    ? usersPageData
    : usersPageData?.users ?? [];
  // --- user filtering logic (same rules used previously) ---
  function filterUsers(
    list = [],
    { status = "all", promo = "all", search = "" } = {}
  ) {
    if (!Array.isArray(list)) return [];

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

    return list.filter((u) => {
      const verified = Boolean(u.verified);
      const type = (u.type || "").toString().toLowerCase();
      const level = (u.level || "").toString().toLowerCase();
      const name = (u.name || "").toString().toLowerCase();
      const idStr = String(u.id || "").toLowerCase();
      const business = (u.businessName || "").toString().toLowerCase();

      if (status === "verified" && !verified) return false;
      if (status === "unverified" && verified) return false;

      if (promoSet && !promoSet.has(type)) return false;

      if (tokens.length === 0) return true;
      const hay = `${name} ${type} ${level} ${idStr} ${business}`;
      return tokens.every((tok) => hay.includes(tok));
    });
  }

  // filtered users (based on header filters + search)
  const filteredUsers = React.useMemo(
    () =>
      filterUsers(users, {
        status: selectedStatus,
        promo: selectedPromo,
        search: debouncedSearch,
      }),
    [users, selectedStatus, selectedPromo, debouncedSearch]
  );

  // --- Users dropdown: searchable options (shows user names) ---
  const [userDropdownQuery, setUserDropdownQuery] = React.useState("");
  const filteredUserOptions = React.useMemo(() => {
    const q = String(userDropdownQuery || "")
      .trim()
      .toLowerCase();
    const opts = users.map((u) => `${u.name} (${u.businessName ?? "—"})`);
    if (!q) return ["all", ...opts];
    return ["all", ...opts.filter((o) => o.toLowerCase().includes(q))];
  }, [users, userDropdownQuery]);

  // image fallback
  const onImgError = (e, fallback = "/images/fallback-user.png") => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  };

  // --- Dropdown component (kept as you provided) ---
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

  // Helper used by Users dropdown to convert selected option -> user object (or null)
  const handleUserOptionSelect = (opt) => {
    if (opt === "all") {
      setSelectedUser(null);
      return;
    }
    // opt format: "Name (Business Name)" - extract name before " ("
    const name = String(opt).split(" (")[0];
    const found = users.find((u) => u.name === name);
    setSelectedUser(found ?? null);
  };

  return (
    <div className={styles.usersContainer}>
      <div className={styles.header}>
        <div className={styles.dropDownTray}>
          {!selectedUser && !createAdmin && (
            <>
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
              <Dropdown
                label="Ad Type"
                open={openAdType}
                setOpen={setOpenAdType}
                options={adTypeOptions}
                value={selectedAdType}
                onSelect={(v) => setSelectedAdType(v)}
              />

              <button
                className={styles.createAdminButton}
                onClick={() => setCreateAdmin((prev) => !prev)}
              >
                Create Admin
              </button>
            </>
          )}
          {(selectedUser || createAdmin) && (
            <button
              onClick={() => {
                setSelectedUser(null);
                setCreateAdmin(false);
              }}
              className={styles.backButton}
            >
              <span>
                <Caret />
              </span>
              <p>Return</p>
            </button>
          )}
          {selectedUser && (
            <>
              <button className={styles.dropDownSetterButton}>
                <p>ID Status</p>
                <Caret />
              </button>

              <button className={styles.dropDownSetterButton}>
                <p>Status</p>
                <Caret />
              </button>

              <button className={styles.muteButton}>Mute</button>
              <button className={styles.deleteButton}>Delete</button>
            </>
          )}
        </div>

        <div className={styles.search}>
          <SearchIcon />
          <input
            type="search"
            placeholder="Search by name, type, level, business..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSelectedUser(null);
              setCreateAdmin(false);
            }}
          />
        </div>
      </div>

      <div className={styles.content}>
        {selectedUser ? (
          <div className={styles.userInfo}>
            <div className={styles.userColumn}>
              <div className={styles.profileImages}>
                <div className={styles.profileImage}>
                  <img
                    src={selectedUser?.profileImage}
                    alt="profile"
                    onError={(e) => onImgError(e)}
                  />
                  <p>Profile Image</p>
                </div>
                <div className={styles.profileImage}>
                  <img
                    src={selectedUser?.businessLogo}
                    alt="business logo"
                    onError={(e) => onImgError(e)}
                  />
                  <p>Buisness Logo</p>
                </div>
              </div>

              <p>General Details</p>
              <div className={styles.generalDetails}>
                <label>Name</label>
                <input defaultValue={selectedUser?.name} />
                <div className={styles.labelVerified}>
                  <label>Email</label>
                  <span>{selectedUser?.email ? "Verified" : "Unverified"}</span>
                </div>
                <input defaultValue={selectedUser?.email} />
                <label>First Number</label>
                <input defaultValue={selectedUser?.phonePrimary} />
                <label>Second Number</label>
                <input defaultValue={selectedUser?.phoneSecondary || "---"} />
                <div className={styles.labelVerified}>
                  <label>National ID</label>
                  <span>
                    {selectedUser?.nationalId ? "Verified" : "Not Verified"}
                  </span>
                </div>
                <input defaultValue={selectedUser?.nationalId} />
              </div>
            </div>
            <div className={styles.userColumn}>
              <div className={styles.idImages}>
                <div className={styles.idImage}>
                  <p>ID FRONT</p>
                  <img
                    src={selectedUser?.idFront}
                    alt="ID front"
                    onError={(e) => onImgError(e)}
                  />
                </div>
                <div className={styles.idImage}>
                  <p>ID BACK</p>
                  <img
                    src={selectedUser?.idBack || selectedUser?.businessLogo}
                    alt="ID back"
                    onError={(e) => onImgError(e)}
                  />
                </div>
              </div>

              <div className={styles.generalDetails}>
                <label>Buisness Name</label>
                <input defaultValue={selectedUser?.businessName} />
                <p>Payment Account</p>
                <label>Account Name</label>
                <input defaultValue={selectedUser?.accountName} />
                <label>Account Number</label>
                <input defaultValue={selectedUser?.accountNumber || "---"} />
                <label>Mobile Network</label>
                <input defaultValue={selectedUser?.mobileNetwork} />
              </div>
            </div>
            <div className={styles.userColumn}>
              {/* SAFELY read aggregatedReviews from selectedUser, provide defaults */}
              {(() => {
                const agg = selectedUser?.aggregatedReviews ?? {
                  averageRating: 0,
                  totalReviews: 0,
                  ratingBreakdown: {},
                };
                const totalReviews = agg.totalReviews || 0;
                const breakdown = agg.ratingBreakdown || {};
                return (
                  <div className={styles.reviewsBox}>
                    <div className={styles.reviewColumn}>
                      <h1>{agg.averageRating?.toFixed?.(1) ?? 0}</h1>
                      <ReviewStars
                        bgColor="transparent"
                        offColor="#8D93A5"
                        count={Math.floor(agg.averageRating || 0)}
                      />
                      <p>{formatNumber(totalReviews)} Reviews</p>
                    </div>

                    <ul className={styles.reviewColumn}>
                      {Object.entries(breakdown).length === 0 ? (
                        <li className={styles.starRatingEmpty}>
                          No ratings yet
                        </li>
                      ) : (
                        Object.entries(breakdown).map(([star, count]) => {
                          const total = Object.values(breakdown).reduce(
                            (a, b) => a + b,
                            0
                          );
                          const pct = total
                            ? ((count / total) * 100).toFixed(1)
                            : 0;
                          return (
                            <li key={star} className={styles.starRating}>
                              <span>
                                <StarIcon color="#374957" size={15} />
                              </span>
                              <p>{star}</p>
                              <div className={styles.reviewBar}>
                                <div
                                  className={styles.reviewProgress}
                                  style={{
                                    // use CSS var you had previously, fallback to width style
                                    width: `${pct}%`,
                                  }}
                                />
                              </div>
                              <p>{pct}%</p>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                );
              })()}

              <div className={styles.starFilters}>
                <button
                  className={styles.starFilterButton}
                  style={{
                    border:
                      selectedFilter === -1
                        ? "2px solid var(--color-muted-2)"
                        : "none",
                  }}
                  onClick={() => setSelectedFilter(-1)}
                >
                  <StarIcon color="#374957" size={15} />
                  <p>All</p>
                </button>
                {Array?.from({ length: 5 })?.map?.((_, idx) => (
                  <button
                    className={styles.starFilterButton}
                    key={idx}
                    style={{
                      border:
                        selectedFilter === idx
                          ? "2px solid var(--color-muted-2)"
                          : "none",
                    }}
                    onClick={() => setSelectedFilter(idx)}
                  >
                    <StarIcon color="#374957" size={15} />
                    <p>{idx + 1}</p>
                  </button>
                ))}
              </div>

              {/* comments: safely iterate over selectedUser.comments (if present) */}
              <ul className={styles.commentsBox}>
                {(selectedUser?.comments || []).map((comment, idx) => (
                  <li key={idx} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <img
                        src={comment?.user?.avatar}
                        alt={comment?.user?.name}
                        onError={(e) => onImgError(e)}
                      />
                      <div className={styles.commentHeaderDetails}>
                        <small>{timeAgo(comment?.date)}</small>
                        <p>{comment?.user?.name}</p>
                        <ReviewStars
                          bgColor="transparent"
                          offColor="#8D93A5"
                          paddingLeft={0}
                          count={Math.floor(comment?.stars || 0)}
                        />
                      </div>
                    </div>
                    <div className={styles.commentMessage}>{comment?.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className={styles.usersList}>
            <div className={styles.userRow}>
              <div className={styles.userAvatarTitle}>User Profile</div>
              <div className={styles.userName}>User Name</div>
              <div className={styles.userLevel}>Status</div>
              <div className={styles.userVerified}>ID Status</div>
              <div className={styles.userBuisnessName}>Buisness Name</div>
              <div className={styles.userActiveAds}>Active Ads</div>
              <div className={styles.userJoined}>Joined</div>
            </div>
            {filteredUsers.length === 0 ? (
              <div className={styles.empty}>No users found</div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={styles.userRow}
                  onClick={() => setSelectedUser(u)}
                >
                  <img
                    src={u.profileImage || u.avatar}
                    alt={u.name}
                    className={styles.userAvatar}
                    onError={(e) => onImgError(e)}
                  />
                  <div className={styles.userName}>{u?.name}</div>
                  <div className={styles.userLevel}>{u?.level} Level</div>
                  <div className={styles.userVerified}>
                    {u?.verified ? "Verified" : "Not Verified"}
                  </div>
                  <div className={styles.userBuisnessName}>
                    {u?.businessName}
                  </div>
                  <div className={styles.userActiveAds}>
                    {formatNumber(u?.activeAds)} ads
                  </div>
                  <div className={styles.userJoined}>{timeAgo(u?.joined)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
