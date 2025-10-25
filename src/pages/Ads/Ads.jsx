import React, { useState, useMemo, useEffect, useRef } from "react";
import styles from "./ads.module.css";
import { Caret } from "../../components/SVGIcons/Caret";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { adsData } from "../../api/ads"; // <-- use this or fetch from API

// helper: recursively collect primitive values into an array
function collectValues(value, out = []) {
  if (value == null) return out; // covers null/undefined
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
    // for objects, pick useful fields but also traverse: avoid extremely large binary-like fields
    // we'll skip raw image binary (we only want their filenames/urls, which are strings and already handled)
    for (const k of Object.keys(value)) {
      // optional: skip very large nested blobs if you have them
      if (k === "rawBlob" || k === "binaryData") continue;
      collectValues(value[k], out);
    }
  }
  return out;
}

// build a single searchable lowercase string for an ad
function buildSearchableText(ad) {
  const vals = [];
  // Prefer explicit fields first for predictability:
  if (ad.title) vals.push(ad.title);
  if (ad.productCategory?.category) vals.push(ad.productCategory.category);
  if (ad.productCategory?.subcategory)
    vals.push(ad.productCategory.subcategory);
  if (ad.adPurpose) vals.push(ad.adPurpose);
  if (ad.subscriptionPlan) vals.push(ad.subscriptionPlan);
  // seller fields
  if (ad.seller?.name) vals.push(ad.seller.name);
  if (ad.seller?.businessName) vals.push(ad.seller.businessName);
  // location fields
  if (ad.location?.city) vals.push(ad.location.city);
  if (ad.location?.area) vals.push(ad.location.area);
  if (ad.location?.street) vals.push(ad.location.street);
  // include arrays & attributes & params & tags
  if (Array.isArray(ad.tags)) vals.push(ad.tags.join(" "));
  if (Array.isArray(ad.images)) vals.push(ad.images.join(" "));
  if (Array.isArray(ad.comments)) {
    for (const c of ad.comments) {
      if (c.text) vals.push(c.text);
      if (c.user?.name) vals.push(c.user.name);
    }
  }
  // attributes and parameters (key/value pairs)
  if (Array.isArray(ad.attributes)) {
    for (const a of ad.attributes) vals.push(`${a.name} ${a.value}`);
  }
  if (Array.isArray(ad.parameters)) {
    for (const p of ad.parameters)
      vals.push(`${p.name} ${p.value || p.options?.join(" ")}`);
  }
  // fallback: collect any other primitive values recursively
  collectValues(ad, vals);

  return vals.filter(Boolean).join(" ").toLowerCase();
}

// simple debounce hook
function useDebouncedValue(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export const Ads = () => {
  const [selectedRow, setSelectedRow] = useState(null);

  // search + filters state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(
    searchInput.trim().toLowerCase(),
    250
  );

  const [selectedStatus, setSelectedStatus] = useState("All"); // All | Active | Pending | Suspended
  const [selectedPromo, setSelectedPromo] = useState("All"); // All | Basic | Premium | Business
  const [selectedAdType, setSelectedAdType] = useState("All"); // All | subcategory names
  const [selectedUser, setSelectedUser] = useState("All"); // All | seller name (or partial)

  // dropdown open states (you had setOpenPromo previously, but not defined; adding all)
  const [openStatus, setOpenStatus] = useState(false);
  const [openPromo, setOpenPromo] = useState(false);
  const [openAdType, setOpenAdType] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);

  // 1) derive unique options from data (status/promo/adTypes/users)
  const statusOptions = useMemo(
    () => ["All", "Active", "Pending", "Suspended"],
    []
  );
  const promoOptions = useMemo(() => {
    const set = new Set(["Basic", "Premium", "Business"]);
    adsData.forEach((a) => a.subscriptionPlan && set.add(a.subscriptionPlan));
    return ["All", ...Array.from(set)];
  }, [adsData]);

  const adTypeOptions = useMemo(() => {
    const set = new Set();
    adsData.forEach((a) => {
      if (a.productCategory?.subcategory)
        set.add(a.productCategory.subcategory);
    });
    return ["All", ...Array.from(set)];
  }, [adsData]);

  const userOptions = useMemo(() => {
    const set = new Set();
    adsData.forEach((a) => a.seller?.name && set.add(a.seller.name));
    return ["All", ...Array.from(set).slice(0, 50)]; // limit users shown if many
  }, [adsData]);

  // 2) precompute searchable text once per ad (memoized)
  const dataWithSearch = useMemo(() => {
    return (adsData || []).map((ad) => {
      return {
        ...ad,
        _searchText: buildSearchableText(ad),
        // provide a thumbnail convenience field used for summary/card
        _thumbnail:
          Array.isArray(ad.images) && ad.images.length ? ad.images[0] : null,
      };
    });
  }, [adsData]);

  // 3) filter logic (combined search + dropdown filters)
  const filteredData = useMemo(() => {
    const q = debouncedSearch || "";
    return (dataWithSearch || []).filter((row) => {
      // global search - checks the prebuilt string
      if (q && !row._searchText.includes(q)) return false;

      // status filter
      if (
        selectedStatus !== "All" &&
        String(row.status).toLowerCase() !== selectedStatus.toLowerCase()
      )
        return false;

      // promo/subscription filter
      if (
        selectedPromo !== "All" &&
        String(row.subscriptionPlan).toLowerCase() !==
          selectedPromo.toLowerCase()
      )
        return false;

      // ad type (match subcategory)
      if (selectedAdType !== "All") {
        const sub = (row.productCategory?.subcategory || "").toLowerCase();
        if (!sub.includes(selectedAdType.toLowerCase())) return false;
      }

      // user filter (partial match allowed)
      if (selectedUser !== "All") {
        const sellerName = (row.seller?.name || "").toLowerCase();
        if (!sellerName.includes(selectedUser.toLowerCase())) return false;
      }
      setSelectedRow(null);
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

  // small helper render for dropdowns
  const Dropdown = ({ label, open, setOpen, options, value, onSelect }) => (
    <div className={styles.dropdownWrapper}>
      <button
        className={styles.dropdown}
        onClick={() => setOpen((s) => !s)}
        type="button"
      >
        <p>
          {label}: {value}
        </p>
        <div>
          <Caret />
        </div>
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          {options.map((opt) => (
            <div
              key={opt}
              className={styles.dropdownItem}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  console.log(selectedRow);

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
            options={userOptions}
            value={selectedUser}
            onSelect={setSelectedUser}
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
          <div className={styles.count}>
            ~{filteredData.length} {"ads"}
          </div>

          <ul className={styles.adsPreivewTable}>
            {filteredData.map((ad) => (
              <li
                key={ad.id}
                className={styles.adRow}
                onClick={() => setSelectedRow(ad)}
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
                      ₵{ad.price.toLocaleString()}
                    </h2>
                  </div>
                </div>
                <div className={styles.adSellerInfo}>
                  <img
                    src={ad?.seller?.avatar || "/placeholder.png"}
                    alt={ad.title}
                    className={`${styles.thumb} ${styles.userAvater}`}
                  />
                  <div className={styles.adSellerUserData}>
                    {ad?.approvedBy && (
                      <>
                        Approved By: <span>{ad.approvedBy}</span> {"    "}
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
        <div className={styles.adBox}></div>
      )}
    </div>
  );
};
