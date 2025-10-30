import React, { useState, useMemo, useEffect } from "react";
import styles from "./categories.module.css";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { categories as initialData } from "../../api/categories";
import { DragIcon } from "../../components/SVGIcons/DragIcon";
import { EditIcon } from "../../components/SVGIcons/EditIcon";
import ImageIcon from "../../components/SVGIcons/ImageIcon";
import TrashIcon from "../../assets/TrashIcon.png";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Caret } from "../../components/SVGIcons/Caret";

/* ------------------ Helpers ------------------ */
const sluggify = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const makeId = (type, slug) => `${type}--${slug}`;

/** stable option id generator — include timestamp for uniqueness when adding */
const makeOptionId = (catSlug, subSlug, paramSlug, value) =>
  `option--${[
    catSlug,
    subSlug,
    paramSlug,
    sluggify(String(value)),
    Date.now(),
  ].join("::")}`;

/* ------------------ Sortable item (generic) ------------------ */
/* listeners attached only to handle so buttons/inputs won't start drag */
function SortableListItem({
  id,
  type,
  parentSlug,
  children,
  onEdit,
  onDelete,
  active,
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
    data: { type, parent: parentSlug },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    touchAction: "manipulation",
    userSelect: "none",
  };

  return (
    <div
      className={active ? styles.activeItem : styles.itemItem}
      ref={setNodeRef}
      style={style}
      {...attributes} /* keep ARIA attributes on the item */
    >
      {/* drag handle - listeners here only */}
      <span {...listeners} style={{ display: "grid" }}>
        <DragIcon />
      </span>

      {/* content area (children passed by caller) */}
      <div style={{ flex: 1, paddingInline: "0.75rem" }}>{children}</div>

      <div className={styles.buttonBox}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Edit"
          type="button"
        >
          <EditIcon size={1} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Delete"
          type="button"
        >
          <ImageIcon src={TrashIcon} size={1.3} />
        </button>
      </div>
    </div>
  );
}

/* ------------------ Main component ------------------ */
export const Categories = () => {
  // clone initial data into state (deep-ish copy) and normalize option shapes
  const [categories, setCategories] = useState(() =>
    (initialData || []).map((c) => ({
      category: c.category,
      slug: c.slug || sluggify(c.category),
      subCategories: (c.subCategories || []).map((sc) => ({
        name: sc.name,
        slug: sc.slug || sluggify(sc.name),
        parameters: (sc.parameters || []).map((p) => ({
          name: p.name,
          slug: p.slug || sluggify(p.name),
          // convert raw option strings into objects with stable id + value
          options: (p.options || []).map((opt, optIdx) => ({
            id:
              (opt &&
                makeOptionId(
                  c.slug || sluggify(c.category),
                  sc.slug || sluggify(sc.name),
                  p.slug || sluggify(p.name),
                  opt
                )) ||
              `option--${optIdx}::${Date.now()}`,
            value: opt,
          })),
        })),
      })),
    }))
  );

  // selected values are STABLE identifiers (slugs / ids) — not indices
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(null);
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState(null);
  const [selectedParameterSlug, setSelectedParameterSlug] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  // modal toggles & modal search inputs
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openSubCategoryModal, setOpenSubCategoryModal] = useState(false);
  const [openParameterModal, setOpenParameterModal] = useState(false);
  const [modalSearchCategory, setModalSearchCategory] = useState("");
  const [modalSearchSubCategory, setModalSearchSubCategory] = useState("");
  const [modalSearchParameter, setModalSearchParameter] = useState("");

  // input controlled values for adding
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [newParameterName, setNewParameterName] = useState("");
  const [newOptionName, setNewOptionName] = useState("");

  // header global search
  const [globalSearch, setGlobalSearch] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  /* ---------- Effects: set defaults after categories init/change ---------- */
  useEffect(() => {
    if (!categories || categories.length === 0) {
      setSelectedCategorySlug(null);
      return;
    }
    // set a default selected category if none
    if (!selectedCategorySlug) {
      const firstCat = categories[0];
      setSelectedCategorySlug(firstCat.slug);
      // set sub / param defaults too
      const firstSub = firstCat.subCategories?.[0];
      if (firstSub) {
        setSelectedSubCategorySlug(firstSub.slug);
        const firstParam = firstSub.parameters?.[0];
        if (firstParam) setSelectedParameterSlug(firstParam.slug);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // when category changes, ensure sub/param selection stays valid
  useEffect(() => {
    const catIdx = categories.findIndex((c) => c.slug === selectedCategorySlug);
    if (catIdx === -1) {
      // fallback to first category if slug invalid
      if (categories.length > 0) {
        setSelectedCategorySlug(categories[0].slug);
      }
      return;
    }
    const subs = categories[catIdx].subCategories || [];
    if (!selectedSubCategorySlug && subs.length) {
      setSelectedSubCategorySlug(subs[0].slug);
    } else if (selectedSubCategorySlug) {
      const subExists = subs.some((s) => s.slug === selectedSubCategorySlug);
      if (!subExists) setSelectedSubCategorySlug(subs[0]?.slug ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategorySlug, categories]);

  // when subcategory changes, ensure parameter selection stays valid
  useEffect(() => {
    const catIdx = categories.findIndex((c) => c.slug === selectedCategorySlug);
    if (catIdx === -1) return;
    const subs = categories[catIdx].subCategories || [];
    const subIdx = subs.findIndex((s) => s.slug === selectedSubCategorySlug);
    if (subIdx === -1) {
      if (subs.length) setSelectedSubCategorySlug(subs[0].slug);
      return;
    }
    const params = subs[subIdx].parameters || [];
    if (!selectedParameterSlug && params.length) {
      setSelectedParameterSlug(params[0].slug);
    } else if (selectedParameterSlug) {
      const pExists = params.some((p) => p.slug === selectedParameterSlug);
      if (!pExists) setSelectedParameterSlug(params[0]?.slug ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubCategorySlug, selectedCategorySlug, categories]);

  /* ------------- Utility setters ------------- */
  const clampIndex = (i, arr) => Math.max(0, Math.min(i, arr.length - 1));

  const addCategory = (name) => {
    const slug = sluggify(name);
    setCategories((prev) => [
      ...prev,
      { category: name, slug, subCategories: [] },
    ]);
    setNewCategoryName("");
    setSelectedCategorySlug(slug);
    setSelectedSubCategorySlug(null);
    setSelectedParameterSlug(null);
    setSelectedOptionId(null);
  };

  const addSubCategory = (categorySlug, name) => {
    if (!categorySlug) return;
    const slug = sluggify(name);
    setCategories((prev) =>
      prev.map((c) =>
        c.slug === categorySlug
          ? {
              ...c,
              subCategories: [
                ...(c.subCategories || []),
                { name, slug, parameters: [] },
              ],
            }
          : c
      )
    );
    setNewSubCategoryName("");
    setSelectedSubCategorySlug(slug);
    setSelectedParameterSlug(null);
    setSelectedOptionId(null);
  };

  const addParameter = (categorySlug, subSlug, name) => {
    if (!categorySlug || !subSlug) return;
    const slug = sluggify(name);
    setCategories((prev) =>
      prev.map((c) =>
        c.slug === categorySlug
          ? {
              ...c,
              subCategories: c.subCategories.map((s) =>
                s.slug === subSlug
                  ? {
                      ...s,
                      parameters: [
                        ...(s.parameters || []),
                        { name, slug, options: [] },
                      ],
                    }
                  : s
              ),
            }
          : c
      )
    );
    setNewParameterName("");
    setSelectedParameterSlug(slug);
    setSelectedOptionId(null);
  };

  const addOption = (categorySlug, subSlug, paramSlug, name) => {
    if (!categorySlug || !subSlug || !paramSlug) return;
    const id = makeOptionId(categorySlug, subSlug, paramSlug, name);
    setCategories((prev) =>
      prev.map((c) =>
        c.slug === categorySlug
          ? {
              ...c,
              subCategories: c.subCategories.map((s) =>
                s.slug === subSlug
                  ? {
                      ...s,
                      parameters: s.parameters.map((p) =>
                        p.slug === paramSlug
                          ? {
                              ...p,
                              options: [
                                ...(p.options || []),
                                { id, value: name },
                              ],
                            }
                          : p
                      ),
                    }
                  : s
              ),
            }
          : c
      )
    );
    setNewOptionName("");
    setSelectedOptionId(id);
  };

  /* ------------- Edit / Delete (index-based functions still work — find indices inside) ------------- */
  const editCategory = (idx) => {
    const current = categories[idx]?.category;
    const next = window.prompt("Edit category", current);
    if (!next) return;
    const slug = sluggify(next);
    setCategories((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, category: next, slug } : c))
    );
    setSelectedCategorySlug(slug);
  };

  const deleteCategory = (idx) => {
    if (!window.confirm("Delete category?")) return;
    setCategories((prev) => {
      const copy = prev.slice();
      copy.splice(idx, 1);
      return copy;
    });
    // pick a new selected category slug if needed
    setSelectedCategorySlug((prev) => {
      if (!categories || categories.length <= 1) return null;
      const next = categories.slice(0, -1)[0];
      return next?.slug ?? null;
    });
  };

  const editSubCategory = (catIdx, subIdx) => {
    const curr = categories[catIdx]?.subCategories?.[subIdx]?.name;
    const next = window.prompt("Edit sub-category", curr);
    if (!next) return;
    const slug = sluggify(next);
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              subCategories: c.subCategories.map((s, j) =>
                j === subIdx ? { ...s, name: next, slug } : s
              ),
            }
          : c
      )
    );
    setSelectedSubCategorySlug(slug);
  };

  const deleteSubCategory = (catIdx, subIdx) => {
    if (!window.confirm("Delete sub-category?")) return;
    const catSlug = categories[catIdx]?.slug;
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              subCategories: c.subCategories.filter((_, j) => j !== subIdx),
            }
          : c
      )
    );
    // adjust selection
    setSelectedSubCategorySlug((prev) => {
      const remaining = categories[catIdx]?.subCategories || [];
      if (remaining.length === 0) return null;
      return remaining[0]?.slug;
    });
  };

  const editParameter = (catIdx, subIdx, paramIdx) => {
    const curr =
      categories[catIdx]?.subCategories?.[subIdx]?.parameters?.[paramIdx]?.name;
    const next = window.prompt("Edit parameter", curr);
    if (!next) return;
    const slug = sluggify(next);
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              subCategories: c.subCategories.map((s, j) =>
                j === subIdx
                  ? {
                      ...s,
                      parameters: s.parameters.map((p, k) =>
                        k === paramIdx ? { ...p, name: next, slug } : p
                      ),
                    }
                  : s
              ),
            }
          : c
      )
    );
    setSelectedParameterSlug(slug);
  };

  const deleteParameter = (catIdx, subIdx, paramIdx) => {
    if (!window.confirm("Delete parameter?")) return;
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              subCategories: c.subCategories.map((s, j) =>
                j === subIdx
                  ? {
                      ...s,
                      parameters: s.parameters.filter((_, k) => k !== paramIdx),
                    }
                  : s
              ),
            }
          : c
      )
    );
    setSelectedParameterSlug((prev) => {
      const params =
        categories[catIdx]?.subCategories?.[subIdx]?.parameters || [];
      return params[0]?.slug ?? null;
    });
  };

  const editOption = (catIdx, subIdx, paramIdx, optionId) => {
    const curr = categories[catIdx]?.subCategories?.[subIdx]?.parameters?.[
      paramIdx
    ]?.options?.find((o) => o.id === optionId)?.value;
    const next = window.prompt("Edit option", curr);
    if (!next) return;
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              subCategories: c.subCategories.map((s, j) =>
                j === subIdx
                  ? {
                      ...s,
                      parameters: s.parameters.map((p, k) =>
                        k === paramIdx
                          ? {
                              ...p,
                              options: p.options.map((o) =>
                                o.id === optionId ? { ...o, value: next } : o
                              ),
                            }
                          : p
                      ),
                    }
                  : s
              ),
            }
          : c
      )
    );
  };

  const deleteOption = (catIdx, subIdx, paramIdx, optionId) => {
    if (!window.confirm("Delete option?")) return;
    setCategories((prev) =>
      prev.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              subCategories: c.subCategories.map((s, j) =>
                j === subIdx
                  ? {
                      ...s,
                      parameters: s.parameters.map((p, k) =>
                        k === paramIdx
                          ? {
                              ...p,
                              options: p.options.filter(
                                (o) => o.id !== optionId
                              ),
                            }
                          : p
                      ),
                    }
                  : s
              ),
            }
          : c
      )
    );
    setSelectedOptionId((prev) => (prev === optionId ? null : prev));
  };

  /* ------------- Drag handling ------------- */
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // We only allow reorder within the same type (column)
    if (activeType !== overType) return;

    if (activeType === "category") {
      // reorder categories
      const activeSlug = active.id.split("--")[1];
      const overSlug = over.id.split("--")[1];
      setCategories((prev) => {
        const oldIndex = prev.findIndex((p) => p.slug === activeSlug);
        const newIndex = prev.findIndex((p) => p.slug === overSlug);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }

    if (activeType === "sub") {
      const parentSlug = active.data.current.parent;
      const catIndex = categories.findIndex((c) => c.slug === parentSlug);
      if (catIndex === -1) return;
      const list = categories[catIndex].subCategories || [];
      const a = active.id.split("--")[1];
      const b = over.id.split("--")[1];
      setCategories((prev) =>
        prev.map((c, i) =>
          i === catIndex
            ? {
                ...c,
                subCategories: arrayMove(
                  c.subCategories,
                  c.subCategories.findIndex((x) => x.slug === a),
                  c.subCategories.findIndex((x) => x.slug === b)
                ),
              }
            : c
        )
      );
    }

    if (activeType === "param") {
      const parentSlug = active.data.current.parent; // encodes catSlug|subSlug -> we pass sub parent as `${catSlug}::${subSlug}`
      const [catSlug, subSlug] = parentSlug.split("::");
      const catIndex = categories.findIndex((c) => c.slug === catSlug);
      if (catIndex === -1) return;
      const subIndex = categories[catIndex].subCategories.findIndex(
        (s) => s.slug === subSlug
      );
      if (subIndex === -1) return;
      const a = active.id.split("--")[1];
      const b = over.id.split("--")[1];
      setCategories((prev) =>
        prev.map((c, i) =>
          i === catIndex
            ? {
                ...c,
                subCategories: c.subCategories.map((s, j) =>
                  j === subIndex
                    ? {
                        ...s,
                        parameters: arrayMove(
                          s.parameters,
                          s.parameters.findIndex((x) => x.slug === a),
                          s.parameters.findIndex((x) => x.slug === b)
                        ),
                      }
                    : s
                ),
              }
            : c
        )
      );
    }

    if (activeType === "option") {
      // parentSlug: `${catSlug}::${subSlug}::${paramSlug}`
      const parentSlug = active.data.current.parent;
      const [catSlug, subSlug, paramSlug] = parentSlug.split("::");
      const catIndex = categories.findIndex((c) => c.slug === catSlug);
      if (catIndex === -1) return;
      const subIndex = categories[catIndex].subCategories.findIndex(
        (s) => s.slug === subSlug
      );
      if (subIndex === -1) return;
      const paramIndex = categories[catIndex].subCategories[
        subIndex
      ].parameters.findIndex((p) => p.slug === paramSlug);
      if (paramIndex === -1) return;

      const opts =
        categories[catIndex].subCategories[subIndex].parameters[paramIndex]
          .options;
      const oldIdx = opts.findIndex((o) => o.id === active.id);
      const newIdx = opts.findIndex((o) => o.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;

      setCategories((prev) =>
        prev.map((c, i) =>
          i === catIndex
            ? {
                ...c,
                subCategories: c.subCategories.map((s, j) =>
                  j === subIndex
                    ? {
                        ...s,
                        parameters: s.parameters.map((p, k) =>
                          k === paramIndex
                            ? {
                                ...p,
                                options: arrayMove(p.options, oldIdx, newIdx),
                              }
                            : p
                        ),
                      }
                    : s
                ),
              }
            : c
        )
      );
    }
  }

  /* ------------- Global search - finds first match and focuses it ------------- */
  const doGlobalSearch = (term) => {
    setGlobalSearch(term);
    if (!term) return;
    const q = term.toLowerCase();

    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      if (c.category.toLowerCase().includes(q) || c.slug.includes(q)) {
        setSelectedCategorySlug(c.slug);
        setSelectedSubCategorySlug(c.subCategories?.[0]?.slug ?? null);
        setSelectedParameterSlug(
          c.subCategories?.[0]?.parameters?.[0]?.slug ?? null
        );
        setSelectedOptionId(null);
        return;
      }
      for (let j = 0; j < (c.subCategories || []).length; j++) {
        const s = c.subCategories[j];
        if (s.name.toLowerCase().includes(q) || s.slug.includes(q)) {
          setSelectedCategorySlug(c.slug);
          setSelectedSubCategorySlug(s.slug);
          setSelectedParameterSlug(s.parameters?.[0]?.slug ?? null);
          setSelectedOptionId(null);
          return;
        }
        for (let k = 0; k < (s.parameters || []).length; k++) {
          const p = s.parameters[k];
          if (p.name.toLowerCase().includes(q) || p.slug.includes(q)) {
            setSelectedCategorySlug(c.slug);
            setSelectedSubCategorySlug(s.slug);
            setSelectedParameterSlug(p.slug);
            setSelectedOptionId(null);
            return;
          }
          for (let z = 0; z < (p.options || []).length; z++) {
            const o = p.options[z];
            if (String(o.value).toLowerCase().includes(q)) {
              setSelectedCategorySlug(c.slug);
              setSelectedSubCategorySlug(s.slug);
              setSelectedParameterSlug(p.slug);
              setSelectedOptionId(o.id);
              return;
            }
          }
        }
      }
    }
  };

  /* ------------- Derived lists for rendering (indices computed from slugs) ------------- */
  const selectedCategoryIndex = useMemo(
    () => categories.findIndex((c) => c.slug === selectedCategorySlug),
    [categories, selectedCategorySlug]
  );

  const selectedSubCategoryIndex = useMemo(() => {
    if (selectedCategoryIndex === -1) return -1;
    const subs = categories[selectedCategoryIndex]?.subCategories || [];
    return subs.findIndex((s) => s.slug === selectedSubCategorySlug);
  }, [categories, selectedCategoryIndex, selectedSubCategorySlug]);

  const selectedParameterIndex = useMemo(() => {
    if (selectedCategoryIndex === -1 || selectedSubCategoryIndex === -1)
      return -1;
    const params =
      categories[selectedCategoryIndex]?.subCategories[selectedSubCategoryIndex]
        ?.parameters || [];
    return params.findIndex((p) => p.slug === selectedParameterSlug);
  }, [
    categories,
    selectedCategoryIndex,
    selectedSubCategoryIndex,
    selectedParameterSlug,
  ]);

  const selectedCatObj =
    categories[selectedCategoryIndex] || categories[0] || null;
  const selectedSubObj =
    selectedCatObj?.subCategories?.[selectedSubCategoryIndex] || null;
  const selectedParamObj =
    selectedSubObj?.parameters?.[selectedParameterIndex] || null;

  /* ------------- Render ------------- */
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.categoryContainer}>
        <div className={styles.categoryHeader}>
          <div className={styles.searchBox}>
            <SearchIcon />
            <input
              type="search"
              placeholder="Search"
              value={globalSearch}
              onChange={(e) => doGlobalSearch(e.target.value)}
            />
          </div>
          <span>You can hold and drag to rearrange </span>
        </div>

        <div className={styles.categoryColumns}>
          {/* ---------------- Categories column ---------------- */}
          <div className={styles.column}>
            <div className={styles.itemHeader}>Categories</div>
            <div className={styles.items}>
              <SortableContext
                items={categories.map((c) => makeId("category", c.slug))}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((category, idx) => {
                  const id = makeId("category", category.slug);
                  const active = category.slug === selectedCategorySlug;
                  return (
                    <SortableListItem
                      key={id}
                      id={id}
                      type="category"
                      parentSlug={null}
                      onEdit={() => editCategory(idx)}
                      onDelete={() => deleteCategory(idx)}
                      active={active}
                    >
                      <div
                        role="button"
                        onClick={() => {
                          setSelectedCategorySlug(category.slug);
                          // set defaults for sub/param
                          const firstSub = category.subCategories?.[0];
                          setSelectedSubCategorySlug(firstSub?.slug ?? null);
                          const firstParam = firstSub?.parameters?.[0];
                          setSelectedParameterSlug(firstParam?.slug ?? null);
                          setSelectedOptionId(null);
                        }}
                      >
                        <p>{category.category}</p>
                      </div>
                    </SortableListItem>
                  );
                })}
              </SortableContext>
            </div>
          </div>

          {/* ---------------- Sub-categories column ---------------- */}
          <div className={styles.column}>
            <div className={styles.itemHeader}>Sub-Categories</div>
            <div className={styles.items}>
              <SortableContext
                items={(selectedCatObj?.subCategories || []).map((s) =>
                  makeId("sub", s.slug)
                )}
                strategy={verticalListSortingStrategy}
              >
                {(selectedCatObj?.subCategories || []).map(
                  (subCategory, idx) => {
                    const id = makeId("sub", subCategory.slug);
                    const active = subCategory.slug === selectedSubCategorySlug;
                    return (
                      <SortableListItem
                        key={id}
                        id={id}
                        type="sub"
                        parentSlug={selectedCatObj?.slug}
                        onEdit={() =>
                          editSubCategory(selectedCategoryIndex, idx)
                        }
                        onDelete={() =>
                          deleteSubCategory(selectedCategoryIndex, idx)
                        }
                        active={active}
                      >
                        <div
                          role="button"
                          onClick={() => {
                            setSelectedSubCategorySlug(subCategory.slug);
                            const firstParam = subCategory.parameters?.[0];
                            setSelectedParameterSlug(firstParam?.slug ?? null);
                            setSelectedOptionId(null);
                          }}
                        >
                          <p>{subCategory.name}</p>
                        </div>
                      </SortableListItem>
                    );
                  }
                )}
              </SortableContext>
            </div>
          </div>

          {/* ---------------- Parameters column ---------------- */}
          <div className={styles.column}>
            <div className={styles.itemHeader}>Parameters</div>
            <div className={styles.items}>
              <SortableContext
                items={(selectedSubObj?.parameters || []).map((p) =>
                  makeId("param", p.slug)
                )}
                strategy={verticalListSortingStrategy}
              >
                {(selectedSubObj?.parameters || []).map((parameter, idx) => {
                  const id = makeId("param", parameter.slug);
                  const active = parameter.slug === selectedParameterSlug;
                  // parent slug encode cat::sub so reorder knows the parent
                  return (
                    <SortableListItem
                      key={id}
                      id={id}
                      type="param"
                      parentSlug={`${selectedCatObj?.slug}::${selectedSubObj?.slug}`}
                      onEdit={() =>
                        editParameter(
                          selectedCategoryIndex,
                          selectedSubCategoryIndex,
                          idx
                        )
                      }
                      onDelete={() =>
                        deleteParameter(
                          selectedCategoryIndex,
                          selectedSubCategoryIndex,
                          idx
                        )
                      }
                      active={active}
                    >
                      <div
                        role="button"
                        onClick={() => {
                          setSelectedParameterSlug(parameter.slug);
                          setSelectedOptionId(null);
                        }}
                      >
                        <p>{parameter.name}</p>
                      </div>
                    </SortableListItem>
                  );
                })}
              </SortableContext>
            </div>
          </div>

          {/* ---------------- Options column ---------------- */}
          <div className={styles.column}>
            <div className={styles.itemHeader}>Options</div>
            <div className={styles.items}>
              <SortableContext
                items={(selectedParamObj?.options || []).map((o) => o.id)}
                strategy={verticalListSortingStrategy}
              >
                {(selectedParamObj?.options || []).map((option, idx) => {
                  const id = option.id; // stable id
                  const active = option.id === selectedOptionId;
                  return (
                    <SortableListItem
                      key={id}
                      id={id}
                      type="option"
                      parentSlug={`${selectedCatObj?.slug}::${selectedSubObj?.slug}::${selectedParamObj?.slug}`}
                      onEdit={() =>
                        editOption(
                          selectedCategoryIndex,
                          selectedSubCategoryIndex,
                          selectedParameterIndex,
                          id
                        )
                      }
                      onDelete={() =>
                        deleteOption(
                          selectedCategoryIndex,
                          selectedSubCategoryIndex,
                          selectedParameterIndex,
                          id
                        )
                      }
                      active={active}
                    >
                      <div
                        role="button"
                        onClick={() => setSelectedOptionId(id)}
                      >
                        <p>{option.value}</p>
                      </div>
                    </SortableListItem>
                  );
                })}
              </SortableContext>
            </div>
          </div>
        </div>

        {/* ---------------- Inputs / Modals area ---------------- */}
        <div className={styles.categoryInputs}>
          <div className={styles.inputColumn}>
            <input
              className={styles.input}
              type="text"
              placeholder="Type Category"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button
              className={styles.saveButton}
              onClick={() => {
                if (!newCategoryName.trim()) return;
                addCategory(newCategoryName.trim());
              }}
              type="button"
            >
              Save
            </button>
          </div>

          <div className={styles.inputColumn}>
            <div className={styles.dropdownButton}>
              <p>{selectedCatObj?.category || "Category"}</p>
              <button
                type="button"
                onClick={() => setOpenCategoryModal((p) => !p)}
              >
                <span style={{ display: "inline-block" }}>
                  <Caret />
                </span>
              </button>
            </div>

            {openCategoryModal && (
              <div className={styles.dropdownModal}>
                <p>Category</p>
                <div className={styles.modalSearchBox}>
                  <SearchIcon />
                  <input
                    type="search"
                    placeholder="Search"
                    value={modalSearchCategory}
                    onChange={(e) => setModalSearchCategory(e.target.value)}
                  />
                </div>
                <ul>
                  {categories
                    .filter(
                      (c) =>
                        !modalSearchCategory ||
                        c.category
                          .toLowerCase()
                          .includes(modalSearchCategory.toLowerCase())
                    )
                    .map((category) => (
                      <li
                        key={category.slug}
                        onClick={() => {
                          setSelectedCategorySlug(category.slug);
                          setOpenCategoryModal(false);
                        }}
                      >
                        {category.category}
                      </li>
                    ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setOpenCategoryModal(false)}
                >
                  Select
                </button>
              </div>
            )}

            <input
              className={styles.input}
              type="text"
              placeholder="Type Sub-category"
              value={newSubCategoryName}
              onChange={(e) => setNewSubCategoryName(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button
              className={styles.saveButton}
              onClick={() => {
                if (!newSubCategoryName.trim()) return;
                addSubCategory(selectedCategorySlug, newSubCategoryName.trim());
              }}
              type="button"
            >
              Save
            </button>
          </div>

          <div className={styles.inputColumn}>
            <div className={styles.dropdownButton}>
              <p>{selectedSubObj?.name || "Sub-category"}</p>
              <button
                type="button"
                onClick={() => setOpenSubCategoryModal((p) => !p)}
              >
                <Caret />
              </button>
            </div>

            {openSubCategoryModal && (
              <div className={styles.dropdownModal}>
                <p>Sub-category</p>
                <div className={styles.modalSearchBox}>
                  <SearchIcon />
                  <input
                    type="search"
                    placeholder="Search"
                    value={modalSearchSubCategory}
                    onChange={(e) => setModalSearchSubCategory(e.target.value)}
                  />
                </div>
                <ul>
                  {(selectedCatObj?.subCategories || [])
                    .filter(
                      (s) =>
                        !modalSearchSubCategory ||
                        s.name
                          .toLowerCase()
                          .includes(modalSearchSubCategory.toLowerCase())
                    )
                    .map((subCategory) => (
                      <li
                        key={subCategory.slug}
                        onClick={() => {
                          setSelectedSubCategorySlug(subCategory.slug);
                          setOpenSubCategoryModal(false);
                        }}
                      >
                        {subCategory.name}
                      </li>
                    ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setOpenSubCategoryModal(false)}
                >
                  Select
                </button>
              </div>
            )}

            <input
              className={styles.input}
              type="text"
              placeholder="Type Parameter"
              value={newParameterName}
              onChange={(e) => setNewParameterName(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button
              className={styles.saveButton}
              onClick={() => {
                if (!newParameterName.trim()) return;
                addParameter(
                  selectedCategorySlug,
                  selectedSubCategorySlug,
                  newParameterName.trim()
                );
              }}
              type="button"
            >
              Save
            </button>
          </div>

          <div className={styles.inputColumn}>
            <div className={styles.dropdownButton}>
              <p>{selectedParamObj?.name || "Parameter"}</p>
              <button
                type="button"
                onClick={() => setOpenParameterModal((p) => !p)}
              >
                <Caret />
              </button>
            </div>

            {openParameterModal && (
              <div className={styles.dropdownModal}>
                <p>Parameter</p>
                <div className={styles.modalSearchBox}>
                  <SearchIcon />
                  <input
                    type="search"
                    placeholder="Search"
                    value={modalSearchParameter}
                    onChange={(e) => setModalSearchParameter(e.target.value)}
                  />
                </div>
                <ul>
                  {(selectedSubObj?.parameters || [])
                    .filter(
                      (p) =>
                        !modalSearchParameter ||
                        p.name
                          .toLowerCase()
                          .includes(modalSearchParameter.toLowerCase())
                    )
                    .map((param) => (
                      <li
                        key={param.slug}
                        onClick={() => {
                          setSelectedParameterSlug(param.slug);
                          setOpenParameterModal(false);
                        }}
                      >
                        {param.name}
                      </li>
                    ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setOpenParameterModal(false)}
                >
                  Select
                </button>
              </div>
            )}

            <input
              className={styles.input}
              type="text"
              placeholder="Type Option"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button
              className={styles.saveButton}
              onClick={() => {
                if (!newOptionName.trim()) return;
                addOption(
                  selectedCategorySlug,
                  selectedSubCategorySlug,
                  selectedParameterSlug,
                  newOptionName.trim()
                );
              }}
              type="button"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </DndContext>
  );
};
