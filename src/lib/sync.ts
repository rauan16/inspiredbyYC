const SYNC_QUEUE_KEY = "ulys-sync-queue";

export type SyncAction =
  | { type: "profile_update"; payload: Record<string, unknown> }
  | { type: "portfolio_create"; payload: Record<string, unknown> }
  | { type: "portfolio_update"; id: string; payload: Record<string, unknown> }
  | { type: "portfolio_delete"; id: string }
  | { type: "portfolio_reorder"; items: { id: string; sort_order: number }[] }
  | { type: "saved_save"; opportunity_id: string }
  | { type: "saved_unsave"; opportunity_id: string };

function getQueue(): SyncAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncAction[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new CustomEvent("ulys-sync-queue-updated"));
}

export function enqueue(action: SyncAction) {
  const queue = getQueue();
  queue.push(action);
  saveQueue(queue);
}

export function getPendingActions(): SyncAction[] {
  return getQueue();
}

export function clearQueue() {
  saveQueue([]);
}

export function removeFromQueue(predicate: (action: SyncAction) => boolean) {
  const queue = getQueue().filter((a) => !predicate(a));
  saveQueue(queue);
}

export function getQueueLength(): number {
  return getQueue().length;
}
