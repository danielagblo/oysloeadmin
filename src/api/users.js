// // usersPageData.js
// export const users = [
//   {
//     id: 1,
//     name: "Daniel Kery",
//     username: "daniel.kery",
//     role: "staff",
//     subRole: "admin",
//     type: "business",
//     verified: true,
//     level: "entry",
//     badge: "Top rank",
//     businessName: "K Mart Enterprise",
//     profileImage: "https://randomuser.me/api/portraits/men/12.jpg",
//     businessLogo: "https://picsum.photos/id/1011/200/200",
//     idFront: "https://picsum.photos/id/1005/600/400",
//     idBack: "https://picsum.photos/id/1006/600/400",
//     activeAds: 456000,
//     activeAdIds: [6, 1, 5],
//     joined: "2025-07-03T00:00:00Z",
//     reviewsCount: 234,
//     rating: 4.5,
//     supportPercent: 1.1,
//     email: "daniel.kery@kmart.example",
//     phonePrimary: "0558871870",
//     phoneSecondary: null,
//     paymentAccount: "GCB-23456789",
//     accountName: "K Mart Enterprise",
//     accountNumber: "23456789",
//     nationalId: "AGHDKFL34658",
//     mobileNetwork: "MTN",
//     passkey: "pk_daniel_kery_01",
//     notes: "~Admin / staff account used for management",
//     applications: ["seller-onboarding", "priority-support"],
//     locations: ["Accra, Ghana"],
//     muted: false,
//     deleted: false,

//     // added review data
//     aggregatedReviews: {
//       averageRating: 4.5,
//       totalReviews: 234,
//       ratingBreakdown: {
//         5: 170,
//         4: 40,
//         3: 15,
//         2: 5,
//         1: 4,
//       },
//     },
//     comments: [
//       {
//         date: "2025-07-01T12:34:00Z",
//         stars: 5,
//         text: "Excellent support — handled our campaign quickly.",
//         user: {
//           name: "Akua Addo",
//           avatar: "https://randomuser.me/api/portraits/women/42.jpg",
//         },
//       },
//       {
//         date: "2025-06-28T09:10:00Z",
//         stars: 4,
//         text: "Good communication — pricing could be clearer.",
//         user: {
//           name: "Kweku Appiah",
//           avatar: "https://randomuser.me/api/portraits/men/19.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 2,
//     name: "Jeff07",
//     username: "jeff07",
//     role: "super-admin",
//     subRole: "owner",
//     type: "premium",
//     verified: true,
//     level: "top",
//     badge: "Admin",
//     businessName: "Jeff Digital",
//     profileImage: "https://randomuser.me/api/portraits/men/45.jpg",
//     businessLogo: "https://picsum.photos/id/1025/200/200",
//     idFront: "https://picsum.photos/id/1020/600/400",
//     idBack: "https://picsum.photos/id/1021/600/400",
//     activeAds: 120,
//     activeAdIds: [1, 2],
//     joined: "2024-11-15T10:30:00Z",
//     reviewsCount: 54,
//     rating: 4.9,
//     supportPercent: 0.6,
//     email: "admin@jeffdigital.example",
//     phonePrimary: "0244123456",
//     phoneSecondary: "0277123456",
//     paymentAccount: "STD-99887766",
//     accountName: "Jeff Digital",
//     accountNumber: "99887766",
//     nationalId: "JEFF-99887",
//     mobileNetwork: "AirtelTigo",
//     passkey: "pk_jeff07",
//     notes: "Platform owner",
//     applications: ["admin-dashboard", "campaigns"],
//     locations: ["Accra"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.9,
//       totalReviews: 54,
//       ratingBreakdown: {
//         5: 46,
//         4: 6,
//         3: 1,
//         2: 0,
//         1: 1,
//       },
//     },
//     comments: [
//       {
//         date: "2025-05-10T08:00:00Z",
//         stars: 5,
//         text: "Fantastic features delivered rapidly.",
//         user: {
//           name: "Power Seller",
//           avatar: "https://randomuser.me/api/portraits/men/55.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 3,
//     name: "Oysloe",
//     username: "oysloe",
//     role: "support",
//     subRole: "support-manager",
//     type: "business",
//     verified: false,
//     level: "middle",
//     badge: null,
//     businessName: "Oysloe Services",
//     profileImage: "https://randomuser.me/api/portraits/women/21.jpg",
//     businessLogo: "https://picsum.photos/id/1035/200/200",
//     idFront: "https://picsum.photos/id/1030/600/400",
//     idBack: "https://picsum.photos/id/1031/600/400",
//     activeAds: 8,
//     activeAdIds: [3],
//     joined: "2025-04-01T08:00:00Z",
//     reviewsCount: 12,
//     rating: 4.1,
//     supportPercent: 0.9,
//     email: "oy@sloe.example",
//     phonePrimary: "0552892433",
//     phoneSecondary: "0244123434",
//     paymentAccount: "CAL-11223344",
//     accountName: "Oysloe Services",
//     accountNumber: "11223344",
//     nationalId: "OYSL-33445",
//     mobileNetwork: "MTN",
//     passkey: "pk_oysloe",
//     notes: "Support manager - handles inbound tickets",
//     applications: ["support-portal"],
//     locations: ["Kumasi"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.1,
//       totalReviews: 12,
//       ratingBreakdown: {
//         5: 6,
//         4: 3,
//         3: 2,
//         2: 0,
//         1: 1,
//       },
//     },
//     comments: [
//       {
//         date: "2025-04-25T10:00:00Z",
//         stars: 4,
//         text: "Quick response time for my ticket — thank you.",
//         user: {
//           name: "Sandra Biom",
//           avatar: "https://randomuser.me/api/portraits/women/17.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 4,
//     name: "John Agblo",
//     username: "agblod27",
//     role: "user",
//     subRole: "seller",
//     type: "basic",
//     verified: true,
//     level: "low",
//     badge: null,
//     businessName: "John's Autos",
//     profileImage: "https://randomuser.me/api/portraits/men/17.jpg",
//     businessLogo: "https://picsum.photos/id/1041/200/200",
//     idFront: "https://picsum.photos/id/1045/600/400",
//     idBack: "https://picsum.photos/id/1046/600/400",
//     activeAds: 5,
//     activeAdIds: [2],
//     joined: "2024-06-12T14:20:00Z",
//     reviewsCount: 6,
//     rating: 4.2,
//     supportPercent: 0.5,
//     email: "agblod27@gmail.com",
//     phonePrimary: "0277123456",
//     phoneSecondary: "0501234567",
//     paymentAccount: "GAB-44332211",
//     accountName: "John Agblo",
//     accountNumber: "44332211",
//     nationalId: "AGHDKFL34658",
//     mobileNetwork: "Vodafone",
//     passkey: "pk_agblo",
//     notes: "Has left buyer feedback in support messages",
//     applications: ["seller-listing"],
//     locations: ["Accra"],
//     muted: false,
//     deleted: false,

//     // no aggregatedReviews/comments — UI will show defaults
//   },

//   {
//     id: 5,
//     name: "Sandra Biom",
//     username: "sandra.biom",
//     role: "user",
//     subRole: "buyer",
//     type: "basic",
//     verified: true,
//     level: "low",
//     badge: null,
//     businessName: "Sandra Boutique",
//     profileImage: "https://randomuser.me/api/portraits/women/17.jpg",
//     businessLogo: "https://picsum.photos/id/1052/200/200",
//     idFront: "https://picsum.photos/id/1050/600/400",
//     idBack: "https://picsum.photos/id/1051/600/400",
//     activeAds: 0,
//     activeAdIds: [],
//     joined: "2025-01-04T09:00:00Z",
//     reviewsCount: 2,
//     rating: 4.0,
//     supportPercent: 0.3,
//     email: "sandra.biom@example.com",
//     phonePrimary: "0558871870",
//     phoneSecondary: "0552892433",
//     paymentAccount: "MTB-55667788",
//     accountName: "Sandra Biom",
//     accountNumber: "55667788",
//     nationalId: "SNDB-5566",
//     mobileNetwork: "MTN",
//     passkey: "pk_sandra",
//     notes: "Buyer left long comment on an ad; referenced in support messages",
//     applications: ["buyer-app"],
//     locations: ["Takoradi"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.0,
//       totalReviews: 2,
//       ratingBreakdown: {
//         5: 1,
//         4: 1,
//         3: 0,
//         2: 0,
//         1: 0,
//       },
//     },
//     comments: [
//       {
//         date: "2025-01-05T11:00:00Z",
//         stars: 4,
//         text: "Item arrived as described. Thanks!",
//         user: {
//           name: "John Agblo",
//           avatar: "https://randomuser.me/api/portraits/men/17.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 6,
//     name: "Daniel Kery (Alt)",
//     username: "dan.kery_alt",
//     role: "user",
//     subRole: "staff",
//     type: "premium",
//     verified: true,
//     level: "top",
//     badge: "Staff",
//     businessName: "K Mart Branch B",
//     profileImage: "https://randomuser.me/api/portraits/men/18.jpg",
//     businessLogo: "https://picsum.photos/id/1062/200/200",
//     idFront: "https://picsum.photos/id/1060/600/400",
//     idBack: "https://picsum.photos/id/1061/600/400",
//     activeAds: 456000,
//     activeAdIds: [1, 5, 6],
//     joined: "2024-03-20T12:00:00Z",
//     reviewsCount: 180,
//     rating: 4.7,
//     supportPercent: 1.0,
//     email: "dan.alt@kmart.example",
//     phonePrimary: "0244123000",
//     phoneSecondary: null,
//     paymentAccount: "GCB-11112222",
//     accountName: "K Mart Branch B",
//     accountNumber: "11112222",
//     nationalId: "DK-334455",
//     mobileNetwork: "MTN",
//     passkey: "pk_dan_alt",
//     notes: "Represents staff-level sample",
//     applications: ["ads-management"],
//     locations: ["Accra"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.7,
//       totalReviews: 180,
//       ratingBreakdown: {
//         5: 140,
//         4: 25,
//         3: 10,
//         2: 3,
//         1: 2,
//       },
//     },
//     comments: [
//       {
//         date: "2024-12-15T09:00:00Z",
//         stars: 5,
//         text: "Reliable partner for big campaigns.",
//         user: {
//           name: "Power Seller",
//           avatar: "https://randomuser.me/api/portraits/men/55.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 7,
//     name: "Kweku Appiah",
//     username: "kweku.app",
//     role: "user",
//     subRole: "seller",
//     type: "premium",
//     verified: true,
//     level: "middle",
//     badge: null,
//     businessName: "Appiah Ventures",
//     profileImage: "https://randomuser.me/api/portraits/men/19.jpg",
//     businessLogo: "https://picsum.photos/id/1070/200/200",
//     idFront: "https://picsum.photos/id/1071/600/400",
//     idBack: "https://picsum.photos/id/1072/600/400",
//     activeAds: 9,
//     activeAdIds: [3, 4],
//     joined: "2024-08-03T11:15:00Z",
//     reviewsCount: 21,
//     rating: 4.3,
//     supportPercent: 0.7,
//     email: "kweku@appiahventures.example",
//     phonePrimary: "0201234567",
//     phoneSecondary: "0551234321",
//     paymentAccount: "CAL-22334455",
//     accountName: "Appiah Ventures",
//     accountNumber: "22334455",
//     nationalId: "KW-778899",
//     mobileNetwork: "Vodafone",
//     passkey: "pk_kweku",
//     notes: null,
//     applications: ["seller-tools"],
//     locations: ["Tamale"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.3,
//       totalReviews: 21,
//       ratingBreakdown: {
//         5: 12,
//         4: 6,
//         3: 2,
//         2: 1,
//         1: 0,
//       },
//     },
//     comments: [
//       {
//         date: "2024-11-01T15:20:00Z",
//         stars: 5,
//         text: "Very professional and helpful.",
//         user: {
//           name: "Ama Serwaa",
//           avatar: "https://randomuser.me/api/portraits/women/21.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 8,
//     name: "Efua Hammond",
//     username: "efua.h",
//     role: "user",
//     subRole: "buyer",
//     type: "basic",
//     verified: false,
//     level: "low",
//     badge: null,
//     businessName: "Hammond Home",
//     profileImage: "https://randomuser.me/api/portraits/women/31.jpg",
//     businessLogo: "https://picsum.photos/id/1080/200/200",
//     idFront: "https://picsum.photos/id/1081/600/400",
//     idBack: "https://picsum.photos/id/1082/600/400",
//     activeAds: 0,
//     activeAdIds: [],
//     joined: "2025-02-10T08:30:00Z",
//     reviewsCount: 0,
//     rating: 0,
//     supportPercent: 0.2,
//     email: "efua.h@example.com",
//     phonePrimary: "0551122334",
//     phoneSecondary: null,
//     paymentAccount: null,
//     accountName: null,
//     accountNumber: null,
//     nationalId: null,
//     mobileNetwork: "MTN",
//     passkey: "pk_efua",
//     notes: "Unverified account",
//     applications: [],
//     locations: ["Ho"],
//     muted: false,
//     deleted: false,
//     // no reviews yet
//   },

//   {
//     id: 9,
//     name: "Ama Serwaa",
//     username: "ama.serwaa",
//     role: "user",
//     subRole: "creator",
//     type: "premium",
//     verified: true,
//     level: "high",
//     badge: "Creator",
//     businessName: "Serwaa Studio",
//     profileImage: "https://randomuser.me/api/portraits/women/21.jpg",
//     businessLogo: "https://picsum.photos/id/1090/200/200",
//     idFront: "https://picsum.photos/id/1091/600/400",
//     idBack: "https://picsum.photos/id/1092/600/400",
//     activeAds: 12,
//     activeAdIds: [4, 5],
//     joined: "2024-12-01T09:45:00Z",
//     reviewsCount: 78,
//     rating: 4.6,
//     supportPercent: 0.8,
//     email: "ama.serwaa@studio.example",
//     phonePrimary: "0559988776",
//     phoneSecondary: "0249988776",
//     paymentAccount: "GCB-55779900",
//     accountName: "Serwaa Studio",
//     accountNumber: "55779900",
//     nationalId: "AS-556677",
//     mobileNetwork: "MTN",
//     passkey: "pk_ama",
//     notes: "Premium creator with many promoted ads",
//     applications: ["creator-studio", "promotions"],
//     locations: ["Accra"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.6,
//       totalReviews: 78,
//       ratingBreakdown: {
//         5: 50,
//         4: 18,
//         3: 6,
//         2: 2,
//         1: 2,
//       },
//     },
//     comments: [
//       {
//         date: "2025-03-12T13:00:00Z",
//         stars: 5,
//         text: "Loved the sponsored post — great engagement.",
//         user: {
//           name: "Daniel Kery",
//           avatar: "https://randomuser.me/api/portraits/men/12.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 10,
//     name: "Kwame Ofori",
//     username: "kwame.ofori",
//     role: "user",
//     subRole: "merchant",
//     type: "business",
//     verified: true,
//     level: "middle",
//     badge: null,
//     businessName: "Ofori Enterprises",
//     profileImage: "https://randomuser.me/api/portraits/men/45.jpg",
//     businessLogo: "https://picsum.photos/id/1100/200/200",
//     idFront: "https://picsum.photos/id/1101/600/400",
//     idBack: "https://picsum.photos/id/1102/600/400",
//     activeAds: 24,
//     activeAdIds: [2, 6],
//     joined: "2024-05-21T07:10:00Z",
//     reviewsCount: 33,
//     rating: 4.4,
//     supportPercent: 0.6,
//     email: "kwame.ofori@example",
//     phonePrimary: "0209988776",
//     phoneSecondary: null,
//     paymentAccount: "GTB-66778899",
//     accountName: "Ofori Enterprises",
//     accountNumber: "66778899",
//     nationalId: "KO-443322",
//     mobileNetwork: "Vodafone",
//     passkey: "pk_kwame",
//     notes: null,
//     applications: ["bulk-ads"],
//     locations: ["Takoradi"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.4,
//       totalReviews: 33,
//       ratingBreakdown: {
//         5: 20,
//         4: 8,
//         3: 3,
//         2: 1,
//         1: 1,
//       },
//     },
//     comments: [
//       {
//         date: "2024-08-10T10:30:00Z",
//         stars: 4,
//         text: "Prompt replies and flexible with payments.",
//         user: {
//           name: "John Agblo",
//           avatar: "https://randomuser.me/api/portraits/men/17.jpg",
//         },
//       },
//     ],
//   },

//   // Additional users 11-20 carry on as before; for brevity, only include review/comment examples
//   {
//     id: 11,
//     name: "Akua Addo",
//     username: "akua.addo",
//     role: "user",
//     subRole: "seller",
//     type: "business",
//     verified: true,
//     level: "high",
//     businessName: "Addo & Co",
//     profileImage: "https://randomuser.me/api/portraits/women/42.jpg",
//     businessLogo: "https://picsum.photos/id/1111/200/200",
//     idFront: "https://picsum.photos/id/1110/600/400",
//     idBack: "https://picsum.photos/id/1112/600/400",
//     activeAds: 40,
//     activeAdIds: [6],
//     joined: "2023-11-01T08:00:00Z",
//     reviewsCount: 400,
//     rating: 4.8,
//     supportPercent: 1.2,
//     email: "akua.addo@addoco.example",
//     phonePrimary: "0553344556",
//     phoneSecondary: "0243344556",
//     paymentAccount: "MTB-00112233",
//     accountName: "Addo & Co",
//     accountNumber: "00112233",
//     nationalId: "AA-990011",
//     mobileNetwork: "MTN",
//     passkey: "pk_akua",
//     notes: "High-volume seller",
//     applications: ["enterprise-ads"],
//     locations: ["Accra"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.8,
//       totalReviews: 400,
//       ratingBreakdown: {
//         5: 320,
//         4: 55,
//         3: 15,
//         2: 6,
//         1: 4,
//       },
//     },
//     comments: [
//       {
//         date: "2024-12-01T09:00:00Z",
//         stars: 5,
//         text: "Consistently fast shipping and great product quality.",
//         user: {
//           name: "Power Seller",
//           avatar: "https://randomuser.me/api/portraits/men/55.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 12,
//     name: "Kojo Asare",
//     username: "kojo.asare",
//     role: "user",
//     subRole: "repair-shop",
//     type: "basic",
//     verified: false,
//     level: "low",
//     businessName: "Kojo's Repairs",
//     profileImage: "https://randomuser.me/api/portraits/men/38.jpg",
//     businessLogo: "https://picsum.photos/id/1120/200/200",
//     idFront: "https://picsum.photos/id/1121/600/400",
//     idBack: "https://picsum.photos/id/1122/600/400",
//     activeAds: 1,
//     activeAdIds: [],
//     joined: "2025-06-01T09:00:00Z",
//     reviewsCount: 1,
//     rating: 3.9,
//     supportPercent: 0.1,
//     email: "kojo.repairs@example.com",
//     phonePrimary: "0501234567",
//     phoneSecondary: null,
//     paymentAccount: null,
//     accountName: null,
//     accountNumber: null,
//     nationalId: "KA-111222",
//     mobileNetwork: "AirtelTigo",
//     passkey: "pk_kojo",
//     notes: "New seller, unverified",
//     applications: [],
//     locations: ["Koforidua"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 3.9,
//       totalReviews: 1,
//       ratingBreakdown: {
//         5: 0,
//         4: 0,
//         3: 1,
//         2: 0,
//         1: 0,
//       },
//     },
//     comments: [
//       {
//         date: "2025-06-10T08:30:00Z",
//         stars: 3,
//         text: "Service ok, parts took longer than expected.",
//         user: {
//           name: "Test Low Activity",
//           avatar: "https://randomuser.me/api/portraits/men/50.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 13,
//     name: "Esi Owusu",
//     username: "esi.owusu",
//     role: "user",
//     subRole: "influencer",
//     type: "premium",
//     verified: true,
//     level: "high",
//     businessName: "Owusu Media",
//     profileImage: "https://randomuser.me/api/portraits/women/28.jpg",
//     businessLogo: "https://picsum.photos/id/1130/200/200",
//     idFront: "https://picsum.photos/id/1131/600/400",
//     idBack: "https://picsum.photos/id/1132/600/400",
//     activeAds: 15,
//     activeAdIds: [5],
//     joined: "2024-09-01T10:00:00Z",
//     reviewsCount: 120,
//     rating: 4.7,
//     supportPercent: 0.9,
//     email: "esi@owusumedia.example",
//     phonePrimary: "0243344111",
//     phoneSecondary: "0553344111",
//     paymentAccount: "GCB-44556677",
//     accountName: "Owusu Media",
//     accountNumber: "44556677",
//     nationalId: "EO-223344",
//     mobileNetwork: "Vodafone",
//     passkey: "pk_esi",
//     notes: null,
//     applications: ["creator-tools"],
//     locations: ["Accra"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.7,
//       totalReviews: 120,
//       ratingBreakdown: {
//         5: 85,
//         4: 25,
//         3: 6,
//         2: 3,
//         1: 1,
//       },
//     },
//     comments: [
//       {
//         date: "2024-10-10T14:20:00Z",
//         stars: 5,
//         text: "Great content and collaboration experience.",
//         user: {
//           name: "Ama Serwaa",
//           avatar: "https://randomuser.me/api/portraits/women/21.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 14,
//     name: "Nana Kusi",
//     username: "nana.kusi",
//     role: "user",
//     subRole: "trader",
//     type: "business",
//     verified: false,
//     level: "middle",
//     businessName: "Kusi Traders",
//     profileImage: "https://randomuser.me/api/portraits/men/27.jpg",
//     businessLogo: "https://picsum.photos/id/1140/200/200",
//     idFront: "https://picsum.photos/id/1141/600/400",
//     idBack: "https://picsum.photos/id/1142/600/400",
//     activeAds: 6,
//     activeAdIds: [],
//     joined: "2024-01-12T09:00:00Z",
//     reviewsCount: 5,
//     rating: 4.0,
//     supportPercent: 0.4,
//     email: "nana.kusi@example.com",
//     phonePrimary: "0273344556",
//     phoneSecondary: null,
//     paymentAccount: "GCB-77889900",
//     accountName: "Kusi Traders",
//     accountNumber: "77889900",
//     nationalId: "NK-556600",
//     mobileNetwork: "MTN",
//     passkey: "pk_nana",
//     notes: null,
//     applications: ["marketplace"],
//     locations: ["Takoradi"],
//     muted: false,
//     deleted: false,
//   },

//   {
//     id: 15,
//     name: "Efua Hammond (Backup)",
//     username: "efua.h.b",
//     role: "user",
//     subRole: "assistant",
//     type: "basic",
//     verified: false,
//     level: "low",
//     businessName: "Hammond Home Backup",
//     profileImage: "https://randomuser.me/api/portraits/women/32.jpg",
//     businessLogo: "https://picsum.photos/id/1150/200/200",
//     idFront: "https://picsum.photos/id/1151/600/400",
//     idBack: "https://picsum.photos/id/1152/600/400",
//     activeAds: 0,
//     activeAdIds: [],
//     joined: "2025-03-01T12:00:00Z",
//     reviewsCount: 0,
//     rating: 0,
//     supportPercent: 0.1,
//     email: "efua.backup@example.com",
//     phonePrimary: "0551122335",
//     phoneSecondary: null,
//     paymentAccount: null,
//     accountName: null,
//     accountNumber: null,
//     nationalId: null,
//     mobileNetwork: "MTN",
//     passkey: "pk_efua_b",
//     notes: "Test duplicate user",
//     applications: [],
//     locations: [],
//     muted: false,
//     deleted: false,
//   },

//   {
//     id: 16,
//     name: "Sandra Biom (Sales)",
//     username: "sbiom.sales",
//     role: "staff",
//     subRole: "sales",
//     type: "business",
//     verified: true,
//     level: "middle",
//     businessName: "Sandra Sales Co",
//     profileImage: "https://randomuser.me/api/portraits/women/25.jpg",
//     businessLogo: "https://picsum.photos/id/1160/200/200",
//     idFront: "https://picsum.photos/id/1161/600/400",
//     idBack: "https://picsum.photos/id/1162/600/400",
//     activeAds: 7,
//     activeAdIds: [],
//     joined: "2023-10-10T09:30:00Z",
//     reviewsCount: 45,
//     rating: 4.4,
//     supportPercent: 0.6,
//     email: "sandra.sales@example.com",
//     phonePrimary: "0203344112",
//     phoneSecondary: null,
//     paymentAccount: "GCB-33445566",
//     accountName: "Sandra Sales Co",
//     accountNumber: "33445566",
//     nationalId: "SB-990022",
//     mobileNetwork: "Vodafone",
//     passkey: "pk_sandra_sales",
//     notes: null,
//     applications: ["sales-portal"],
//     locations: ["Accra"],
//     muted: false,
//     deleted: false,
//   },

//   {
//     id: 17,
//     name: "Test Low Activity",
//     username: "test.low",
//     role: "user",
//     subRole: "tester",
//     type: "basic",
//     verified: false,
//     level: "low",
//     businessName: "Test Co",
//     profileImage: "https://randomuser.me/api/portraits/men/50.jpg",
//     businessLogo: "https://picsum.photos/id/1170/200/200",
//     idFront: null,
//     idBack: null,
//     activeAds: 0,
//     activeAdIds: [],
//     joined: "2022-01-01T00:00:00Z",
//     reviewsCount: 0,
//     rating: 0,
//     supportPercent: 0,
//     email: "test.low@example.com",
//     phonePrimary: "0000000000",
//     phoneSecondary: null,
//     paymentAccount: null,
//     accountName: null,
//     accountNumber: null,
//     nationalId: null,
//     mobileNetwork: null,
//     passkey: "pk_test_low",
//     notes: "Placeholder low-activity account",
//     applications: [],
//     locations: [],
//     muted: false,
//     deleted: false,
//   },

//   {
//     id: 18,
//     name: "Power Seller",
//     username: "power.seller",
//     role: "user",
//     subRole: "merchant",
//     type: "business",
//     verified: true,
//     level: "high",
//     businessName: "Power Goods Ltd",
//     profileImage: "https://randomuser.me/api/portraits/men/55.jpg",
//     businessLogo: "https://picsum.photos/id/1180/200/200",
//     idFront: "https://picsum.photos/id/1181/600/400",
//     idBack: "https://picsum.photos/id/1182/600/400",
//     activeAds: 3200,
//     activeAdIds: [1, 2, 3, 4, 5, 6],
//     joined: "2020-05-10T06:00:00Z",
//     reviewsCount: 3200,
//     rating: 4.9,
//     supportPercent: 2.2,
//     email: "sales@powergoods.example",
//     phonePrimary: "0247778888",
//     phoneSecondary: "0547778888",
//     paymentAccount: "GCB-55660011",
//     accountName: "Power Goods Ltd",
//     accountNumber: "55660011",
//     nationalId: "PS-556600",
//     mobileNetwork: "MTN",
//     passkey: "pk_power",
//     notes: "Top-performing seller with very high ad volume",
//     applications: ["enterprise-ads", "analytics"],
//     locations: ["Accra", "Kumasi"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.9,
//       totalReviews: 3200,
//       ratingBreakdown: {
//         5: 2600,
//         4: 400,
//         3: 120,
//         2: 50,
//         1: 30,
//       },
//     },
//     comments: [
//       {
//         date: "2024-05-20T07:45:00Z",
//         stars: 5,
//         text: "Huge selection and fast handling for bulk orders.",
//         user: {
//           name: "Admin Sample",
//           avatar: "https://randomuser.me/api/portraits/men/61.jpg",
//         },
//       },
//     ],
//   },

//   {
//     id: 19,
//     name: "Low Trust User",
//     username: "low.trust",
//     role: "user",
//     subRole: "buyer",
//     type: "basic",
//     verified: false,
//     level: "low",
//     businessName: null,
//     profileImage: "https://randomuser.me/api/portraits/women/60.jpg",
//     businessLogo: null,
//     idFront: null,
//     idBack: null,
//     activeAds: 0,
//     activeAdIds: [],
//     joined: "2025-09-20T10:00:00Z",
//     reviewsCount: 0,
//     rating: 0,
//     supportPercent: 0,
//     email: "low.trust@example",
//     phonePrimary: "0550000001",
//     phoneSecondary: null,
//     paymentAccount: null,
//     accountName: null,
//     accountNumber: null,
//     nationalId: null,
//     mobileNetwork: "MTN",
//     passkey: "pk_lowtrust",
//     notes: "New account flagged for verification",
//     applications: [],
//     locations: [],
//     muted: true,
//     deleted: false,
//   },

//   {
//     id: 20,
//     name: "Admin Sample",
//     username: "admin.sample",
//     role: "admin",
//     subRole: "campaign",
//     type: "premium",
//     verified: true,
//     level: "top",
//     businessName: "Platform Admin",
//     profileImage: "https://randomuser.me/api/portraits/men/61.jpg",
//     businessLogo: "https://picsum.photos/id/1190/200/200",
//     idFront: "https://picsum.photos/id/1191/600/400",
//     idBack: "https://picsum.photos/id/1192/600/400",
//     activeAds: 3,
//     activeAdIds: [2, 6],
//     joined: "2021-02-14T08:00:00Z",
//     reviewsCount: 10,
//     rating: 4.6,
//     supportPercent: 0.9,
//     email: "admin@platform.example",
//     phonePrimary: "0261112222",
//     phoneSecondary: null,
//     paymentAccount: "PLT-00011122",
//     accountName: "Platform Admin",
//     accountNumber: "00011122",
//     nationalId: "AD-00011",
//     mobileNetwork: "Vodafone",
//     passkey: "pk_admin",
//     notes: "System admin account (sample)",
//     applications: ["admin-tools", "audits"],
//     locations: ["Accra"],
//     muted: false,
//     deleted: false,

//     aggregatedReviews: {
//       averageRating: 4.6,
//       totalReviews: 10,
//       ratingBreakdown: {
//         5: 7,
//         4: 2,
//         3: 1,
//         2: 0,
//         1: 0,
//       },
//     },
//     comments: [
//       {
//         date: "2023-12-01T09:00:00Z",
//         stars: 5,
//         text: "Helpful admin tools, intuitive dashboard.",
//         user: {
//           name: "Daniel Kery",
//           avatar: "https://randomuser.me/api/portraits/men/12.jpg",
//         },
//       },
//     ],
//   },
// ];

import { getToken } from "./auth";

const API_BASE = `${import.meta.env.VITE_API_BASE || ""}/admin/users`;

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

/** Map backend user -> UI shape */
export function mapUserToUI(user, detailed = false) {
  if (!user) return null;

  // Safe helpers
  const safe = (v, fallback = null) =>
    v === undefined || v === null ? fallback : v;
  const asNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    const n = Number(String(v).replace(/[, ]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // Basic user info
  const wallet = user.wallet || {};
  const products = user.products || [];
  const reviews = user.reviews || [];

  // Calculate age from date of birth if available
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Determine verification status
  const verificationStatus = user.verificationStatus || "unverified";
  const isVerified = verificationStatus === "verified";

  // Calculate reviews stats
  const calculateReviewsStats = (reviews) => {
    if (!reviews.length) {
      return { averageRating: 0, totalReviews: 0, ratingBreakdown: {} };
    }

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach((review) => {
      const rating = Math.max(
        1,
        Math.min(5, asNumber(review.rating) || asNumber(review.stars))
      );
      breakdown[rating] = (breakdown[rating] || 0) + 1;
      totalRating += rating;
    });

    return {
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
      ratingBreakdown: breakdown,
    };
  };

  const reviewsStats = calculateReviewsStats(reviews);

  // Map to UI structure
  const mappedUser = {
    id: user.id,
    name:
      user.name ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Unknown User",
    username: user.username || user.email?.split("@")[0] || "user",
    role: user.role || "user",
    subRole: user.subRole || user.role || "user",
    type: user.type || user.subscriptionPlan || "basic",
    verified: isVerified,
    level: user.level || "low",
    badge: user.badge || null,
    businessName: user.businessName || user.companyName || null,
    profileImage:
      user.profileImage ||
      user.avatar ||
      user.profileImageUrl ||
      `https://randomuser.me/api/portraits/lego/${user.id % 10}.jpg`,
    businessLogo: user.businessLogo || user.companyLogo || null,
    idFront: user.idFront || user.idDocumentFront || null,
    idBack: user.idBack || user.idDocumentBack || null,
    activeAds: products.filter((p) => p.status === "active").length,
    activeAdIds: products.filter((p) => p.status === "active").map((p) => p.id),
    joined: user.createdAt || user.joinedAt || user.registeredAt,
    reviewsCount: reviewsStats.totalReviews,
    rating: reviewsStats.averageRating,
    supportPercent: asNumber(user.supportPercent) || 0,
    email: user.email,
    phonePrimary: user.phone || user.phoneNumber || user.phonePrimary,
    phoneSecondary: user.phoneSecondary || null,
    paymentAccount: user.paymentAccount || wallet.paymentMethod,
    accountName: user.accountName || user.bankAccountName,
    accountNumber: user.accountNumber || user.bankAccountNumber,
    nationalId: user.nationalId || user.idNumber,
    mobileNetwork: user.mobileNetwork || user.carrier,
    passkey: user.passkey || null,
    notes: user.adminNotes || user.notes,
    applications: user.applications || [],
    locations: [user.location, user.city, user.country].filter(Boolean),
    muted: user.isMuted || user.muted || false,
    deleted: user.deleted || false,
    aggregatedReviews: reviewsStats,
    comments: reviews.map((review) => ({
      date: review.createdAt || review.date,
      stars: review.rating || review.stars,
      text: review.comment || review.text || review.feedback,
      user: {
        name: review.reviewer?.name || "Anonymous",
        avatar: review.reviewer?.avatar || review.reviewer?.profileImage,
      },
    })),
    _raw: user,
  };

  // Add detailed info if requested
  if (detailed && user.activityStats) {
    mappedUser.activityStats = user.activityStats;
    mappedUser.verificationHistory = user.verificationHistory || [];
    mappedUser.moderationHistory = user.moderationHistory || [];
  }

  return mappedUser;
}

/** PUBLIC: Get users list */
export async function getUsers(query = {}) {
  try {
    // Build query string from object
    const queryString = Object.keys(query)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
      )
      .join("&");

    const path = queryString ? `?${queryString}` : "";
    const res = await fetchJson(path, { method: "GET" });

    const rawUsers = res?.data?.users || [];
    const users = rawUsers.map((user) => mapUserToUI(user)).filter(Boolean);

    return {
      users,
      pagination: res?.data?.pagination || null,
      filters: res?.data?.filters || null,
      raw: res,
    };
  } catch (err) {
    console.error("getUsers error:", err);
    return { users: [], pagination: null, filters: null, raw: null };
  }
}

/** PUBLIC: Get user stats */
export async function getUserStats() {
  try {
    const res = await fetchJson("/stats", { method: "GET" });
    return res?.data || res;
  } catch (err) {
    console.error("getUserStats error:", err);
    throw err;
  }
}

/** PUBLIC: Get single user with full details */
export async function getUser(id) {
  try {
    if (!id) throw new Error("User ID required");
    const res = await fetchJson(`/${encodeURIComponent(String(id))}`, {
      method: "GET",
    });
    const user = mapUserToUI(res?.data?.user || res?.data, true);
    return user;
  } catch (err) {
    console.error("getUser error:", err);
    throw err;
  }
}

/** PUBLIC: Verify user */
export async function verifyUser(id, status, notes = null) {
  try {
    if (!id || !status) throw new Error("User ID and status required");

    const res = await fetchJson(`/${encodeURIComponent(String(id))}/verify`, {
      method: "POST",
      body: { status, notes },
    });

    return res?.data?.user || res?.data || res;
  } catch (err) {
    console.error("verifyUser error:", err);
    throw err;
  }
}

/** PUBLIC: Update user level */
export async function updateUserLevel(id, level, notes = null) {
  try {
    if (!id || !level) throw new Error("User ID and level required");

    const res = await fetchJson(`/${encodeURIComponent(String(id))}/level`, {
      method: "PUT",
      body: { level, notes },
    });

    return res?.data?.user || res?.data || res;
  } catch (err) {
    console.error("updateUserLevel error:", err);
    throw err;
  }
}

/** PUBLIC: Mute/Unmute user */
export async function muteUser(id, action, reason = null, duration = null) {
  try {
    if (!id || !action) throw new Error("User ID and action required");

    const res = await fetchJson(`/${encodeURIComponent(String(id))}/mute`, {
      method: "POST",
      body: { action, reason, duration },
    });

    return res?.data || res;
  } catch (err) {
    console.error("muteUser error:", err);
    throw err;
  }
}

/** PUBLIC: Delete user */
export async function deleteUser(id, reason = null, permanent = false) {
  try {
    if (!id) throw new Error("User ID required");

    const res = await fetchJson(`/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
      body: { reason, permanent },
    });

    return res;
  } catch (err) {
    console.error("deleteUser error:", err);
    throw err;
  }
}

/** PUBLIC: Create admin user */
export async function createAdminFunc(userData) {
  try {
    const res = await fetchJson("/admin/create", {
      method: "POST",
      body: userData,
    });

    return res?.data || res;
  } catch (err) {
    console.error("createAdminFunc error:", err);
    throw err;
  }
}

/** PUBLIC: Export users */
export async function exportUsers(options = {}) {
  try {
    const queryString = Object.keys(options)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(options[key])}`
      )
      .join("&");

    const path = queryString ? `/export?${queryString}` : "/export";
    const res = await fetchJson(path, { method: "GET" });

    return res?.data || res;
  } catch (err) {
    console.error("exportUsers error:", err);
    throw err;
  }
}

// For backward compatibility - static data fallback
export const users = [];

export default {
  getUsers,
  getUser,
  getUserStats,
  verifyUser,
  updateUserLevel,
  muteUser,
  deleteUser,
  createAdminFunc,
  exportUsers,
  mapUserToUI,
  users,
};
