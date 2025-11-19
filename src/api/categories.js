// export const categories = [
//   {
//     category: "Electronics",
//     slug: "electronics",
//     subCategories: [
//       {
//         name: "Mobile Phones",
//         slug: "mobile-phones",
//         parameters: [
//           {
//             name: "Brand",
//             slug: "brand",
//             options: ["Samsung", "Apple", "Tecno", "Infinix", "LG"],
//           },
//           {
//             name: "RAM",
//             slug: "ram",
//             options: ["2GB", "4GB", "6GB", "8GB", "12GB"],
//           },
//           {
//             name: "Storage",
//             slug: "storage",
//             options: ["32GB", "64GB", "128GB", "256GB"],
//           },
//           {
//             name: "CPU",
//             slug: "cpu",
//             options: ["Snapdragon", "Exynos", "MediaTek", "Apple A16"],
//           },
//           {
//             name: "Battery",
//             slug: "battery",
//             options: ["3000mAh", "4000mAh", "5000mAh"],
//           },
//         ],
//       },
//       {
//         name: "Televisions",
//         slug: "televisions",
//         parameters: [
//           {
//             name: "Brand",
//             slug: "brand",
//             options: ["Samsung", "LG", "Sony", "Hisense"],
//           },
//           {
//             name: "Screen Size",
//             slug: "screen-size",
//             options: ["32 inch", "43 inch", "55 inch", "65 inch"],
//           },
//           {
//             name: "Resolution",
//             slug: "resolution",
//             options: ["HD", "Full HD", "4K", "8K"],
//           },
//           {
//             name: "Smart Features",
//             slug: "smart-features",
//             options: ["Android TV", "WebOS", "Tizen", "None"],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     category: "Fashion",
//     slug: "fashion",
//     subCategories: [
//       {
//         name: "Men's Wear",
//         slug: "mens-wear",
//         parameters: [
//           {
//             name: "Brand",
//             slug: "brand",
//             options: ["Gucci", "Nike", "Adidas", "Levi's"],
//           },
//           {
//             name: "Size",
//             slug: "size",
//             options: ["S", "M", "L", "XL"],
//           },
//           {
//             name: "Material",
//             slug: "material",
//             options: ["Cotton", "Polyester", "Denim"],
//           },
//         ],
//       },
//       {
//         name: "Women's Wear",
//         slug: "womens-wear",
//         parameters: [
//           {
//             name: "Brand",
//             slug: "brand",
//             options: ["Zara", "Prada", "Versace"],
//           },
//           {
//             name: "Size",
//             slug: "size",
//             options: ["S", "M", "L"],
//           },
//           {
//             name: "Material",
//             slug: "material",
//             options: ["Silk", "Cotton", "Wool"],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     category: "Vehicles",
//     slug: "vehicles",
//     subCategories: [
//       {
//         name: "Cars",
//         slug: "cars",
//         parameters: [
//           {
//             name: "Brand",
//             slug: "brand",
//             options: ["Toyota", "Honda", "BMW", "Mercedes"],
//           },
//           {
//             name: "Fuel Type",
//             slug: "fuel-type",
//             options: ["Petrol", "Diesel", "Electric", "Hybrid"],
//           },
//           {
//             name: "Transmission",
//             slug: "transmission",
//             options: ["Manual", "Automatic"],
//           },
//         ],
//       },
//       {
//         name: "Motorbikes",
//         slug: "motorbikes",
//         parameters: [
//           {
//             name: "Brand",
//             slug: "brand",
//             options: ["Yamaha", "Suzuki", "Kawasaki"],
//           },
//           {
//             name: "Engine Capacity",
//             slug: "engine-capacity",
//             options: ["150cc", "250cc", "500cc"],
//           },
//           {
//             name: "Type",
//             slug: "type",
//             options: ["Sport", "Cruiser", "Off-road"],
//           },
//         ],
//       },
//     ],
//   },
// ];

import { getToken } from "./auth";

const API_BASE = `${import.meta.env.VITE_API_BASE || ""}/admin/categories`;

/** Fetch helper */
async function fetchJson(path = "", opts = {}) {
  const token = getToken();
  const url = `${API_BASE}${path}`;
  const headers = { Accept: "application/json", ...(opts.headers || {}) };

  if (!(opts.body instanceof FormData) && opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    credentials: opts.credentials ?? "include",
    body:
      opts.body instanceof FormData
        ? opts.body
        : opts.body !== undefined
        ? JSON.stringify(opts.body)
        : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const err = new Error(`Request failed ${res.status}: ${txt}`);
    err.status = res.status;
    throw err;
  }

  return res.json().catch(() => ({}));
}

/** Map backend category -> UI shape */
function mapCategoryToUI(category) {
  if (!category) return null;

  return {
    category: category.name || category.category,
    slug: category.slug || category.id,
    subCategories: (category.subcategories || category.subCategories || []).map(
      (sub) => ({
        name: sub.name,
        slug: sub.slug || sub.id,
        parameters: (sub.parameters || sub.features || []).map((param) => ({
          name: param.name,
          slug: param.slug || param.id,
          options: (param.options || []).map((opt) => ({
            id: opt.id || `option-${Date.now()}-${Math.random()}`,
            value: typeof opt === "string" ? opt : opt.value || opt.name,
          })),
        })),
      })
    ),
  };
}

/** PUBLIC: Get all categories */
export async function getCategories() {
  try {
    const res = await fetchJson("", { method: "GET" });

    // Handle different response structures
    const categoriesData =
      res?.data?.categories ||
      res?.data?.hierarchy ||
      res?.categories ||
      res?.data ||
      [];

    const categories = Array.isArray(categoriesData)
      ? categoriesData.map(mapCategoryToUI).filter(Boolean)
      : [];

    return {
      categories,
      raw: res,
    };
  } catch (err) {
    console.error("getCategories error:", err);
    return { categories: [], raw: null };
  }
}

/** PUBLIC: Create category */
export async function createCategory(categoryData) {
  try {
    const res = await fetchJson("", {
      method: "POST",
      body: {
        name: categoryData.name,
        description: categoryData.description || "",
        // iconUrl will be handled by upload flow separately
      },
    });

    return res?.data?.category || res?.data || res;
  } catch (err) {
    console.error("createCategory error:", err);
    throw err;
  }
}

/** PUBLIC: Update category */
export async function updateCategory(categoryId, updateData) {
  try {
    const res = await fetchJson(`/${encodeURIComponent(categoryId)}`, {
      method: "PUT",
      body: {
        name: updateData.name,
        description: updateData.description || "",
        // iconUrl will be handled by upload flow separately
      },
    });

    return res?.data?.category || res?.data || res;
  } catch (err) {
    console.error("updateCategory error:", err);
    throw err;
  }
}

/** PUBLIC: Delete category */
export async function deleteCategory(categoryId) {
  try {
    const res = await fetchJson(`/${encodeURIComponent(categoryId)}`, {
      method: "DELETE",
    });

    return res;
  } catch (err) {
    console.error("deleteCategory error:", err);
    throw err;
  }
}

/** PUBLIC: Create subcategory */
export async function createSubcategory(categoryId, subcategoryData) {
  try {
    const res = await fetchJson(
      `/${encodeURIComponent(categoryId)}/subcategories`,
      {
        method: "POST",
        body: {
          name: subcategoryData.name,
          description: subcategoryData.description || "",
        },
      }
    );

    return res?.data?.subcategory || res?.data || res;
  } catch (err) {
    console.error("createSubcategory error:", err);
    throw err;
  }
}

/** PUBLIC: Update subcategory */
export async function updateSubcategory(categoryId, subcategoryId, updateData) {
  try {
    const res = await fetchJson(
      `/${encodeURIComponent(categoryId)}/subcategories/${encodeURIComponent(
        subcategoryId
      )}`,
      {
        method: "PUT",
        body: {
          name: updateData.name,
          description: updateData.description || "",
        },
      }
    );

    return res?.data?.subcategory || res?.data || res;
  } catch (err) {
    console.error("updateSubcategory error:", err);
    throw err;
  }
}

/** PUBLIC: Delete subcategory */
export async function deleteSubcategory(categoryId, subcategoryId) {
  try {
    const res = await fetchJson(
      `/${encodeURIComponent(categoryId)}/subcategories/${encodeURIComponent(
        subcategoryId
      )}`,
      {
        method: "DELETE",
      }
    );

    return res;
  } catch (err) {
    console.error("deleteSubcategory error:", err);
    throw err;
  }
}

/** PUBLIC: Reorder categories */
export async function reorderCategories(orders) {
  try {
    const res = await fetchJson("/reorder", {
      method: "PUT",
      body: { orders },
    });

    return res?.data || res;
  } catch (err) {
    console.error("reorderCategories error:", err);
    throw err;
  }
}

// For backward compatibility
export const categories = [];

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  reorderCategories,
  mapCategoryToUI,
  categories,
};
