import { create } from "zustand";

type QueuedMutation = {
  id: string;
  type: "add" | "edit" | "delete";
  variables: Record<string, unknown>;
  timestamp: number;
};

type OfflineQueueState = {
  queue: QueuedMutation[];
  push: (mutation: Omit<QueuedMutation, "id" | "timestamp">) => void;
  remove: (id: string) => void;
  clear: () => void;
};

function loadQueue(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem("offline-mutation-queue");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedMutation[]) {
  localStorage.setItem("offline-mutation-queue", JSON.stringify(queue));
}

export const useOfflineQueue = create<OfflineQueueState>((set, get) => ({
  queue: loadQueue(), // начальное состояние из localStorage

  push: (mutation) => {
    const entry: QueuedMutation = {
      ...mutation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const next = [...get().queue, entry];
    saveQueue(next);
    set({ queue: next });
  },

  remove: (id) => {
    const next = get().queue.filter((m) => m.id !== id);
    saveQueue(next);
    set({ queue: next });
  },

  clear: () => {
    saveQueue([]);
    set({ queue: [] });
  },
}));