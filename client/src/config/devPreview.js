export const isDevAuthBypass =
  import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === "true";

export const previewUser = {
  id: "dev-preview-user",
  email: "amina@conclave.local",
  display_name: "Amina Yusuf",
  avatar_url: null,
  bio: "Frontend preview account",
};

export const previewRoom = {
  id: "preview-room",
  name: "Product & Engineering",
  type: "group",
  member_count: 4,
  members: [
    previewUser,
    { id: "dev-victor", display_name: "Victor", avatar_url: null },
    { id: "dev-priya", display_name: "Priya", avatar_url: null },
    { id: "dev-daniel", display_name: "Daniel", avatar_url: null },
  ],
};

export const previewMessages = [
  {
    id: "dev-message-1",
    room_id: previewRoom.id,
    sender_id: previewUser.id,
    sender_name: "Amina Yusuf",
    content:
      "After testing both approaches, we'll keep Socket.IO for real-time events and REST for CRUD.",
    created_at: "2026-08-27T09:07:00.000Z",
  },
  {
    id: "dev-message-2",
    room_id: previewRoom.id,
    sender_id: "dev-victor",
    sender_name: "Victor",
    content:
      "Sounds good. This keeps our real-time path focused and reduces operational overhead.",
    created_at: "2026-08-27T09:17:00.000Z",
  },
  {
    id: "dev-message-3",
    room_id: previewRoom.id,
    sender_id: previewUser.id,
    sender_name: "Amina Yusuf",
    content:
      "@Priya can you confirm deployment readiness for the API gateway changes today?",
    created_at: "2026-08-27T09:27:00.000Z",
  },
  {
    id: "dev-message-4",
    room_id: previewRoom.id,
    sender_id: "dev-priya",
    sender_name: "Priya",
    content: "On it—validating the config and will update here by EOD.",
    created_at: "2026-08-27T09:37:00.000Z",
  },
  {
    id: "dev-message-5",
    room_id: previewRoom.id,
    sender_id: "dev-victor",
    sender_name: "Victor",
    content: "Here's the Q3 performance report.",
    created_at: "2026-08-27T09:42:00.000Z",
    attachments: [
      {
        id: "dev-att-1",
        filename: "Q3-perf-report.pdf",
        size: 245760,
        mime_type: "application/pdf",
        url: "https://placehold.co/800x1100?text=Q3+Report",
      },
    ],
  },
  {
    id: "dev-message-6",
    room_id: previewRoom.id,
    sender_id: previewUser.id,
    sender_name: "Amina Yusuf",
    content: "Screenshot from the staging deploy:",
    created_at: "2026-08-27T09:45:00.000Z",
    attachments: [
      {
        id: "dev-att-2",
        filename: "staging-deploy.png",
        size: 184320,
        mime_type: "image/png",
        url: "https://placehold.co/1200x800?text=Staging+Deploy",
      },
    ],
  },
  {
    id: "dev-message-7",
    room_id: previewRoom.id,
    sender_id: "dev-daniel",
    sender_name: "Daniel",
    content: "",
    created_at: "2026-08-27T09:48:00.000Z",
    attachments: [
      {
        id: "dev-att-3",
        filename: "api-spec-v2.zip",
        size: 1048576,
        mime_type: "application/zip",
        url: "https://placehold.co/400x300?text=api-spec-v2.zip",
      },
      {
        id: "dev-att-4",
        filename: "changelog.md",
        size: 4096,
        mime_type: "text/markdown",
        url: "https://placehold.co/600x400?text=changelog.md",
      },
    ],
  },
];

const listeners = new Map();
export const previewSocket = {
  connected: true,
  on(event, handler) {
    const handlers = listeners.get(event) || new Set();
    handlers.add(handler);
    listeners.set(event, handlers);
  },
  off(event, handler) {
    listeners.get(event)?.delete(handler);
  },
  emit(event, payload = {}) {
    if (event !== "send-message") return;
    const message = {
      id: `dev-message-${Date.now()}`,
      room_id: payload.roomId,
      sender_id: previewUser.id,
      sender_name: previewUser.display_name,
      content: payload.content,
      created_at: new Date().toISOString(),
    };
    queueMicrotask(() =>
      listeners
        .get("receive-message")
        ?.forEach((handler) => handler({ message })),
    );
  },
};
