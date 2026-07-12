import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WebhookEvent {
    id: string;
    name: string;
    description: string;
    payloadSchema: object;
}

export interface WebhookSubscription {
    id: string;
    url: string;
    eventId: string;
    active: boolean;
}

export interface WebhookDelivery {
    id: string;
    eventId: string;
    timestamp: string;
    status: number;
    responsePreview: string;
}

interface WebhookCatalogStore {
    events: WebhookEvent[];
    subscriptions: WebhookSubscription[];
    deliveries: WebhookDelivery[];
    addSubscription: (url: string, eventId: string) => void;
    removeSubscription: (id: string) => void;
    testFire: (eventId: string) => void;
}

const generateId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const SEED_EVENTS: WebhookEvent[] = [
    {
        id: "resource.created",
        name: "resource.created",
        description: "Fired when a new learning resource is published.",
        payloadSchema: { resourceId: "number", title: "string", authorId: "number" },
    },
    {
        id: "user.registered",
        name: "user.registered",
        description: "Fired when a new user account is created.",
        payloadSchema: { userId: "number", email: "string", createdAt: "string" },
    },
    {
        id: "thread.replied",
        name: "thread.replied",
        description: "Fired when a channel thread receives a new reply.",
        payloadSchema: { threadId: "number", replyId: "number", authorId: "number" },
    },
    {
        id: "flag.raised",
        name: "flag.raised",
        description: "Fired when a piece of content is flagged for moderation.",
        payloadSchema: { targetId: "number", targetType: "string", reason: "string" },
    },
];

export const useWebhookCatalogStore = create<WebhookCatalogStore>()(
    persist(
        (set) => ({
            events: SEED_EVENTS,
            subscriptions: [],
            deliveries: [],
            addSubscription: (url: string, eventId: string) =>
                set((state) => ({
                    subscriptions: [
                        ...state.subscriptions,
                        {
                            id: generateId(),
                            url,
                            eventId,
                            active: true,
                        },
                    ],
                })),
            removeSubscription: (id: string) =>
                set((state) => ({
                    subscriptions: state.subscriptions.filter((s) => s.id !== id),
                })),
            testFire: (eventId: string) =>
                set((state) => ({
                    deliveries: [
                        {
                            id: generateId(),
                            eventId,
                            timestamp: new Date().toISOString(),
                            status: 200,
                            responsePreview: "OK",
                        },
                        ...state.deliveries,
                    ],
                })),
        }),
        { name: "lernchih-webhook-catalog" },
    ),
);

export default useWebhookCatalogStore;
