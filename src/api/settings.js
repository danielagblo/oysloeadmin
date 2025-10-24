export const settingsData = {
  privacyPolicy: {
    title: "Privacy Policy",
    date: "June 21, 2025",
    content: [
      "At Oysloe, your privacy is our priority. We are committed to protecting your personal information and ensuring transparency in how we collect, use, and store it.",
      "We collect basic information such as your name, email address, and activity on our platform to improve your experience and provide better services.",
      "Your data is never sold to third parties. We may share anonymized insights with trusted partners for analytics or system performance improvements.",
      "You have full control over your data. You can update or delete your account information at any time from your settings page.",
      "We use cookies to personalize your experience and analyze usage trends. You can choose to disable cookies from your browser settings.",
      "For any privacy concerns, contact our Data Protection Officer at privacy@oysloe.com.",
    ],
  },

  termsConditions: {
    title: "Terms & Conditions",
    date: "June 21, 2025",
    content: [
      "By accessing or using Oysloe, you agree to comply with these Terms and Conditions.",
      "Users must be at least 16 years old to register or make use of Oysloe services.",
      "You are responsible for maintaining the confidentiality of your account credentials and all activities that occur under your account.",
      "You agree not to misuse or interfere with the proper functioning of the platform, including any attempt to hack, overload, or disrupt our servers.",
      "All content uploaded or shared on Oysloe remains the property of the user but grants Oysloe a license to display it within the platform for service purposes.",
      "We reserve the right to suspend or terminate accounts that violate our community standards or applicable laws.",
      "Oysloe shall not be liable for any indirect or consequential damages arising from your use of the platform.",
      "These Terms may be updated periodically. Continued use of the platform implies acceptance of any changes.",
    ],
  },

  feedback: [
    {
      id: 1,
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
      name: "Daniel Kery",
      stars: 5,
      timeStamp: "2025-10-23T08:00:00Z", // Today 08:00
      comment: "Amazing interface! Everything feels smooth and professional.",
    },
    {
      id: 2,
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      name: "Lisa Owusu",
      stars: 4,
      timeStamp: "2025-10-22T14:30:00Z", // Yesterday 14:30
      comment: "Great app overall. I’d just love more customization options.",
    },
    {
      id: 3,
      avatar: "https://randomuser.me/api/portraits/men/13.jpg",
      name: "Michael Boateng",
      stars: 3,
      timeStamp: "2025-10-09T17:05:00Z", // ~2 weeks ago
      comment: "Good features, but some pages take a while to load.",
    },
    {
      id: 4,
      avatar: "https://randomuser.me/api/portraits/men/14.jpg",
      name: "Amara Mensah",
      stars: 5,
      timeStamp: "2025-10-20T10:15:00Z", // 3 days ago
      comment:
        "Exceptional support team — resolved my issue in under 10 minutes!",
    },
    {
      id: 5,
      avatar: "https://randomuser.me/api/portraits/men/15.jpg",
      name: "George Asare",
      stars: 2,
      timeStamp: "2025-09-25T09:00:00Z", // a month ago
      comment: "Needs improvement. App crashes sometimes during checkout.",
    },
    {
      id: 6,
      avatar: "https://randomuser.me/api/portraits/men/16.jpg",
      name: "Sally Nyarko",
      stars: 4,
      timeStamp: "2025-10-23T11:45:00Z", // Today 11:45
      comment: "Love the simplicity and clarity of design.",
    },
    {
      id: 7,
      avatar: "https://randomuser.me/api/portraits/men/17.jpg",
      name: "Nana Kwame",
      stars: 5,
      timeStamp: "2025-10-18T19:20:00Z", // 5 days ago
      comment: "Absolutely love it! Very user-friendly and efficient.",
    },
    {
      id: 8,
      avatar: "https://randomuser.me/api/portraits/men/18.jpg",
      name: "Kwesi Hammond",
      stars: 3,
      timeStamp: "2025-10-05T07:30:00Z", // ~18 days ago
      comment: "Decent experience, but notifications sometimes don’t appear.",
    },
    {
      id: 9,
      avatar: "https://randomuser.me/api/portraits/men/19.jpg",
      name: "Afia Adjei",
      stars: 4,
      timeStamp: "2025-10-01T21:10:00Z",
      comment: "Looks great and functions well. Just wish there was dark mode.",
    },
    {
      id: 10,
      avatar: "https://randomuser.me/api/portraits/men/20.jpg",
      name: "Prince Owusu",
      stars: 5,
      timeStamp: "2025-10-23T12:00:00Z", // Today 12:00
      comment: "Superb experience! Definitely recommending to friends.",
    },
    {
      id: 11,
      avatar: "https://randomuser.me/api/portraits/men/21.jpg",
      name: "Kojo Agyeman",
      stars: 2,
      timeStamp: "2025-10-15T08:50:00Z",
      comment: "Customer support took too long to respond.",
    },
    {
      id: 12,
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      name: "Ama Serwaa",
      stars: 4,
      timeStamp: "2025-10-07T16:40:00Z",
      comment: "Pretty solid overall. Could use a few more payment options.",
    },
  ],

  reports: [
    {
      id: 1,
      reporter: {
        name: "Ama Serwaa",
        avatar: "https://randomuser.me/api/portraits/men/23.jpg",
      },
      reportee: {
        name: "George Asare",
        avatar: "https://randomuser.me/api/portraits/men/24.jpg",
      },
      reason: "User posted misleading product information.",
      status: "Pending",
      createdAt: "2025-10-21T09:12:00Z",
      resolvedAt: null,
      resolvedBy: null,
      resolveNote: null,
    },
    {
      id: 2,
      reporter: {
        name: "Nana Kwame",
        avatar: "https://randomuser.me/api/portraits/men/25.jpg",
      },
      reportee: {
        name: "Sally Nyarko",
        avatar: "https://randomuser.me/api/portraits/men/26.jpg",
      },
      reason: "Offensive language used in chat.",
      status: "Resolved",
      createdAt: "2025-10-12T13:45:00Z",
      resolvedAt: "2025-10-13T09:02:00Z",
      resolvedBy: "Jeff07",
      resolveNote:
        "Reviewed conversation logs. User warned for offensive language and temporary suspension applied for repeated offenses.",
    },
    {
      id: 3,
      reporter: {
        name: "Daniel Kery",
        avatar: "https://randomuser.me/api/portraits/men/27.jpg",
      },
      reportee: {
        name: "Afia Adjei",
        avatar: "https://randomuser.me/api/portraits/men/28.jpg",
      },
      reason: "Repeated spamming of links in group channel.",
      status: "Pending",
      createdAt: "2025-10-08T18:30:00Z",
      resolvedAt: null,
      resolvedBy: null,
      resolveNote: null,
    },
    {
      id: 4,
      reporter: {
        name: "Lisa Owusu",
        avatar: "https://randomuser.me/api/portraits/men/29.jpg",
      },
      reportee: {
        name: "Michael Boateng",
        avatar: "https://randomuser.me/api/portraits/men/30.jpg",
      },
      reason: "Attempted to scam users with fake product listing.",
      status: "Pending",
      createdAt: "2025-09-28T10:05:00Z",
      resolvedAt: null,
      resolvedBy: null,
      resolveNote: null,
    },
  ],
};
