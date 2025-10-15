export const orderPageInfo = {
  subscription: [
    {
      name: "Basic 3x",
      tagLines: [
        "Post up to 3 ads per month",
        "Each ad stays promoted for 7 days",
      ],
      discountedPrice: 35,
      actualPrice: 50,
    },
    {
      name: "Business 4x",
      tagLines: [
        "Pro vendor support & analytics",
        "All ads promoted for 30 days",
      ],
      discountedPrice: 80,
      actualPrice: 100,
    },
    {
      name: "Platinum 10x",
      tagLines: ["Unlimited ad uploads", "Boost visibility across all regions"],
      discountedPrice: 200,
      actualPrice: 250,
    },
  ],

  periods: ["All", "Today", "Yesterday", "7 days", "1 month"],

  dataCards: [
    {
      img: "https://randomuser.me/api/portraits/men/12.jpg",
      name: "Kwame Asante",
      buisnessName: "Asante Ventures",
      subscription: "Platinum",
      createdAt: "2025-10-15T10:52:00Z", // ~1h08m before 12:00
      ads: { active: 920, taken: 870, pending: 32 },
      buisnesses: { platinum: 450, buisness: 320, basic: 150 },
    },
    {
      img: "https://randomuser.me/api/portraits/women/45.jpg",
      name: "Afia Serwaa",
      buisnessName: "Serwaa Trends",
      subscription: "Business",
      createdAt: "2025-10-15T09:30:00Z", // earlier same day
      ads: { active: 310, taken: 290, pending: 14 },
      buisnesses: { platinum: 200, buisness: 250, basic: 80 },
    },
    {
      img: "https://randomuser.me/api/portraits/men/23.jpg",
      name: "Kojo Mensah",
      buisnessName: "KM Auto Parts",
      subscription: "Basic",
      createdAt: "2025-10-14T15:20:00Z", // 1 day ago
      ads: { active: 150, taken: 120, pending: 10 },
      buisnesses: { platinum: 50, buisness: 80, basic: 90 },
    },
    {
      img: "https://randomuser.me/api/portraits/women/33.jpg",
      name: "Adwoa Nyarko",
      buisnessName: "Nyarko Foods",
      subscription: "Business",
      createdAt: "2025-10-13T11:05:00Z", // 2 days ago
      ads: { active: 600, taken: 540, pending: 26 },
      buisnesses: { platinum: 300, buisness: 250, basic: 50 },
    },
    {
      img: "https://randomuser.me/api/portraits/men/40.jpg",
      name: "Yaw Boateng",
      buisnessName: "Boateng Electronics",
      subscription: "Platinum",
      createdAt: "2025-09-30T08:00:00Z", // ~2 weeks ago
      ads: { active: 870, taken: 820, pending: 42 },
      buisnesses: { platinum: 400, buisness: 300, basic: 170 },
    },
    {
      img: "https://randomuser.me/api/portraits/women/15.jpg",
      name: "Esi Darko",
      buisnessName: "Esi Collections",
      subscription: "Basic",
      createdAt: "2025-10-15T11:40:00Z", // very recent (20m ago)
      ads: { active: 200, taken: 180, pending: 12 },
      buisnesses: { platinum: 70, buisness: 90, basic: 60 },
    },
  ],
};
