// Users.jsx
import React from "react";
import styles from "./users.module.css";
// <- new import: your generated dummy data file
import { users as usersPageData } from "../../api/users";
import formatNumber from "../../utils/numConverters";
import { Caret } from "../../components/SVGIcons/Caret";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { CheckMark } from "../../components/SVGIcons/CheckMark";

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
        <p className={styles.usersCount}>~ {filteredUsers.length} users</p>

        <div className={styles.usersList}>
          {filteredUsers.length === 0 ? (
            <div className={styles.empty}>No users found</div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className={styles.userRow}>
                <img
                  src={u.profileImage || u.avatar}
                  alt={u.name}
                  className={styles.userAvatar}
                  onError={(e) => onImgError(e)}
                />
                <div className={styles.userName}>
                  <strong>{u.name}</strong>
                  <p className={styles.businessName}>{u.businessName ?? ""}</p>
                </div>

                <div className={styles.userMeta}>
                  <div className={styles.userTypeLevel}>
                    <span className={styles.userType}>{u.type}</span>
                    <span className={styles.userLevel}>{u.level} level</span>
                  </div>

                  <div className={styles.userStats}>
                    <div className={styles.adsCount}>
                      {formatNumber(u.activeAds ?? 0)} ads
                    </div>
                    <div className={styles.verified}>
                      {u.verified ? "Verified" : "Not Verified"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
