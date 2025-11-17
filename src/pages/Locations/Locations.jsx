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
  // Add this debug code at the top of your component

  const [regions, setRegions] = useState(
    (initialData || []).map((region) => ({
      id: region._raw?.id,
      region: region.region,
      // ✅ SIMPLIFIED: Use the towns as they come from the API
      towns: region.towns || [],
    }))
  );

  // React.useEffect(() => {
  //   console.log(
  //     "INITIAL DATA STRUCTURE:",
  //     JSON.stringify(initialData, null, 2)
  //   );

  //   if (initialData && initialData.length > 0) {
  //     // console.log("FIRST REGION:", initialData[0]);
  //     // console.log("FIRST REGION TOWNS:", initialData[0]?.towns);
  //     console.log("Regions: ", regions);
  //   }
  // }, []);

  // ... rest of your component
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeItem, setActiveItem] = useState(null);

  const handleAddTown = async (regionId, newTownName) => {
    try {
      const res = await addTown(regionId, { name: newTownName });
      const newTown = res.data.town;

      setRegions((prev) =>
        prev.map((r) => {
          if (r.id === regionId) {
            return {
              ...r,
              towns: [...r.towns, newTown],
            };
          }
          return r;
        })
      );
    } catch (err) {
      console.error("Failed to add town:", err);
      alert("Failed to add town: " + err.message);
    }
  };

  const handleEditTown = async (regionId, townId, newName) => {
    try {
      const res = await updateTown(regionId, townId, { name: newName });
      const updatedTown = res.data.town;

      setRegions((prev) =>
        prev.map((r) =>
          r.id === regionId
            ? {
                ...r,
                towns: r.towns.map((t) =>
                  t.id === townId ? { ...t, name: updatedTown.name } : t
                ),
              }
            : r
        )
      );
    } catch (err) {
      console.error("Failed to update town:", err);
      alert("Failed to update town: " + err.message);
    }
  };

  const handleDeleteTown = async (regionId, townId) => {
    console.log("Deleting town - Region:", regionId, "Town ID:", townId);
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
      alert("Failed to delete town: " + err.message);
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

    if (active.data.current?.type === "region") {
      if (active.id !== over.id) {
        setRegions((prev) => {
          const oldIndex = prev.findIndex((r) => r.id === active.id);
          const newIndex = prev.findIndex((r) => r.id === over.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    }

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
            <TownPreview
              id={activeItem.id}
              name={activeItem.data.current.name}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

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

function SortableTown({ id, name, regionId, onEditTown, onDeleteTown }) {
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
    setValue(name);
  };

  const commitEdit = () => {
    const newVal = value.trim();
    if (newVal && newVal !== name) {
      onEditTown(regionId, id, newVal);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue(name);
    }
  };

  return (
    <li
      className={styles.townDragOverlay}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <span {...listeners} style={{ display: "grid" }}>
        <DragIcon />
      </span>

      {isEditing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          autoFocus
          onPointerDown={(e) => e.stopPropagation()}
          style={{ flex: 1 }}
        />
      ) : (
        <p style={{ flex: 1 }}>{name}</p>
      )}

      <button
        onClick={startEditing}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Edit ${name}`}
      >
        <EditIcon size={1} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteTown(regionId, id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Delete ${name}`}
      >
        <ImageIcon src={TrashIcon} size={1.3} />
      </button>
    </li>
  );
}

function TownPreview({ id, name }) {
  return (
    <li className={styles.townDragOverlay}>
      <span>
        <DragIcon />
      </span>
      <p>{name}</p>
      <div>
        <EditIcon size={1} />
      </div>
      <div>
        <ImageIcon src={TrashIcon} size={1.3} />
      </div>
    </li>
  );
}
