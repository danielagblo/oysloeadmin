import React, { useState, useMemo } from "react";
import styles from "./categories.module.css";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { categories as initialData } from "../../api/categories";
import { DragIcon } from "../../components/SVGIcons/DragIcon";
import { EditIcon, TrashIcon } from "lucide-react";

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

/* ------------------ Sortable item (generic) ------------------ */
/* listeners attached only to handle so buttons/inputs won't start drag */
function SortableListItem({
  id,
  type,
  parentSlug,
  children,
  onEdit,
  onDelete,
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
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      className={styles.itemItem}
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
        >
          <EditIcon size={15} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <TrashIcon size={15} />
        </button>
      </div>
    </div>
  );
}

/* ------------------ Main component ------------------ */
export const Categories = () => {
  // clone initial data into state (deep-ish copy so we don't mutate imported constant)
  const [categories, setCategories] = useState(() =>
    initialData.map((c) => ({
      ...c,
      slug: c.slug || sluggify(c.category),
      subCategories: (c.subCategories || []).map((sc) => ({
        ...sc,
        slug: sc.slug || sluggify(sc.name),
        parameters: (sc.parameters || []).map((p) => ({
          ...p,
          slug: p.slug || sluggify(p.name),
          options: (p.options || []).slice(),
        })),
      })),
    }))
  );

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState(0);
  const [selectedParameter, setSelectedParameter] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);

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

  /* ------------- Utility setters ------------- */
  const clampIndex = (i, arr) => Math.max(0, Math.min(i, arr.length - 1));

  const addCategory = (name) => {
    const slug = sluggify(name);
    setCategories((prev) => [
      ...prev,
      { category: name, slug, subCategories: [] },
    ]);
    setNewCategoryName("");
    setSelectedCategory(categories.length); // select new one (index will update after state change)
  };

  const addSubCategory = (categoryIdx, name) => {
    if (categoryIdx == null) return;
    const slug = sluggify(name);
    setCategories((prev) =>
      prev.map((c, i) =>
        i === categoryIdx
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
    setSelectedSubCategory((prev) => {
      // select last in that category after state updates (best-effort)
      const target = categories[categoryIdx];
      return target?.subCategories?.length || 0;
    });
  };

  const addParameter = (categoryIdx, subIdx, name) => {
    if (categoryIdx == null || subIdx == null) return;
    const slug = sluggify(name);
    setCategories((prev) =>
      prev.map((c, i) =>
        i === categoryIdx
          ? {
              ...c,
              subCategories: c.subCategories.map((s, j) =>
                j === subIdx
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
  };

  const addOption = (categoryIdx, subIdx, paramIdx, name) => {
    if (categoryIdx == null || subIdx == null || paramIdx == null) return;
    setCategories((prev) =>
      prev.map((c, i) =>
        i === categoryIdx
          ? {
              ...c,
              subCategories: c.subCategories.map((s, j) =>
                j === subIdx
                  ? {
                      ...s,
                      parameters: s.parameters.map((p, k) =>
                        k === paramIdx
                          ? { ...p, options: [...(p.options || []), name] }
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
  };

  /* ------------- Edit / Delete ------------- */
  const editCategory = (idx) => {
    const current = categories[idx]?.category;
    const next = window.prompt("Edit category", current);
    if (!next) return;
    const slug = sluggify(next);
    setCategories((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, category: next, slug } : c))
    );
  };

  const deleteCategory = (idx) => {
    if (!window.confirm("Delete category?")) return;
    setCategories((prev) => {
      const copy = prev.slice();
      copy.splice(idx, 1);
      return copy;
    });
    setSelectedCategory((s) => clampIndex(s, categories.slice(0, -1)));
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
  };

  const deleteSubCategory = (catIdx, subIdx) => {
    if (!window.confirm("Delete sub-category?")) return;
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
    setSelectedSubCategory((s) =>
      clampIndex(s, categories[catIdx]?.subCategories?.slice(0, -1) || [])
    );
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
    setSelectedParameter((s) =>
      clampIndex(
        s,
        categories[selectedCategory]?.subCategories[
          selectedSubCategory
        ]?.parameters?.slice(0, -1) || []
      )
    );
  };

  const editOption = (catIdx, subIdx, paramIdx, optionIdx) => {
    const curr =
      categories[catIdx]?.subCategories?.[subIdx]?.parameters?.[paramIdx]
        ?.options?.[optionIdx];
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
                              options: p.options.map((o, z) =>
                                z === optionIdx ? next : o
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

  const deleteOption = (catIdx, subIdx, paramIdx, optionIdx) => {
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
                                (_, z) => z !== optionIdx
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
    setSelectedOption((s) =>
      clampIndex(
        s,
        categories[selectedCategory]?.subCategories[
          selectedSubCategory
        ]?.parameters[selectedParameter]?.options?.slice(0, -1) || []
      )
    );
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
      const parentSlug = active.data.current.parent; // `${catSlug}::${subSlug}::${paramSlug}`
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

      const a = active.id; // option ids are like option--<index> (we used index for options)
      const b = over.id;
      // For options we used numeric indices in ids so we need to use positions instead.
      const opts =
        categories[catIndex].subCategories[subIndex].parameters[paramIndex]
          .options;
      const oldIdx = parseInt(a.split("--")[1], 10);
      const newIdx = parseInt(b.split("--")[1], 10);
      if (Number.isNaN(oldIdx) || Number.isNaN(newIdx)) return;
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

    // search categories
    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      if (c.category.toLowerCase().includes(q) || c.slug.includes(q)) {
        setSelectedCategory(i);
        setSelectedSubCategory(0);
        setSelectedParameter(0);
        setSelectedOption(0);
        return;
      }
      // search subcategories
      for (let j = 0; j < (c.subCategories || []).length; j++) {
        const s = c.subCategories[j];
        if (s.name.toLowerCase().includes(q) || s.slug.includes(q)) {
          setSelectedCategory(i);
          setSelectedSubCategory(j);
          setSelectedParameter(0);
          setSelectedOption(0);
          return;
        }
        // search parameters
        for (let k = 0; k < (s.parameters || []).length; k++) {
          const p = s.parameters[k];
          if (p.name.toLowerCase().includes(q) || p.slug.includes(q)) {
            setSelectedCategory(i);
            setSelectedSubCategory(j);
            setSelectedParameter(k);
            setSelectedOption(0);
            return;
          }
          // search options
          for (let z = 0; z < (p.options || []).length; z++) {
            const o = p.options[z];
            if (String(o).toLowerCase().includes(q)) {
              setSelectedCategory(i);
              setSelectedSubCategory(j);
              setSelectedParameter(k);
              setSelectedOption(z);
              return;
            }
          }
        }
      }
    }
  };

  /* ------------- Derived lists for rendering ------------- */
  const selectedCatObj = categories[selectedCategory] || categories[0] || null;
  const selectedSubObj =
    selectedCatObj?.subCategories?.[selectedSubCategory] || null;
  const selectedParamObj =
    selectedSubObj?.parameters?.[selectedParameter] || null;

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
                  return (
                    <SortableListItem
                      key={id}
                      id={id}
                      type="category"
                      parentSlug={null}
                      onEdit={() => editCategory(idx)}
                      onDelete={() => deleteCategory(idx)}
                    >
                      <p>{category.category}</p>
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
                    return (
                      <SortableListItem
                        key={id}
                        id={id}
                        type="sub"
                        parentSlug={selectedCatObj?.slug}
                        onEdit={() => editSubCategory(selectedCategory, idx)}
                        onDelete={() =>
                          deleteSubCategory(selectedCategory, idx)
                        }
                      >
                        <p>{subCategory.name}</p>
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
                  // parent slug encode cat::sub so reorder knows the parent
                  return (
                    <SortableListItem
                      key={id}
                      id={id}
                      type="param"
                      parentSlug={`${selectedCatObj?.slug}::${selectedSubObj?.slug}`}
                      onEdit={() =>
                        editParameter(
                          selectedCategory,
                          selectedSubCategory,
                          idx
                        )
                      }
                      onDelete={() =>
                        deleteParameter(
                          selectedCategory,
                          selectedSubCategory,
                          idx
                        )
                      }
                    >
                      <p>{parameter.name}</p>
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
              {/* For options we must produce stable ids; use option index as id suffix */}
              <SortableContext
                items={(selectedParamObj?.options || []).map((_, idx) =>
                  makeId("option", String(idx))
                )}
                strategy={verticalListSortingStrategy}
              >
                {(selectedParamObj?.options || []).map((option, idx) => {
                  const id = makeId("option", String(idx)); // option--<index>
                  return (
                    <SortableListItem
                      key={id}
                      id={id}
                      type="option"
                      parentSlug={`${selectedCatObj?.slug}::${selectedSubObj?.slug}::${selectedParamObj?.slug}`}
                      onEdit={() =>
                        editOption(
                          selectedCategory,
                          selectedSubCategory,
                          selectedParameter,
                          idx
                        )
                      }
                      onDelete={() =>
                        deleteOption(
                          selectedCategory,
                          selectedSubCategory,
                          selectedParameter,
                          idx
                        )
                      }
                    >
                      <p>{option}</p>
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
              onClick={() =>
                newCategoryName.trim() && addCategory(newCategoryName.trim())
              }
            >
              Save
            </button>
          </div>

          <div className={styles.inputColumn}>
            <div className={styles.dropdownButton}>
              <p>{selectedCatObj?.category || "Category"}</p>
              <button onClick={() => setOpenCategoryModal((p) => !p)}>
                {/* your caret */}
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
                    .map((category, idx) => (
                      <li
                        key={category.slug}
                        onClick={() => {
                          setSelectedCategory(idx);
                          setOpenCategoryModal(false);
                        }}
                      >
                        {category.category}
                      </li>
                    ))}
                </ul>
                <button onClick={() => setOpenCategoryModal(false)}>
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
                addSubCategory(selectedCategory, newSubCategoryName.trim());
              }}
            >
              Save
            </button>
          </div>

          <div className={styles.inputColumn}>
            <div className={styles.dropdownButton}>
              <p>{selectedSubObj?.name || "Sub-category"}</p>
              <button onClick={() => setOpenSubCategoryModal((p) => !p)}>
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
                    .map((subCategory, idx) => (
                      <li
                        key={subCategory.slug}
                        onClick={() => {
                          setSelectedSubCategory(idx);
                          setOpenSubCategoryModal(false);
                        }}
                      >
                        {subCategory.name}
                      </li>
                    ))}
                </ul>
                <button onClick={() => setOpenSubCategoryModal(false)}>
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
                  selectedCategory,
                  selectedSubCategory,
                  newParameterName.trim()
                );
              }}
            >
              Save
            </button>
          </div>

          <div className={styles.inputColumn}>
            <div className={styles.dropdownButton}>
              <p>{selectedParamObj?.name || "Parameter"}</p>
              <button onClick={() => setOpenParameterModal((p) => !p)}>
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
                    .map((param, idx) => (
                      <li
                        key={param.slug}
                        onClick={() => {
                          setSelectedParameter(idx);
                          setOpenParameterModal(false);
                        }}
                      >
                        {param.name}
                      </li>
                    ))}
                </ul>
                <button onClick={() => setOpenParameterModal(false)}>
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
                  selectedCategory,
                  selectedSubCategory,
                  selectedParameter,
                  newOptionName.trim()
                );
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </DndContext>
  );
};
