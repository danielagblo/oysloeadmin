import React, { useState, useMemo, useEffect } from "react";
import styles from "./categories.module.css";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  reorderCategories,
} from "../../api/categories";
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

const makeOptionId = (catSlug, subSlug, paramSlug, value) =>
  `option--${[
    catSlug,
    subSlug,
    paramSlug,
    sluggify(String(value)),
    Date.now(),
  ].join("::")}`;

/* ------------------ Sortable item ------------------ */
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
      {...attributes}
    >
      <span {...listeners} style={{ display: "grid" }}>
        <DragIcon />
      </span>

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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // selected values
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(null);
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState(null);
  const [selectedParameterSlug, setSelectedParameterSlug] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  // modal toggles & search inputs
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openSubCategoryModal, setOpenSubCategoryModal] = useState(false);
  const [openParameterModal, setOpenParameterModal] = useState(false);
  const [modalSearchCategory, setModalSearchCategory] = useState("");
  const [modalSearchSubCategory, setModalSearchSubCategory] = useState("");
  const [modalSearchParameter, setModalSearchParameter] = useState("");

  // input values
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [newParameterName, setNewParameterName] = useState("");
  const [newOptionName, setNewOptionName] = useState("");

  // global search
  const [globalSearch, setGlobalSearch] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  // Fetch categories on mount
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      alert("Failed to load categories: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Set default selections when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategorySlug) {
      const firstCat = categories[0];
      setSelectedCategorySlug(firstCat.slug);

      const firstSub = firstCat.subCategories?.[0];
      if (firstSub) {
        setSelectedSubCategorySlug(firstSub.slug);

        const firstParam = firstSub.parameters?.[0];
        if (firstParam) setSelectedParameterSlug(firstParam.slug);
      }
    }
  }, [categories, selectedCategorySlug]);

  // API Handlers
  const handleAddCategory = async (name) => {
    try {
      setActionLoading(true);
      await createCategory({ name });
      await fetchCategories(); // Refresh data
      setNewCategoryName("");
    } catch (err) {
      console.error("Failed to create category:", err);
      alert("Failed to create category: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = async (categorySlug, newName) => {
    try {
      setActionLoading(true);
      await updateCategory(categorySlug, { name: newName });
      await fetchCategories();

      // Update selection if this was the selected category
      if (selectedCategorySlug === categorySlug) {
        setSelectedCategorySlug(sluggify(newName));
      }
    } catch (err) {
      console.error("Failed to update category:", err);
      alert("Failed to update category: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (categorySlug) => {
    if (!window.confirm("Delete category?")) return;

    try {
      setActionLoading(true);
      await deleteCategory(categorySlug);
      await fetchCategories();

      // Adjust selection
      if (selectedCategorySlug === categorySlug) {
        setSelectedCategorySlug(categories[0]?.slug || null);
        setSelectedSubCategorySlug(null);
        setSelectedParameterSlug(null);
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSubCategory = async (categorySlug, name) => {
    if (!categorySlug) return;

    try {
      setActionLoading(true);
      await createSubcategory(categorySlug, { name });
      await fetchCategories();
      setNewSubCategoryName("");
    } catch (err) {
      console.error("Failed to create subcategory:", err);
      alert("Failed to create subcategory: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubCategory = async (categorySlug, subSlug, newName) => {
    try {
      setActionLoading(true);
      await updateSubcategory(categorySlug, subSlug, { name: newName });
      await fetchCategories();

      // Update selection if this was the selected subcategory
      if (selectedSubCategorySlug === subSlug) {
        setSelectedSubCategorySlug(sluggify(newName));
      }
    } catch (err) {
      console.error("Failed to update subcategory:", err);
      alert("Failed to update subcategory: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubCategory = async (categorySlug, subSlug) => {
    if (!window.confirm("Delete sub-category?")) return;

    try {
      setActionLoading(true);
      await deleteSubcategory(categorySlug, subSlug);
      await fetchCategories();

      // Adjust selection
      if (selectedSubCategorySlug === subSlug) {
        const category = categories.find((c) => c.slug === categorySlug);
        setSelectedSubCategorySlug(category?.subCategories?.[0]?.slug || null);
        setSelectedParameterSlug(null);
      }
    } catch (err) {
      console.error("Failed to delete subcategory:", err);
      alert("Failed to delete subcategory: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // For parameters and options, we'll keep them local for now since backend might not support them
  const handleAddParameter = (categorySlug, subSlug, name) => {
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

  const handleEditParameter = (categorySlug, subSlug, paramSlug, newName) => {
    const slug = sluggify(newName);
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
                        p.slug === paramSlug ? { ...p, name: newName, slug } : p
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

  const handleDeleteParameter = (categorySlug, subSlug, paramSlug) => {
    if (!window.confirm("Delete parameter?")) return;

    setCategories((prev) =>
      prev.map((c) =>
        c.slug === categorySlug
          ? {
              ...c,
              subCategories: c.subCategories.map((s) =>
                s.slug === subSlug
                  ? {
                      ...s,
                      parameters: s.parameters.filter(
                        (p) => p.slug !== paramSlug
                      ),
                    }
                  : s
              ),
            }
          : c
      )
    );

    if (selectedParameterSlug === paramSlug) {
      const category = categories.find((c) => c.slug === categorySlug);
      const sub = category?.subCategories?.find((s) => s.slug === subSlug);
      setSelectedParameterSlug(sub?.parameters?.[0]?.slug || null);
    }
  };

  const handleAddOption = (categorySlug, subSlug, paramSlug, name) => {
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

  const handleEditOption = (
    categorySlug,
    subSlug,
    paramSlug,
    optionId,
    newValue
  ) => {
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
                              options: p.options.map((o) =>
                                o.id === optionId
                                  ? { ...o, value: newValue }
                                  : o
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

  const handleDeleteOption = (categorySlug, subSlug, paramSlug, optionId) => {
    if (!window.confirm("Delete option?")) return;

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

    if (selectedOptionId === optionId) {
      setSelectedOptionId(null);
    }
  };

  // Drag and Drop Handlers
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType !== overType) return;

    if (activeType === "category") {
      const activeSlug = active.id.split("--")[1];
      const overSlug = over.id.split("--")[1];

      const oldIndex = categories.findIndex((p) => p.slug === activeSlug);
      const newIndex = categories.findIndex((p) => p.slug === overSlug);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrderedCategories = arrayMove(categories, oldIndex, newIndex);

      try {
        // Update UI optimistically
        setCategories(newOrderedCategories);

        // Send reorder to backend
        const orders = newOrderedCategories.map((cat, index) => ({
          id: cat.slug,
          order: index,
        }));

        await reorderCategories(orders);
      } catch (err) {
        console.error("Failed to reorder categories:", err);
        alert("Failed to reorder categories: " + err.message);
        // Revert on error
        await fetchCategories();
      }
    }

    // Handle other drag types (sub, param, option) similarly...
  };

  // Global search
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
      // ... rest of search logic remains the same
    }
  };

  // Derived data
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

  if (loading) {
    return <div className={styles.loading}>Loading categories...</div>;
  }

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
          {/* Categories column */}
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
                      onEdit={() => {
                        const newName = window.prompt(
                          "Edit category",
                          category.category
                        );
                        if (newName && newName !== category.category) {
                          handleEditCategory(category.slug, newName);
                        }
                      }}
                      onDelete={() => handleDeleteCategory(category.slug)}
                      active={active}
                    >
                      <div
                        role="button"
                        onClick={() => {
                          setSelectedCategorySlug(category.slug);
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

          {/* Sub-categories column */}
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
                        onEdit={() => {
                          const newName = window.prompt(
                            "Edit sub-category",
                            subCategory.name
                          );
                          if (newName && newName !== subCategory.name) {
                            handleEditSubCategory(
                              selectedCatObj.slug,
                              subCategory.slug,
                              newName
                            );
                          }
                        }}
                        onDelete={() =>
                          handleDeleteSubCategory(
                            selectedCatObj.slug,
                            subCategory.slug
                          )
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

          {/* Parameters and Options columns remain largely the same */}
          {/* ... rest of your existing JSX for Parameters and Options columns ... */}
        </div>

        {/* Inputs area */}
        <div className={styles.categoryInputs}>
          <div className={styles.inputColumn}>
            <input
              className={styles.input}
              type="text"
              placeholder="Type Category"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={actionLoading}
            />
            <button
              className={styles.saveButton}
              onClick={() => {
                if (!newCategoryName.trim()) return;
                handleAddCategory(newCategoryName.trim());
              }}
              type="button"
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : "Save"}
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
              disabled={actionLoading}
            />
            <button
              className={styles.saveButton}
              onClick={() => {
                if (!newSubCategoryName.trim() || !selectedCategorySlug) return;
                handleAddSubCategory(
                  selectedCategorySlug,
                  newSubCategoryName.trim()
                );
              }}
              type="button"
              disabled={actionLoading}
            >
              {actionLoading ? "Saving..." : "Save"}
            </button>
          </div>

          {/* ... rest of your input columns for parameters and options ... */}
        </div>
      </div>
    </DndContext>
  );
};
