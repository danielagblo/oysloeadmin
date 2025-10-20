export const categories = [
  {
    category: "Electronics",
    slug: "electronics",
    subCategories: [
      {
        name: "Mobile Phones",
        slug: "mobile-phones",
        parameters: [
          {
            name: "Brand",
            slug: "brand",
            options: ["Samsung", "Apple", "Tecno", "Infinix", "LG"],
          },
          {
            name: "RAM",
            slug: "ram",
            options: ["2GB", "4GB", "6GB", "8GB", "12GB"],
          },
          {
            name: "Storage",
            slug: "storage",
            options: ["32GB", "64GB", "128GB", "256GB"],
          },
          {
            name: "CPU",
            slug: "cpu",
            options: ["Snapdragon", "Exynos", "MediaTek", "Apple A16"],
          },
          {
            name: "Battery",
            slug: "battery",
            options: ["3000mAh", "4000mAh", "5000mAh"],
          },
        ],
      },
      {
        name: "Televisions",
        slug: "televisions",
        parameters: [
          {
            name: "Brand",
            slug: "brand",
            options: ["Samsung", "LG", "Sony", "Hisense"],
          },
          {
            name: "Screen Size",
            slug: "screen-size",
            options: ["32 inch", "43 inch", "55 inch", "65 inch"],
          },
          {
            name: "Resolution",
            slug: "resolution",
            options: ["HD", "Full HD", "4K", "8K"],
          },
          {
            name: "Smart Features",
            slug: "smart-features",
            options: ["Android TV", "WebOS", "Tizen", "None"],
          },
        ],
      },
    ],
  },
  {
    category: "Fashion",
    slug: "fashion",
    subCategories: [
      {
        name: "Men's Wear",
        slug: "mens-wear",
        parameters: [
          {
            name: "Brand",
            slug: "brand",
            options: ["Gucci", "Nike", "Adidas", "Levi's"],
          },
          {
            name: "Size",
            slug: "size",
            options: ["S", "M", "L", "XL"],
          },
          {
            name: "Material",
            slug: "material",
            options: ["Cotton", "Polyester", "Denim"],
          },
        ],
      },
      {
        name: "Women's Wear",
        slug: "womens-wear",
        parameters: [
          {
            name: "Brand",
            slug: "brand",
            options: ["Zara", "Prada", "Versace"],
          },
          {
            name: "Size",
            slug: "size",
            options: ["S", "M", "L"],
          },
          {
            name: "Material",
            slug: "material",
            options: ["Silk", "Cotton", "Wool"],
          },
        ],
      },
    ],
  },
  {
    category: "Vehicles",
    slug: "vehicles",
    subCategories: [
      {
        name: "Cars",
        slug: "cars",
        parameters: [
          {
            name: "Brand",
            slug: "brand",
            options: ["Toyota", "Honda", "BMW", "Mercedes"],
          },
          {
            name: "Fuel Type",
            slug: "fuel-type",
            options: ["Petrol", "Diesel", "Electric", "Hybrid"],
          },
          {
            name: "Transmission",
            slug: "transmission",
            options: ["Manual", "Automatic"],
          },
        ],
      },
      {
        name: "Motorbikes",
        slug: "motorbikes",
        parameters: [
          {
            name: "Brand",
            slug: "brand",
            options: ["Yamaha", "Suzuki", "Kawasaki"],
          },
          {
            name: "Engine Capacity",
            slug: "engine-capacity",
            options: ["150cc", "250cc", "500cc"],
          },
          {
            name: "Type",
            slug: "type",
            options: ["Sport", "Cruiser", "Off-road"],
          },
        ],
      },
    ],
  },
];
