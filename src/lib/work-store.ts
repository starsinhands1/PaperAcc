export const ACCOUNTS_KEY = "paper_acc_accounts_v1";
export const SESSION_KEY = "paper_acc_session_v1";
export const CREATIONS_KEY = "paper_acc_creations_v1";
export const SESSION_UPDATED_EVENT = "paper-acc-session-updated";
export const CREATIONS_UPDATED_EVENT = "paper-acc-creations-updated";

export type SessionRecord = {
  phone: string;
  loggedInAt: string;
};

export type CreationAsset = {
  type: "image" | "file";
  url: string;
  label: string;
  filename?: string;
  mimeType?: string;
};

export type CreationCategory =
  | "general-text-image"
  | "general-image-edit"
  | "paper-framework"
  | "paper-roadmap"
  | "paper-ppt";

export type CreationRecord = {
  id: string;
  ownerPhone: string;
  createdAt: string;
  updatedAt: string;
  category: CreationCategory;
  title: string;
  description: string;
  prompt?: string;
  sourceName?: string;
  coverUrl?: string;
  assets: CreationAsset[];
};

export type NewCreationRecord = Omit<
  CreationRecord,
  "id" | "ownerPhone" | "createdAt" | "updatedAt"
>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function dispatchClientEvent(name: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name));
}

export function notifySessionUpdated() {
  dispatchClientEvent(SESSION_UPDATED_EVENT);
}

export function notifyCreationsUpdated() {
  dispatchClientEvent(CREATIONS_UPDATED_EVENT);
}

export function getCurrentSession(): SessionRecord | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed.phone !== "string") return null;
    return {
      phone: parsed.phone,
      loggedInAt:
        typeof parsed.loggedInAt === "string"
          ? parsed.loggedInAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearCurrentSession() {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(SESSION_KEY);
  notifySessionUpdated();
}

export function loadAllCreations(): CreationRecord[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(CREATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.ownerPhone === "string" &&
        typeof item.title === "string" &&
        Array.isArray(item.assets),
    );
  } catch {
    return [];
  }
}

export function getCreationsByPhone(phone: string) {
  return loadAllCreations()
    .filter((item) => item.ownerPhone === phone)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCreationsForCurrentUser() {
  const session = getCurrentSession();
  if (!session) return [];
  return getCreationsByPhone(session.phone);
}

export function saveCreationsForCurrentUser(records: NewCreationRecord[]) {
  const session = getCurrentSession();
  if (!session || !records.length || !canUseStorage()) {
    return { saved: false, creations: [] as CreationRecord[], phone: session?.phone ?? null };
  }

  const existing = loadAllCreations();
  const now = new Date().toISOString();
  const creations = records.map((record, index) => ({
    ...record,
    id: buildCreationId(session.phone, index),
    ownerPhone: session.phone,
    createdAt: now,
    updatedAt: now,
  }));

  window.localStorage.setItem(
    CREATIONS_KEY,
    JSON.stringify([...creations, ...existing]),
  );
  notifyCreationsUpdated();

  return { saved: true, creations, phone: session.phone };
}

function buildCreationId(phone: string, index: number) {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${index}`;

  return `${phone}-${suffix}`;
}
