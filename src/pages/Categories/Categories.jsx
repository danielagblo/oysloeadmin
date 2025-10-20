import React, { useState } from "react";
import styles from "./categories.module.css";
import { SearchIcon } from "../../components/SVGIcons/SearchIcon";
import { categories } from "../../api/categories";
import { DragIcon } from "../../components/SVGIcons/DragIcon";
import { EditIcon, TrashIcon } from "lucide-react";

export const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState(0);
  const [selectedParameter, setSelectedParameter] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);
  return (
    <div className={styles.categoryContainer}>
      <div className={styles.categoryHeader}>
        <div className={styles.searchBox}>
          <SearchIcon />
          <input type="search" placeholder="Search" />
        </div>
        <span>You can hold and drag to rearrange </span>
      </div>
      <div className={styles.categoryColumns}>
        <div className={styles.column}>
          <div className={styles.itemHeader}>Categories</div>
          <div className={styles.items}>
            {categories?.map((category, idx) => (
              <div
                key={idx}
                className={
                  selectedCategory === idx ? styles.active : styles.itemItem
                }
                onClick={() => setSelectedCategory(idx)}
              >
                <DragIcon />
                <p>{category?.category}</p>
                <button>
                  <EditIcon size={15} />
                </button>
                <button>
                  <TrashIcon size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.itemHeader}>Sub-Categories</div>
          <div className={styles.items}>
            {categories[selectedCategory]?.subCategories?.map(
              (subCategory, idx) => (
                <div
                  key={idx}
                  className={
                    selectedSubCategory === idx
                      ? styles.active
                      : styles.itemItem
                  }
                  onClick={() => setSelectedSubCategory(idx)}
                >
                  <DragIcon />
                  <p>{subCategory?.name}</p>
                  <button>
                    <EditIcon size={15} />
                  </button>
                  <button>
                    <TrashIcon size={15} />
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.itemHeader}>Parameters</div>
          <div className={styles.items}>
            {categories[selectedCategory]?.subCategories[
              selectedSubCategory
            ]?.parameters?.map((parameter, idx) => (
              <div
                key={idx}
                className={
                  selectedParameter === idx ? styles.active : styles.itemItem
                }
                onClick={() => setSelectedParameter(idx)}
              >
                <DragIcon />
                <p>{parameter?.name}</p>
                <button>
                  <EditIcon size={15} />
                </button>
                <button>
                  <TrashIcon size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <div className={styles.itemHeader}>Options</div>
          <div className={styles.items}>
            {categories[selectedCategory]?.subCategories[
              selectedSubCategory
            ]?.parameters[selectedParameter]?.options?.map((option, idx) => (
              <div
                key={idx}
                className={
                  selectedOption === idx ? styles.active : styles.itemItem
                }
                onClick={() => setSelectedOption(idx)}
              >
                <DragIcon />
                <p>{option}</p>
                <button>
                  <EditIcon size={15} />
                </button>
                <button>
                  <TrashIcon size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.categoryInputs}>Inputs Section</div>
    </div>
  );
};
