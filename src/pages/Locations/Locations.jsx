import React, { useState } from "react";
import styles from "./locations.module.css";
import {
  locationsData as initialData,
  getLocations,
  createRegion,
  addTown,
  updateTown,
  deleteTown,
} from "../../api/locations";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditIcon } from "../../components/SVGIcons/EditIcon";
import ImageIcon from "../../components/SVGIcons/ImageIcon";
import TrashIcon from "../../assets/TrashIcon.png";
import { PlusIcon } from "lucide-react";
import { DragIcon } from "../../components/SVGIcons/DragIcon";

export const Locations = () => {
  const [regions, setRegions] = useState(
    (initialData || []).map((region) => ({
      // Use ONLY the database ID from _raw
      id: region._raw?.id, // ← This must match what your API expects
      region: region.region,
      towns: (region.towns || []).map((t) =>
        typeof t === "string"
          ? { id: t, name: t } // Use the string as ID temporarily
          : {
              id: t.id || t.name, // Use actual DB ID
              name: t.name || String(t),
            }
      ),
    }))
  );
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeItem, setActiveItem] = useState(null);

  // Add town immutably
  const handleAddTown = async (regionId, newTownName) => {
    console.log(
      "🔍 Adding town - Region ID:",
      regionId,
      "Town Name:",
      newTownName,
      "All Regions: ",
      regions
    );

    try {
      const res = await addTown(regionId, { name: newTownName });
      console.log("🔍 API Response:", res);

      setRegions((prev) =>
        prev.map((r) => {
          if (r.id === regionId) {
            const newTown = {
              id: res.id || `temp-${Date.now()}`, // Use actual DB ID if available
              name: res.name || newTownName,
            };
            console.log("🔍 Adding town to UI:", newTown);
            return {
              ...r,
              towns: [...r.towns, newTown],
            };
          }
          return r;
        })
      );
    } catch (err) {
      console.error("❌ Failed to add town:", err);
      alert("Failed to add town: " + err.message);
    }
  };

  // Edit town immutably: replace oldTown with newTown
  const handleEditTown = async (regionId, townId, newName) => {
    try {
      await updateTown(regionId, townId, { name: newName });
      setRegions((prev) =>
        prev.map((r) =>
          r.id === regionId
            ? {
                ...r,
                towns: r.towns.map((t) =>
                  t.id === townId ? { ...t, name: newName } : t
                ),
              }
            : r
        )
      );
    } catch (err) {
      console.error("Failed to update town:", err);
    }
  };

  const handleDeleteTown = async (regionId, townId) => {
    try {
      await deleteTown(regionId, townId);
      setRegions((prev) =>
        prev.map((r) =>
          r.id === regionId
            ? { ...r, towns: r.towns.filter((t) => t.id !== townId) }
            : r
        )
      );
    } catch (err) {
      console.error("Failed to delete town:", err);
    }
  };

  function handleDragStart(event) {
    setActiveItem(event.active);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) {
      setActiveItem(null);
      return;
    }

    // --- Region reorder
    if (active.data.current?.type === "region") {
      if (active.id !== over.id) {
        setRegions((prev) => {
          const oldIndex = prev.findIndex((r) => r.id === active.id);
          const newIndex = prev.findIndex((r) => r.id === over.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    }

    // --- Town reorder (within same region only)
    if (active.data.current?.type === "town") {
      const regionId = active.data.current.regionId;
      const overRegionId = over.data.current?.regionId ?? regionId;
      if (regionId === overRegionId) {
        setRegions((prev) =>
          prev.map((region) => {
            if (region.id !== regionId) return region;
            const oldIndex = region.towns.findIndex((t) => t.id === active.id);
            const newIndex = region.towns.findIndex((t) => t.id === over.id);

            return {
              ...region,
              towns: arrayMove(region.towns, oldIndex, newIndex),
            };
          })
        );
      }
    }

    setActiveItem(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={regions.map((r) => r.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className={styles.locationsContainer}>
          {regions.map((region, idx) => (
            <SortableRegion
              key={region.id}
              regionData={region}
              idx={idx}
              onAddTown={handleAddTown}
              onEditTown={handleEditTown}
              onDeleteTown={handleDeleteTown}
              activeItem={activeItem}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem?.data?.current?.type === "region" && (
          <div className={`${styles.location} ${styles.dragOverlay}`}>
            <RegionPreview
              region={regions.find((r) => r.id === activeItem.id)}
            />
          </div>
        )}
        {activeItem?.data?.current?.type === "town" && (
          <div className={`${styles.townDragOverlay} ${styles.dragOverlay}`}>
            {console.log(
              "Active Item in Overlay:",
              activeItem.data.current?.name
            )}
            <TownPreview
              id={activeItem.id}
              regionName={activeItem?.data?.current?.name}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

/* -------------------- Sortable Region wrapper -------------------- */
function SortableRegion({
  regionData,
  idx,
  onAddTown,
  onEditTown,
  onDeleteTown,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: regionData.id,
    data: { type: "region", regionId: regionData.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RegionPreview
        region={regionData}
        idx={idx}
        onAddTown={onAddTown}
        onEditTown={onEditTown}
        onDeleteTown={onDeleteTown}
      />
    </div>
  );
}

/* -------------------- Region Preview -------------------- */
function RegionPreview({ region, idx, onAddTown, onEditTown, onDeleteTown }) {
  const [townInput, setTownInput] = useState("");

  const handleAddTown = () => {
    const value = townInput.trim();
    if (!value) return;
    onAddTown(region.id, value);
    setTownInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddTown();
  };

  return (
    <div className={styles.location}>
      <div className={styles.locationHeader}>
        <div className={styles.number}>{idx + 1 || <DragIcon />}</div>
        <div className={styles.region}>{region.region}</div>
      </div>

      <SortableContext
        items={region.towns.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className={styles.townList}>
          {region.towns.map((town) => (
            <SortableTown
              key={town.id}
              id={town.id}
              regionId={region.id}
              name={town.name}
              onEditTown={onEditTown}
              onDeleteTown={onDeleteTown}
            />
          ))}
        </ul>
      </SortableContext>

      <div className={styles.addSection}>
        <input
          type="text"
          placeholder="Type new area"
          value={townInput}
          onChange={(e) => setTownInput(e.target.value)}
          onKeyDown={handleKeyDown}
          // ensure pointer events don't bubble to drag (defensive)
          onPointerDown={(e) => e.stopPropagation()}
        />
        <button
          onClick={handleAddTown}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <PlusIcon size={16} />
        </button>
      </div>
    </div>
  );
}

/* -------------------- Town (sortable item) -------------------- */
/* Note: listeners moved to handle span so clicks in inputs/buttons won't start drag */
function SortableTown({
  id,
  name,
  regionId,
  regionName,
  onEditTown,
  onDeleteTown,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "town", regionId, name },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(name);

  React.useEffect(() => setValue(name), [name]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const startEditing = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setValue(id);
  };

  const commitEdit = () => {
    const newVal = value.trim();
    if (newVal && newVal !== id) {
      onEditTown(regionId, id, newVal);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue(id);
    }
  };

  return (
    <li
      className={styles.townDragOverlay}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      {/* Drag handle: attach listeners here so only this span starts drag */}
      <span {...listeners} style={{ display: "grid" }}>
        <DragIcon />
      </span>

      {/* editable label */}
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          autoFocus
          // prevent pointer events bubbling to dnd-kit (defensive)
          onPointerDown={(e) => e.stopPropagation()}
          style={{ flex: 1 }}
        />
      ) : (
        <p style={{ flex: 1 }}>{name}</p>
      )}

      {/* edit button */}
      <button
        onClick={startEditing}
        onPointerDown={(e) => e.stopPropagation()} // prevent accregionNameental drag start
        aria-label={`Edit ${regionName}`}
      >
        <EditIcon size={1} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteTown(regionId, id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Delete ${regionName}`}
      >
        <ImageIcon src={TrashIcon} size={1.3} />
      </button>
    </li>
  );
}

/* -------------------- Town preview for overlay -------------------- */
function TownPreview({ id, regionName }) {
  return (
    <li className={styles.townDragOverlay}>
      <span>
        <DragIcon />
      </span>
      <p>{regionName}</p>
      <div>
        <EditIcon size={1} />
      </div>
      <div>
        <ImageIcon src={TrashIcon} size={1.3} />
      </div>
    </li>
  );
}
