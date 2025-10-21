// src/api/supportData.js
export const supportData = {
  users: [
    {
      id: "u1",
      name: "Jessica Lincoln",
      role: "customer",
      verified: true,
      online: false,
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
      id: "u2",
      name: "Sandra Bimpo",
      role: "customer",
      verified: false,
      online: true,
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    },
    {
      id: "u3",
      name: "Jeff07",
      role: "support",
      verified: true,
      online: true,
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: "u4",
      name: "Jayson Laylo",
      role: "support",
      verified: true,
      online: false,
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    },
  ],

  cases: [
    {
      id: "case-1",
      userId: "u1",
      agents: ["u3"], // assigned support agents
      status: "Closed",
      createdAt: "2025-10-19T10:00:00Z",
      updatedAt: "2025-10-20T15:00:00Z",

      messages: [
        {
          id: "msg-1",
          senderId: "u1",
          text: "Hi, can I grab your product? I need this item to buy.",
          timestamp: "2025-10-19T10:05:00Z",
          type: "text",
          readBy: ["u3"], // Jeff has read this
        },
        {
          id: "msg-3",
          senderId: "u1",
          attachments: [
            {
              id: "file-1",
              type: "image",
              url: "https://randomuser.me/api/portraits/women/3.jpg",
            },
          ],
          timestamp: "2025-10-19T10:07:00Z",
          type: "attachment",
          readBy: [], // unread by Jeff
        },
        {
          id: "msg-2",
          senderId: "u3",
          text: "Sure! Which item are you referring to?",
          timestamp: "2025-10-19T10:06:00Z",
          type: "text",
          readBy: ["u1"], // customer read it
        },
      ],
    },

    {
      id: "case-2",
      userId: "u2",
      agents: ["u3", "u4"],
      status: "Open",
      createdAt: "2025-10-20T08:30:00Z",
      updatedAt: "2025-10-21T12:00:00Z",

      messages: [
        {
          id: "msg-1",
          senderId: "u2",
          text: "Is the iPhone 15 Pro Max available today?",
          timestamp: "2025-10-20T08:30:00Z",
          type: "text",
          readBy: ["u4"], // Jayson read it, Jeff hasn’t
        },
        {
          id: "msg-3",
          senderId: "u2",
          attachments: [
            {
              id: "aud-1",
              type: "audio",
              url: "/uploads/sandra-voice.mp3",
              duration: 14,
            },
          ],
          timestamp: "2025-10-20T08:33:00Z",
          type: "attachment",
          readBy: [], // unread by both support agents
        },
        {
          id: "msg-2",
          senderId: "u3",
          text: "Yes, it’s in stock. Would you like me to reserve one for you?",
          timestamp: "2025-10-20T08:32:00Z",
          type: "text",
          readBy: ["u2"],
        },
      ],
    },
  ],
};
