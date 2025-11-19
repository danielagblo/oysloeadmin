import React, { useMemo, useState, useEffect, useRef } from "react";
import styles from "./users.module.css";
import {
  getUsers,
  getUser,
  verifyUser,
  updateUserLevel,
  muteUser,
  deleteUser,
  createAdminFunc,
  getUserStats,
} from "../../api/users";
import { uploadAdminProfileImage } from "../../api/upload";
import formatNumber from "../../utils/numConverters";
import { timeAgo } from "../../utils/numConverters";
import { Caret } from "../../components/SVGIcons/Caret";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { CheckMark } from "../../components/SVGIcons/CheckMark";
import { ReviewStars } from "../../components/ReviewStars/ReviewStars";
import { StarIcon } from "../../components/SVGIcons/StarIcon";
import ImageIcon from "../../components/SVGIcons/ImageIcon";
import TrashIcon from "../../assets/TrashIcon.png";
import { NullImageIcon } from "../../components/SVGIcons/NullImageIcon";
import { Plus } from "lucide-react";

export const Users = () => {
  // State for dynamic data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // selected user
  const [selectedUser, setSelectedUser] = useState(null);
  const [createAdmin, setCreateAdmin] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(-1);

  // dropdown open states
  const [openStatus, setOpenStatus] = useState(false);
  const [openPromo, setOpenPromo] = useState(false);
  const [openAdType, setOpenAdType] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [openIdStatus, setOpenIdStatus] = useState(false);
  const [openUserLevel, setOpenUserLevel] = useState(false);

  // selected values
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPromo, setSelectedPromo] = useState("all");
  const [selectedAdType, setSelectedAdType] = useState("all");

  // search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Refs
  const fileInputRef = useRef(null);

  // Admin creation form
  const [createAdminForm, setCreateAdminForm] = useState({
    name: "",
    username: "",
    passkey: "",
    roleIsStaff: true,
    profileFile: null,
    profilePreviewUrl: "",
  });

  // Fetch users and stats
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({ limit: 1000 });
      setUsers(response.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      alert("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      setStats(response);
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // Cleanup effect for preview URLs
  useEffect(() => {
    return () => {
      if (createAdminForm.profilePreviewUrl) {
        URL.revokeObjectURL(createAdminForm.profilePreviewUrl);
      }
    };
  }, [createAdminForm.profilePreviewUrl]);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // API Handlers
  const handleVerifyUser = async (userId, status, notes = "") => {
    try {
      setActionLoading(true);
      await verifyUser(userId, status, notes);
      await fetchUsers();

      if (selectedUser && selectedUser.id === userId) {
        const updatedUser = await getUser(userId);
        setSelectedUser(updatedUser);
      }

      alert(`User ${status} successfully`);
    } catch (err) {
      console.error("Failed to verify user:", err);
      alert("Failed to verify user: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUserLevel = async (userId, level, notes = "") => {
    try {
      setActionLoading(true);
      await updateUserLevel(userId, level, notes);
      await fetchUsers();

      if (selectedUser && selectedUser.id === userId) {
        const updatedUser = await getUser(userId);
        setSelectedUser(updatedUser);
      }

      alert("User level updated successfully");
    } catch (err) {
      console.error("Failed to update user level:", err);
      alert("Failed to update user level: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMuteUser = async (userId, action, reason = "") => {
    try {
      setActionLoading(true);
      await muteUser(userId, action, reason);
      await fetchUsers();

      if (selectedUser && selectedUser.id === userId) {
        const updatedUser = await getUser(userId);
        setSelectedUser(updatedUser);
      }

      alert(`User ${action}d successfully`);
    } catch (err) {
      console.error("Failed to mute user:", err);
      alert("Failed to mute user: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, reason = "", permanent = false) => {
    if (
      !confirm(
        `Are you sure you want to ${
          permanent ? "permanently delete" : "delete"
        } this user?`
      )
    )
      return;

    try {
      setActionLoading(true);
      await deleteUser(userId, reason, permanent);
      await fetchUsers();

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }

      alert(
        `User ${permanent ? "permanently deleted" : "deleted"} successfully`
      );
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAdmin = async (adminData) => {
    try {
      setActionLoading(true);
      await createAdminFunc(adminData);
      await fetchUsers();
      alert("Admin created successfully");
      return true;
    } catch (err) {
      console.error("Failed to create admin:", err);
      alert("Failed to create admin: " + err.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    try {
      setActionLoading(true);
      const fullUser = await getUser(user.id);
      setSelectedUser(fullUser);
    } catch (err) {
      console.error("Failed to load user details:", err);
      alert("Failed to load user details: " + err.message);
      setSelectedUser(user);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtering logic
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
  const idStatusOptions = ["verified", "not verified"];
  const levelOptions = ["high", "middle", "low"];

  function filterUsers(
    list = [],
    { status = "all", promo = "all", search = "" } = {}
  ) {
    if (!Array.isArray(list)) return [];

    const promoSet =
      promo === "all" ? null : new Set([String(promo).toLowerCase()]);
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

  const filteredUsers = useMemo(
    () =>
      filterUsers(users, {
        status: selectedStatus,
        promo: selectedPromo,
        search: debouncedSearch,
      }),
    [users, selectedStatus, selectedPromo, debouncedSearch]
  );

  // User dropdown options
  const userOptions = useMemo(() => {
    const opts = users.map((u) => `${u.name} (${u.businessName ?? "—"})`);
    return ["all", ...opts];
  }, [users]);

  const [userDropdownQuery, setUserDropdownQuery] = useState("");
  const filteredUserOptions = useMemo(() => {
    const q = String(userDropdownQuery || "")
      .trim()
      .toLowerCase();
    if (!q) return userOptions;
    return userOptions.filter((o) => o.toLowerCase().includes(q));
  }, [userOptions, userDropdownQuery]);

  // UI Helpers
  const onImgError = (e, fallback = "") => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  };

  const handleProfileFileChange = (file) => {
    if (!file) return;

    // Clean up previous preview URL
    if (createAdminForm.profilePreviewUrl) {
      URL.revokeObjectURL(createAdminForm.profilePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setCreateAdminForm((p) => ({
      ...p,
      profileFile: file,
      profilePreviewUrl: previewUrl,
    }));
  };

  const onCreateAdminFile = (e) => {
    const f = e.target.files?.[0];
    if (f) handleProfileFileChange(f);
  };

  const handleAddAdmin = async () => {
    if (!createAdminForm.name.trim() || !createAdminForm.username.trim()) {
      alert("Provide name and username.");
      return;
    }

    try {
      setActionLoading(true);

      let profileImageUrl = "";

      if (createAdminForm.profileFile) {
        try {
          profileImageUrl = await uploadAdminProfileImage(
            createAdminForm.profileFile
          );
          console.log("Profile image uploaded:", profileImageUrl);
        } catch (uploadError) {
          console.error("Failed to upload profile image:", uploadError);
          alert(
            "Failed to upload profile image. Creating admin without image."
          );
        }
      }

      const adminData = {
        name: createAdminForm.name.trim(),
        username: createAdminForm.username.trim(),
        passkey: createAdminForm.passkey.trim(),
        role: createAdminForm.roleIsStaff ? "staff" : "admin",
        profileImageUrl: profileImageUrl,
      };

      const success = await handleCreateAdmin(adminData);

      if (success) {
        // Clean up preview URL
        if (createAdminForm.profilePreviewUrl) {
          URL.revokeObjectURL(createAdminForm.profilePreviewUrl);
        }

        setCreateAdminForm({
          name: "",
          username: "",
          passkey: "",
          roleIsStaff: true,
          profileFile: null,
          profilePreviewUrl: "",
        });
        setCreateAdmin(false);
      }
    } catch (error) {
      console.error("Error in handleAddAdmin:", error);
      alert("Failed to create admin: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAdmin = () => {
    // Clean up preview URL
    if (createAdminForm.profilePreviewUrl) {
      URL.revokeObjectURL(createAdminForm.profilePreviewUrl);
    }

    setCreateAdminForm({
      name: "",
      username: "",
      passkey: "",
      roleIsStaff: true,
      profileFile: null,
      profilePreviewUrl: "",
    });
    setCreateAdmin(false);
  };

  // Dropdown component
  const Dropdown = ({
    label,
    useDefault = false,
    open,
    setOpen,
    options = [],
    value,
    onSelect,
    allowSearch = false,
    searchValue,
    onSearchChange,
  }) => {
    const inputRef = useRef(null);

    useEffect(() => {
      if (open && allowSearch) {
        const id = setTimeout(() => inputRef.current?.focus(), 0);
        return () => clearTimeout(id);
      }
    }, [open, allowSearch]);

    return (
      <div
        className={styles.dropdownWrapper}
        style={styles}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={useDefault ? styles.dropdown : styles.dropDownSetterButton}
          type="button"
          onClick={() => setOpen((s) => !s)}
        >
          <p style={{ textTransform: "capitalize" }}>
            {useDefault ? `${label}: ${value}` : value || label}
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

  // Helper functions for selected user actions
  const handleSetIdStatus = (opt) => {
    if (!selectedUser) return;
    const status =
      String(opt).toLowerCase() === "verified" ? "verified" : "unverified";
    handleVerifyUser(
      selectedUser.id,
      status,
      `Status changed to ${status} via admin UI`
    );
  };

  const handleSetUserLevel = (opt) => {
    if (!selectedUser) return;
    const level = String(opt).toLowerCase();
    handleUpdateUserLevel(
      selectedUser.id,
      level,
      `Level changed to ${level} via admin UI`
    );
  };

  const handleToggleMute = () => {
    if (!selectedUser) return;
    const action = selectedUser.muted ? "unmute" : "mute";
    const reason = action === "mute" ? "User muted via admin UI" : "";
    handleMuteUser(selectedUser.id, action, reason);
  };

  const handleUserDelete = () => {
    if (!selectedUser) return;
    handleDeleteUser(selectedUser.id, "Deleted via admin UI", false);
  };

  if (loading) {
    return <div className={styles.loading}>Loading users...</div>;
  }

  return (
    <div className={styles.usersContainer}>
      <div className={styles.header}>
        <div className={styles.dropDownTray}>
          {!selectedUser && !createAdmin && (
            <>
              <Dropdown
                label="Status"
                useDefault={true}
                open={openStatus}
                setOpen={setOpenStatus}
                options={statusOptions}
                value={selectedStatus}
                onSelect={(v) => setSelectedStatus(v)}
              />
              <Dropdown
                label="Promo"
                open={openPromo}
                useDefault={true}
                setOpen={setOpenPromo}
                options={promoOptions}
                value={selectedPromo}
                onSelect={(v) => setSelectedPromo(v)}
              />

              <button
                className={styles.createAdminButton}
                onClick={() => {
                  setCreateAdmin((prev) => !prev);
                  setSelectedPromo("all");
                  setSelectedStatus("all");
                }}
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
              <Dropdown
                label="ID Status"
                useDefault={false}
                open={openIdStatus}
                setOpen={setOpenIdStatus}
                options={idStatusOptions}
                value={selectedUser?.verified ? "verified" : "not verified"}
                onSelect={(opt) => handleSetIdStatus(opt)}
              />

              <Dropdown
                label="Status"
                useDefault={false}
                open={openUserLevel}
                setOpen={setOpenUserLevel}
                options={levelOptions}
                value={selectedUser?.level ?? "unknown"}
                onSelect={(opt) => handleSetUserLevel(opt)}
              />

              <button
                className={styles.muteButton}
                onClick={handleToggleMute}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : selectedUser?.muted
                  ? "Unmute"
                  : "Mute"}
              </button>

              <button
                className={styles.deleteButton}
                onClick={handleUserDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
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
                  <p>Business Logo</p>
                </div>
              </div>

              <p>General Details</p>
              <div className={styles.generalDetails}>
                <label>Name</label>
                <input defaultValue={selectedUser?.name} readOnly />
                <div className={styles.labelVerified}>
                  <label>Email</label>
                  <span
                    style={{
                      backgroundColor: selectedUser?.verified
                        ? "#00acff"
                        : "#ff0000",
                    }}
                  >
                    {selectedUser?.verified ? "Verified" : "Not Verified"}
                  </span>
                </div>
                <input defaultValue={selectedUser?.email} readOnly />
                <label>First Number</label>
                <input defaultValue={selectedUser?.phonePrimary} readOnly />
                <label>Second Number</label>
                <input
                  defaultValue={selectedUser?.phoneSecondary || "---"}
                  readOnly
                />
                <div className={styles.labelVerified}>
                  <label>National ID</label>
                  <span
                    style={{
                      backgroundColor: selectedUser?.verified
                        ? "#00acff"
                        : "#ff0000",
                    }}
                  >
                    {selectedUser?.verified ? "Verified" : "Not Verified"}
                  </span>
                </div>
                <input defaultValue={selectedUser?.nationalId} readOnly />
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
                <label>Business Name</label>
                <input defaultValue={selectedUser?.businessName} readOnly />
                <p>Payment Account</p>
                <label>Account Name</label>
                <input defaultValue={selectedUser?.accountName} readOnly />
                <label>Account Number</label>
                <input
                  defaultValue={selectedUser?.accountNumber || "---"}
                  readOnly
                />
                <label>Mobile Network</label>
                <input defaultValue={selectedUser?.mobileNetwork} readOnly />
              </div>
            </div>

            <div className={styles.userColumn}>
              <div className={styles.reviewsBox}>
                <div className={styles.reviewColumn}>
                  <h1>
                    {selectedUser?.aggregatedReviews?.averageRating?.toFixed(
                      1
                    ) || 0}
                  </h1>
                  <ReviewStars
                    bgColor="transparent"
                    offColor="#8D93A5"
                    count={Math.floor(
                      selectedUser?.aggregatedReviews?.averageRating || 0
                    )}
                  />
                  <p>
                    {formatNumber(
                      selectedUser?.aggregatedReviews?.totalReviews
                    )}{" "}
                    Reviews
                  </p>
                </div>

                <ul className={styles.reviewColumn}>
                  {Object.keys(
                    selectedUser?.aggregatedReviews?.ratingBreakdown || {}
                  ).length === 0 ? (
                    <li className={styles.starRatingEmpty}>No ratings yet</li>
                  ) : (
                    Object.entries(
                      selectedUser?.aggregatedReviews?.ratingBreakdown || {}
                    )
                      .sort((a, b) => Number(b[0]) - Number(a[0]))
                      .map(([star, count]) => {
                        const total = Object.values(
                          selectedUser?.aggregatedReviews?.ratingBreakdown || {}
                        ).reduce((a, b) => a + b, 0);
                        const pct = total
                          ? ((count / total) * 100).toFixed(1)
                          : 0;
                        return (
                          <li key={star} className={styles.starRating}>
                            <span>
                              <StarIcon color="#374957" size={1} />
                            </span>
                            <p>{star}</p>
                            <div className={styles.reviewBar}>
                              <div
                                className={styles.reviewProgress}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p>{pct}%</p>
                          </li>
                        );
                      })
                  )}
                </ul>
              </div>

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
                  <StarIcon color="#374957" size={1} />
                  <p>All</p>
                </button>
                {Array.from({ length: 5 }).map((_, idx) => (
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
                    <StarIcon color="#374957" size={1} />
                    <p>{idx + 1}</p>
                  </button>
                ))}
              </div>

              <ul className={styles.commentsBox}>
                {(() => {
                  const comments = selectedUser?.comments || [];
                  const filteredComments =
                    selectedFilter === -1
                      ? comments
                      : comments.filter(
                          (c) => Number(c?.stars || 0) === selectedFilter + 1
                        );

                  if (!filteredComments.length) {
                    return <li className={styles.empty}>No comments</li>;
                  }

                  return filteredComments.map((comment, idx) => (
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
                      <div className={styles.commentMessage}>
                        {comment?.text}
                      </div>
                    </li>
                  ));
                })()}
              </ul>
            </div>
          </div>
        ) : createAdmin ? (
          <div className={styles.createAdminContainer}>
            <div className={styles.adminCreatorPanel}>
              <div className={styles.profilePic}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.profilePicButton}
                >
                  {createAdminForm.profilePreviewUrl ? (
                    <img
                      src={createAdminForm.profilePreviewUrl}
                      alt="preview"
                      className={styles.uploadedProfilePic}
                    />
                  ) : (
                    <NullImageIcon size={5} />
                  )}
                  <div className={styles.addIcon}>
                    <Plus />
                  </div>
                </button>
                <p>Profile Image</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={onCreateAdminFile}
                />
              </div>
              <div className={styles.adminCreationInputs}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={createAdminForm.name}
                  onChange={(e) =>
                    setCreateAdminForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={createAdminForm.username}
                  onChange={(e) =>
                    setCreateAdminForm((p) => ({
                      ...p,
                      username: e.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Pass Key"
                  value={createAdminForm.passkey}
                  onChange={(e) =>
                    setCreateAdminForm((p) => ({
                      ...p,
                      passkey: e.target.value,
                    }))
                  }
                />
                <div className={styles.checkBoxesTray}>
                  <label className={styles.checkBox}>
                    <input
                      type="checkbox"
                      checked={createAdminForm.roleIsStaff}
                      onChange={(e) =>
                        setCreateAdminForm((p) => ({
                          ...p,
                          roleIsStaff: e.target.checked,
                        }))
                      }
                    />
                    <p>Staff</p>
                  </label>
                  <label className={styles.checkBox}>
                    <input
                      type="checkbox"
                      checked={!createAdminForm.roleIsStaff}
                      onChange={(e) =>
                        setCreateAdminForm((p) => ({
                          ...p,
                          roleIsStaff: !e.target.checked,
                        }))
                      }
                    />
                    <p>Admin</p>
                  </label>
                </div>

                <div className={styles.actionButtonsTray}>
                  <button
                    className={styles.addButton}
                    onClick={handleAddAdmin}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Creating..." : "Add"}
                  </button>

                  <button
                    onClick={handleCancelAdmin}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <div className={`${styles.usersList} ${styles.adminUsersList}`}>
              {filteredUsers.length === 0 ? (
                <div className={styles.empty}>No users found</div>
              ) : (
                filteredUsers
                  ?.filter((user) => user?.role !== "user")
                  .map((u) => (
                    <div
                      key={u.id}
                      className={styles.userRow}
                      onClick={() => handleSelectUser(u)}
                    >
                      <img
                        src={u.profileImage}
                        alt={u.name}
                        className={styles.userAvatar}
                        onError={(e) => onImgError(e)}
                      />
                      <div className={styles.userName}>{u?.name}</div>
                      <div className={styles.userRole}>~ {u?.role}</div>
                      <button
                        className={styles.adminDelete}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (window.confirm(`Remove admin ${u.name}?`))
                            handleDeleteUser(
                              u.id,
                              "Removed via admin UI",
                              false
                            );
                        }}
                      >
                        <ImageIcon src={TrashIcon} />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        ) : (
          <div className={styles.usersList}>
            <div className={styles.userRow}>
              <div className={styles.userAvatarTitle}>User Profile</div>
              <div className={styles.userName}>User Name</div>
              <div className={styles.userLevel}>Status</div>
              <div className={styles.userVerified}>ID Status</div>
              <div className={styles.userBusinessName}>Business Name</div>
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
                  onClick={() => handleSelectUser(u)}
                >
                  <img
                    src={u.profileImage}
                    alt={u.name}
                    className={styles.userAvatar}
                    onError={(e) => onImgError(e)}
                  />
                  <div className={styles.userName}>{u?.name}</div>
                  <div className={styles.userLevel}>
                    {u?.level} {u?.level ? "Level" : "---"}
                  </div>
                  <div className={styles.userVerified}>
                    {u?.verified ? "Verified" : "Not Verified"}
                  </div>
                  <div className={styles.userBusinessName}>
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
