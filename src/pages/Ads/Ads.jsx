import React, { useState, useMemo, useEffect, useRef } from "react";
import styles from "./ads.module.css";
import { Caret } from "../../components/SVGIcons/Caret";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import {
  getAdsList,
  updateAdStatus,
  deleteAdImage,
  getAdById,
} from "../../api/ads";
import { X } from "lucide-react";
import { CheckMark } from "../../components/SVGIcons/CheckMark";
import formatNumber, { timeAgo } from "../../utils/numConverters";
import TrashIcon from "../../assets/TrashIcon.png";
import ImageIcon from "../../components/SVGIcons/ImageIcon";
import { Support } from "../../components/SVGIcons/Support";
import { NavLink } from "react-router-dom";
import { ReviewStars } from "../../components/ReviewStars/ReviewStars";
import { StarIcon } from "../../components/SVGIcons/StarIcon";

/* ---------- helpers (unchanged) ---------- */
function parseDateApplied(raw) {
  if (!raw) return null;
  if (/\d{4}-\d{2}-\d{2}T/.test(raw)) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  if (raw instanceof Date) return raw;
  const s = String(raw).trim().toLowerCase();
  const now = new Date();
  if (s.startsWith("today")) {
    const timePart = s.replace(/^today/, "").trim();
    if (!timePart) return new Date(now);
    const parsed = new Date(`${now.toDateString()} ${timePart}`);
    return isNaN(parsed.getTime()) ? new Date(now) : parsed;
  }
  if (s.startsWith("yesterday")) {
    const timePart = s.replace(/^yesterday/, "").trim();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!timePart) return yesterday;
    const parsed = new Date(`${yesterday.toDateString()} ${timePart}`);
    return isNaN(parsed.getTime()) ? yesterday : parsed;
  }
  const daysMatch = s.match(/(\d+)\s+days?\s+ago/);
  if (daysMatch) {
    const n = parseInt(daysMatch[1], 10);
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  }
  if (s.includes("last week")) {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }
  const tryParse = new Date(raw);
  return isNaN(tryParse.getTime()) ? null : tryParse;
}

function collectValues(value, out = []) {
  if (value == null) return out;
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") {
    out.push(String(value));
    return out;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectValues(v, out);
    return out;
  }
  if (t === "object") {
    for (const k of Object.keys(value)) {
      if (k === "rawBlob" || k === "binaryData") continue;
      collectValues(value[k], out);
    }
  }
  return out;
}

function buildSearchableText(ad) {
  const vals = [];
  if (ad.title) vals.push(ad.title);
  if (ad.productCategory?.category) vals.push(ad.productCategory.category);
  if (ad.productCategory?.subcategory)
    vals.push(ad.productCategory.subcategory);
  if (ad.adPurpose) vals.push(ad.adPurpose);
  if (ad.subscriptionPlan) vals.push(ad.subscriptionPlan);
  if (ad.seller?.name) vals.push(ad.seller.name);
  if (ad.seller?.businessName) vals.push(ad.seller.businessName);
  if (ad.location?.city) vals.push(ad.location.city);
  if (ad.location?.area) vals.push(ad.location.area);
  if (ad.location?.street) vals.push(ad.location.street);
  if (Array.isArray(ad.tags)) vals.push(ad.tags.join(" "));
  if (Array.isArray(ad.images)) vals.push(ad.images.join(" "));
  if (Array.isArray(ad.comments)) {
    for (const c of ad.comments) {
      if (c.text) vals.push(c.text);
      if (c.user?.name) vals.push(c.user.name);
    }
  }
  if (Array.isArray(ad.attributes)) {
    for (const a of ad.attributes) vals.push(`${a.name} ${a.value}`);
  }
  if (Array.isArray(ad.parameters)) {
    for (const p of ad.parameters)
      vals.push(`${p.name} ${p.value || p.options?.join(" ")}`);
  }
  collectValues(ad, vals);
  return vals.filter(Boolean).join(" ").toLowerCase();
}

function useDebouncedValue(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function formatKeyName(key) {
  if (!key) return "";
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/* ---------- component ---------- */
export const Ads = () => {
  // State for dynamic data
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // selected ad
  const [selectedRow, setSelectedRow] = useState(null);

  // global search (search across all ad fields)
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(
    searchInput.trim().toLowerCase(),
    250
  );

  // user dropdown search (search users inside the Users dropdown)
  const [searchUserInput, setSearchUserInput] = useState("");
  const debouncedUserSearch = useDebouncedValue(
    searchUserInput.trim().toLowerCase(),
    200
  );

  // filters
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPromo, setSelectedPromo] = useState("All");
  const [selectedAdType, setSelectedAdType] = useState("All");
  const [selectedUser, setSelectedUser] = useState("All");

  // dropdown open states
  const [openStatus, setOpenStatus] = useState(false);
  const [openPromo, setOpenPromo] = useState(false);
  const [openAdType, setOpenAdType] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);

  // Refs
  const suspensionReasonRef = useRef(null);

  // Fetch ads data
  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await getAdsList();
      setAds(response.items || []);
    } catch (err) {
      console.error("Failed to fetch ads:", err);
      alert("Failed to load ads: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // API Handlers
  const handleSuspendAd = async (adId, reason) => {
    try {
      setActionLoading(true);
      await updateAdStatus(adId, {
        status: "suspended",
        reason: reason || "Manual suspension by admin",
      });
      await fetchAds(); // Refresh data
      alert("Ad suspended successfully");
    } catch (err) {
      console.error("Failed to suspend ad:", err);
      alert("Failed to suspend ad: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateAd = async (adId) => {
    try {
      setActionLoading(true);
      await updateAdStatus(adId, { status: "active" });
      await fetchAds(); // Refresh data
      alert("Ad activated successfully");
    } catch (err) {
      console.error("Failed to activate ad:", err);
      alert("Failed to activate ad: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      setActionLoading(true);
      await updateAdStatus(adId, { status: "deleted" });
      setSelectedRow(null);
      await fetchAds(); // Refresh data
      alert("Ad deleted successfully");
    } catch (err) {
      console.error("Failed to delete ad:", err);
      alert("Failed to delete ad: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteImage = async (adId, imageIndex) => {
    try {
      const imageUrl = selectedRow.images[imageIndex];
      // Extract image ID from URL or use the URL itself
      const imageId = imageUrl.split("/").pop() || imageUrl;

      await deleteAdImage(adId, imageId, {
        reason: "Removed by admin",
      });

      // Update local state
      setSelectedRow((prev) => ({
        ...prev,
        images: prev.images.filter((_, idx) => idx !== imageIndex),
      }));

      // Also update in the main ads list
      setAds((prev) =>
        prev.map((ad) =>
          ad.id === adId
            ? {
                ...ad,
                images: ad.images.filter((_, idx) => idx !== imageIndex),
              }
            : ad
        )
      );

      alert("Image deleted successfully");
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Failed to delete image: " + err.message);
    }
  };

  // options derived from ads data
  const statusOptions = useMemo(
    () => ["All", "Active", "Pending", "Suspended"],
    []
  );
  const promoOptions = useMemo(() => {
    const set = new Set(["Basic", "Premium", "Business"]);
    (ads || []).forEach(
      (a) => a.subscriptionPlan && set.add(a.subscriptionPlan)
    );
    return ["All", ...Array.from(set)];
  }, [ads]);

  const adTypeOptions = useMemo(() => {
    const set = new Set(["Sale", "Pay Later", "Rent"]);
    (ads || []).forEach((a) => a.adPurpose && set.add(a.adPurpose));
    return ["All", ...Array.from(set)];
  }, [ads]);

  const userOptions = useMemo(() => {
    const set = new Set();
    (ads || []).forEach((a) => a.seller?.name && set.add(a.seller.name));
    return ["All", ...Array.from(set)];
  }, [ads]);

  // filter userOptions by the user-search input (so the dropdown list is searchable)
  const filteredUserOptions = useMemo(() => {
    if (!debouncedUserSearch) return userOptions;
    return userOptions.filter(
      (u) =>
        u === "All" ||
        String(u || "")
          .toLowerCase()
          .includes(debouncedUserSearch)
    );
  }, [userOptions, debouncedUserSearch]);

  // precompute searchable text and thumbnail once
  const dataWithSearch = useMemo(() => {
    return (ads || []).map((ad) => ({
      ...ad,
      _searchText: buildSearchableText(ad),
      _thumbnail:
        Array.isArray(ad.images) && ad.images.length ? ad.images[0] : null,
    }));
  }, [ads]);

  // combined filters (global search + dropdowns)
  const filteredData = useMemo(() => {
    const q = debouncedSearch || "";
    return (dataWithSearch || []).filter((row) => {
      if (q && !row._searchText.includes(q)) return false;

      if (
        selectedStatus !== "All" &&
        String(row.status || "").toLowerCase() !== selectedStatus.toLowerCase()
      )
        return false;

      if (
        selectedPromo !== "All" &&
        String(row.subscriptionPlan || "").toLowerCase() !==
          selectedPromo.toLowerCase()
      )
        return false;

      if (selectedAdType !== "All") {
        const adp = String(row.adPurpose || "").toLowerCase();
        if (!adp.includes(selectedAdType.toLowerCase())) return false;
      }

      if (selectedUser !== "All") {
        const sellerName = String(row.seller?.name || "").toLowerCase();
        if (!sellerName.includes(String(selectedUser).toLowerCase()))
          return false;
      }

      return true;
    });
  }, [
    dataWithSearch,
    debouncedSearch,
    selectedStatus,
    selectedPromo,
    selectedAdType,
    selectedUser,
  ]);

  const deleteImages = (imageIndex) => {
    handleDeleteImage(selectedRow.id, imageIndex);
  };

  // Dropdown component: allowSearch toggles user search input
  const Dropdown = ({
    label,
    open,
    setOpen,
    options,
    value,
    onSelect,
    allowSearch = false,
  }) => {
    const inputRef = React.useRef(null);

    // focus the input when dropdown opens (use setTimeout to allow layout to settle)
    React.useEffect(() => {
      if (open && allowSearch) {
        const id = setTimeout(() => {
          inputRef.current?.focus();
          // optionally place caret at end:
          const val = inputRef.current?.value ?? "";
          inputRef.current &&
            inputRef.current.setSelectionRange(val.length, val.length);
        }, 0);
        return () => clearTimeout(id);
      }
    }, [open, allowSearch]);

    // keep the dropdown mounted to avoid unmount/remount (which causes focus loss)
    // but hide it visually when closed
    return (
      <div
        className={styles.dropdownWrapper}
        // stop clicks from bubbling to any parent document click handlers that might close the dropdown
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.dropdown}
          onClick={() => setOpen((s) => !s)}
          type="button"
        >
          <p>
            {label}: {value}
          </p>
          <button>
            <Caret />
          </button>
        </button>

        {/* keep mounted, toggle visibility to prevent node recreation */}
        <div
          className={styles.dropdownMenu}
          style={{ display: open ? "block" : "none" }}
          // prevent the native blur when clicking inside (helps input keep focus)
          onMouseDown={(e) => e.stopPropagation()}
        >
          {allowSearch && (
            <div
              className={styles.dropDownUserSearch}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <SearchIcon />
              <input
                ref={inputRef}
                autoComplete="off"
                type="search"
                placeholder="Search users..."
                value={searchUserInput}
                // keep raw value — do not trim/toLowerCase here (do that in debounced filter)
                onChange={(e) => setSearchUserInput(e.target.value)}
                onKeyDown={(e) => {
                  // optional: close on Escape
                  if (e.key === "Escape") setOpen(false);
                }}
              />
            </div>
          )}

          {options.map((opt) => (
            // use onMouseDown instead of onClick to select before input blur
            <div
              key={String(opt)}
              className={styles.dropdownItem}
              onMouseDown={(e) => {
                e.preventDefault(); // prevents the input from losing caret before we handle selection
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

  if (loading) {
    return <div className={styles.loading}>Loading ads...</div>;
  }

  return (
    <div className={styles.adsContainer}>
      <div className={styles.header}>
        <div className={styles.dropDownTray}>
          <Dropdown
            label="Status"
            open={openStatus}
            setOpen={setOpenStatus}
            options={statusOptions}
            value={selectedStatus}
            onSelect={setSelectedStatus}
          />
          <Dropdown
            label="Promo"
            open={openPromo}
            setOpen={setOpenPromo}
            options={promoOptions}
            value={selectedPromo}
            onSelect={setSelectedPromo}
          />
          <Dropdown
            label="Ad Type"
            open={openAdType}
            setOpen={setOpenAdType}
            options={adTypeOptions}
            value={selectedAdType}
            onSelect={setSelectedAdType}
          />
          <Dropdown
            label="Users"
            open={openUsers}
            setOpen={setOpenUsers}
            options={filteredUserOptions}
            value={selectedUser}
            onSelect={setSelectedUser}
            allowSearch={true}
          />
        </div>

        <div className={styles.search}>
          <SearchIcon />
          <input
            type="search"
            placeholder="Search by title, seller, tags, attrs, comments..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {!selectedRow ? (
        <div className={styles.table}>
          <div className={styles.count}>~{filteredData.length} ads</div>

          <ul className={styles.adsPreivewTable}>
            {filteredData.map((ad) => (
              <li
                key={ad.id}
                className={styles.adRow}
                onClick={() => {
                  setSelectedRow(ad);
                }}
              >
                <div className={styles.adInfo}>
                  <img
                    src={ad._thumbnail || "/placeholder.png"}
                    alt={ad.title}
                    className={styles.thumb}
                  />
                  <div className={styles.rowTop}>
                    <h3 style={{ fontWeight: "normal" }}>{ad.title}</h3>
                    <h2 className={styles.price} style={{ fontWeight: "500" }}>
                      {ad.price ? `₵${ad.price.toLocaleString()}` : "—"}
                    </h2>
                  </div>
                </div>

                <div className={styles.adSellerInfo}>
                  <img
                    src={ad?.seller?.avatar || "/placeholder.png"}
                    alt={ad?.seller?.name || "seller"}
                    className={`${styles.thumb} ${styles.userAvater}`}
                  />
                  <div className={styles.adSellerUserData}>
                    {ad?.approvedBy && (
                      <>
                        Approved By: <span>{ad.approvedBy}</span>
                        {"\u00A0\u00A0"}
                      </>
                    )}
                    {ad?.seller?.businessName && (
                      <>
                        By: <span>{ad?.seller?.businessName}</span>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={styles.adBox}>
          <div className={styles.adDetails}>
            <div className={styles.headerOne}>
              <button
                className={styles.backButton}
                onClick={() => setSelectedRow(null)}
              >
                <button type="button">
                  <Caret />
                </button>
                <p>Return</p>
              </button>

              <div className={styles.timeVerifiedBox}>
                <div className={styles.time}>
                  ~
                  {parseDateApplied(selectedRow?.postedOn)?.toLocaleString() ||
                    "Unknown"}
                </div>
                <div className={styles.isVerified}>
                  {selectedRow?.seller?.verified ? (
                    <div className={styles.verified}>
                      <CheckMark size={1} />
                      <p>Verified</p>
                    </div>
                  ) : (
                    <div className={styles.notVerified}>
                      <X />
                      <p>Not Verified</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ul className={styles.headerTwo}>
              {Object.entries(selectedRow?.stats || {}).map(([key, value]) => (
                <li key={key}>
                  <p>
                    {formatKeyName(key)}:{" "}
                    <span>
                      {formatNumber(value)}
                      {key === "boostMultiplier" && "x"}
                    </span>
                  </p>
                </li>
              ))}
            </ul>

            <ul className={styles.images}>
              {selectedRow?.images?.map((image, idx) => (
                <li className={styles.image} key={idx}>
                  <img
                    src={image}
                    className={styles.adImage}
                    alt={`ad-${idx}`}
                  />
                  <span className={styles.delIcon}>
                    <button
                      onClick={() => deleteImages(idx)}
                      disabled={actionLoading}
                    >
                      <ImageIcon src={TrashIcon} size={1.5} alt="Ads Icon" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>

            <div
              style={{
                margin: selectedRow?.status === "Suspended" ? "2rem" : 0,
              }}
            />

            {selectedRow?.status !== "Suspended" ? (
              <div className={styles.buttonRack}>
                <div className={styles.suspensionRack}>
                  <textarea
                    ref={suspensionReasonRef}
                    className={styles.explainSuspension}
                    placeholder="Type reason for suspension"
                  />
                  <button
                    className={`${styles.statusButton} ${styles.suspend}`}
                    onClick={() =>
                      handleSuspendAd(
                        selectedRow.id,
                        suspensionReasonRef.current?.value
                      )
                    }
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Suspending..." : "Suspend"}
                  </button>
                  {selectedRow?.status === "Pending" && (
                    <button
                      disabled={!selectedRow?.verified || actionLoading}
                      className={`${styles.statusButton} ${styles.activate}`}
                      onClick={() => handleActivateAd(selectedRow.id)}
                    >
                      {actionLoading ? "Activating..." : "Activate Ad"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Add the delete ad functionality
              <button
                className={`${styles.statusButton} ${styles.delete}`}
                onClick={() => handleDeleteAd(selectedRow.id)}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete Ad"}
              </button>
            )}
          </div>

          <div className={styles.adDetails}>
            <label>Product Category</label>
            <input
              type="text"
              defaultValue={`${selectedRow?.productCategory?.category} → ${selectedRow?.productCategory?.subcategory}`}
              readOnly
            />

            <label>Title</label>
            <input type="text" defaultValue={selectedRow?.title} readOnly />

            <label>Ad Purpose</label>
            <div className={styles.adPurposeBox}>
              <div className={styles.adPurpose}>
                <div>
                  <input
                    type="radio"
                    defaultChecked={selectedRow?.adPurpose === "Sale"}
                    readOnly
                  />
                </div>
                <label>Sale</label>
              </div>
              <div className={styles.adPurpose}>
                <div>
                  <input
                    type="radio"
                    defaultChecked={selectedRow?.adPurpose === "Pay Later"}
                    readOnly
                  />
                </div>
                <label>Pay Later</label>
              </div>
              <div className={styles.adPurpose}>
                <div>
                  <input
                    type="radio"
                    defaultChecked={selectedRow?.adPurpose === "Rent"}
                    readOnly
                  />
                </div>
                <label>Rent</label>
              </div>
            </div>

            <label>Price</label>
            <input
              type="text"
              defaultValue={selectedRow?.price ? `₵ ${selectedRow.price}` : ""}
              readOnly
            />
            <input
              type="text"
              defaultValue={`${selectedRow?.location?.city || ""}, ${
                selectedRow?.location?.area || ""
              }`}
              readOnly
            />
            <input
              type="text"
              defaultValue={selectedRow?.location?.street || ""}
              readOnly
            />

            <label>Key Features</label>
            {selectedRow?.attributes?.map((attribute, idx) => (
              <input
                type="text"
                defaultValue={`${attribute?.name}: ${attribute?.value}`}
                key={idx}
                readOnly
              />
            ))}

            {selectedRow?.parameters?.map((parameter, idx) => (
              <input
                type="text"
                defaultValue={`${parameter?.name}: ${parameter?.value}`}
                key={idx}
                readOnly
              />
            ))}

            <label>Condition</label>
            <input type="text" defaultValue={selectedRow?.condition} readOnly />
          </div>

          <div className={styles.adDetails}>
            <div className={styles.head}>
              <img
                src={selectedRow?.seller?.avatar}
                alt={selectedRow?.seller?.name}
              />
              <NavLink to="/support" className={styles.backButton}>
                <p>Chat</p>
                <Support size={1} />
              </NavLink>
              <h1>{selectedRow?.seller?.name}</h1>

              <div className={styles.levelBox}>
                <div className={styles.textMark}>
                  <span className={styles.checkmark}>
                    <CheckMark />
                  </span>
                  <p>High Level</p>
                </div>
                <div className={styles.bar} />
              </div>

              <div className={styles.adsBoxSeller}>
                <div className={styles.adBoxSeller}>
                  <h2>{formatNumber(selectedRow?.seller?.activeAdsCount)}</h2>
                  <p>Active Ads</p>
                </div>
                <div className={styles.adBoxSeller}>
                  <h2>{formatNumber(selectedRow?.seller?.soldAdsCount)}</h2>
                  <p>Sold Ads</p>
                </div>
              </div>
            </div>

            <div className={styles.reviewsBox}>
              <div className={styles.reviewColumn}>
                <h1>{selectedRow?.aggregatedReviews?.averageRating}</h1>
                <ReviewStars
                  bgColor="transparent"
                  offColor="#8D93A5"
                  count={Math.floor(
                    selectedRow?.aggregatedReviews?.averageRating || 0
                  )}
                />
                <p>{selectedRow?.aggregatedReviews?.totalReviews} Reviews</p>
              </div>

              <ul className={styles.reviewColumn}>
                {Object.entries(
                  selectedRow?.aggregatedReviews?.ratingBreakdown || {}
                ).map(([star, count]) => {
                  const total = Object.values(
                    selectedRow?.aggregatedReviews?.ratingBreakdown || {}
                  ).reduce((a, b) => a + b, 0);
                  return (
                    <li key={star} className={styles.starRating}>
                      <span>
                        <StarIcon color="#374957" size={1} />
                      </span>
                      <p>{star}</p>
                      <div className={styles.reviewBar}>
                        <div
                          className={styles.reviewProgress}
                          style={{
                            "--progress-width": total
                              ? `${((count / total) * 100).toFixed(1)}%`
                              : "0%",
                          }}
                        />
                      </div>
                      <p>{total ? ((count / total) * 100).toFixed(1) : 0}%</p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ul className={styles.commentsBox}>
              {selectedRow?.comments?.map((comment, idx) => (
                <li key={idx} className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <img
                      src={comment?.user?.avatar}
                      alt={comment?.user?.name}
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
      )}
    </div>
  );
};
