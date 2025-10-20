import React, { useState } from "react";
import styles from "./locations.module.css";
import { locationsData as initialData } from "../../api/locations";
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
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { DragIcon } from "../../components/SVGIcons/DragIcon";

export const Locations = () => {
  const [regions, setRegions] = useState(initialData);
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeItem, setActiveItem] = useState(null);

  // Add town immutably
  const handleAddTown = (regionName, newTown) => {
    setRegions((prev) =>
      prev.map((r) =>
        r.region === regionName ? { ...r, towns: [...r.towns, newTown] } : r
      )
    );
  };

  // Edit town immutably: replace oldTown with newTown
  const handleEditTown = (regionName, oldTown, newTown) => {
    setRegions((prev) =>
      prev.map((r) =>
        r.region === regionName
          ? { ...r, towns: r.towns.map((t) => (t === oldTown ? newTown : t)) }
          : r
      )
    );
  };

  const handleDeleteTown = (regionName, townToDelete) => {
    setRegions((prev) =>
      prev.map((r) =>
        r.region === regionName
          ? { ...r, towns: r.towns.filter((t) => t !== townToDelete) }
          : r
      )
    );
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
          const oldIndex = prev.findIndex((r) => r.region === active.id);
          const newIndex = prev.findIndex((r) => r.region === over.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    }

    // --- Town reorder (within same region only)
    if (active.data.current?.type === "town") {
      const regionName = active.data.current.region;
      const overRegionName = over.data.current?.region || regionName;

      if (regionName === overRegionName) {
        setRegions((prev) =>
          prev.map((region) => {
            if (region.region !== regionName) return region;
            const oldIndex = region.towns.indexOf(active.id);
            const newIndex = region.towns.indexOf(over.id);
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
        items={regions.map((r) => r.region)}
        strategy={horizontalListSortingStrategy}
      >
        <div className={styles.locationsContainer}>
          {regions.map((region, idx) => (
            <SortableRegion
              key={region.region}
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
              region={regions.find((r) => r.region === activeItem.id)}
            />
          </div>
        )}
        {activeItem?.data?.current?.type === "town" && (
          <div className={`${styles.townDragOverlay} ${styles.dragOverlay}`}>
            <TownPreview id={activeItem.id} />
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
    id: regionData.region,
    data: { type: "region" },
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
    onAddTown(region.region, value);
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
        items={region.towns}
        strategy={verticalListSortingStrategy}
      >
        <ul className={styles.townList}>
          {region.towns.map((town) => (
            <SortableTown
              key={town}
              id={town}
              regionName={region.region}
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
function SortableTown({ id, regionName, onEditTown, onDeleteTown }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "town", region: regionName },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(id);

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
      onEditTown(regionName, id, newVal);
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
      {...attributes} /* keep attributes on li for roles / aria */
      // DO NOT spread listeners here — handle only on drag icon
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
        <p style={{ flex: 1 }}>{id}</p>
      )}

      {/* edit button */}
      <button
        onClick={startEditing}
        onPointerDown={(e) => e.stopPropagation()} // prevent accidental drag start
        aria-label={`Edit ${id}`}
      >
        <EditIcon size={16} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteTown(regionName, id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Delete ${id}`}
      >
        <TrashIcon size={16} />
      </button>
    </li>
  );
}

/* -------------------- Town preview for overlay -------------------- */
function TownPreview({ id }) {
  return (
    <li className={styles.townDragOverlay}>
      <span>
        <DragIcon />
      </span>
      <p>{id}</p>
      <div>
        <EditIcon size={16} />
      </div>
      <div>
        <TrashIcon size={16} />
      </div>
    </li>
  );
}
