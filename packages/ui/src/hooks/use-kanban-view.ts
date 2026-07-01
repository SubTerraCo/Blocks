// ============================================================================
// BLOCKS - Kanban view store (N-0048 sort · N-0049 filter + saved views)
// Owns the active filter/sort, persists them per-session, and manages the set
// of named saved views (synced via Dexie). Board grouping/sorting is delegated
// to the pure core helpers so web + desktop behave identically.
// ============================================================================

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  KanbanFilter,
  KanbanSort,
  KanbanView,
  Task,
} from "@blocks/core";
import {
  DexieStorage,
  DEFAULT_KANBAN_FILTER,
  DEFAULT_KANBAN_SORT,
  buildKanbanBoard,
  isKanbanFilterActive,
  type KanbanBoard,
} from "@blocks/core";

const ACTIVE_VIEW_KEY = "blocks:kanbanActiveViewId";
const DEFAULT_VIEW_ID = "kanban-default";

function loadActiveViewId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(ACTIVE_VIEW_KEY);
  } catch {
    return null;
  }
}

function saveActiveViewId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.sessionStorage.setItem(ACTIVE_VIEW_KEY, id);
    else window.sessionStorage.removeItem(ACTIVE_VIEW_KEY);
  } catch {
    /* private mode */
  }
}

function buildDefaultView(): KanbanView {
  const now = new Date();
  return {
    id: DEFAULT_VIEW_ID,
    name: "All tasks",
    filter: { ...DEFAULT_KANBAN_FILTER },
    sort: { ...DEFAULT_KANBAN_SORT },
    isDefault: true,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  };
}

interface KanbanViewState {
  views: KanbanView[];
  activeViewId: string;
  /** Live edits to filter/sort not yet saved into a view. */
  filter: KanbanFilter;
  sort: KanbanSort;
  isLoading: boolean;

  loadViews: () => Promise<void>;
  setActiveView: (id: string) => void;
  setFilter: (filter: KanbanFilter) => void;
  setSort: (sort: KanbanSort) => void;
  clearFilter: () => void;
  /** Persist current filter+sort as a new named view. */
  saveAsView: (name: string) => Promise<KanbanView | null>;
  /** Update the active (non-default) view with current filter+sort. */
  updateActiveView: () => Promise<void>;
  deleteView: (id: string) => Promise<void>;

  isFilterActive: () => boolean;
  getBoard: (tasks: Task[]) => KanbanBoard;
}

export const useKanbanViewStore = create<KanbanViewState>((set, get) => {
  let storage: DexieStorage | null = null;
  const getStorage = async () => {
    if (!storage) {
      storage = DexieStorage.getInstance();
      await storage.init();
    }
    return storage;
  };

  const defaultView = buildDefaultView();

  return {
    views: [defaultView],
    activeViewId: DEFAULT_VIEW_ID,
    filter: { ...defaultView.filter },
    sort: { ...defaultView.sort },
    isLoading: false,

    loadViews: async () => {
      if (get().isLoading) return;
      // Snapshot live filter/sort so an in-flight load never clobbers edits the
      // user made while Dexie was resolving (fixes a first-paint race where a
      // quick sort/filter change snapped back once views finished loading).
      const before = {
        filter: get().filter,
        sort: get().sort,
        activeViewId: get().activeViewId,
      };
      set({ isLoading: true });
      try {
        const db = await getStorage();
        const stored = await db.getKanbanViews();
        const views = [buildDefaultView(), ...stored.filter((v) => !v.isDefault)];
        const restoredId = loadActiveViewId();
        const active = views.find((v) => v.id === restoredId) ?? views[0]!;
        const now = get();
        const userTouched =
          now.filter !== before.filter ||
          now.sort !== before.sort ||
          now.activeViewId !== before.activeViewId;
        set({
          views,
          isLoading: false,
          ...(userTouched
            ? {}
            : {
                activeViewId: active.id,
                filter: { ...active.filter },
                sort: { ...active.sort },
              }),
        });
      } catch {
        set({ isLoading: false });
      }
    },

    setActiveView: (id) => {
      const view = get().views.find((v) => v.id === id);
      if (!view) return;
      saveActiveViewId(id);
      set({
        activeViewId: id,
        filter: { ...view.filter },
        sort: { ...view.sort },
      });
    },

    setFilter: (filter) => set({ filter }),
    setSort: (sort) => set({ sort }),
    clearFilter: () => set({ filter: { ...DEFAULT_KANBAN_FILTER } }),

    saveAsView: async (name) => {
      const { filter, sort, views } = get();
      const now = new Date();
      const view: KanbanView = {
        id: uuidv4(),
        name: name.trim().slice(0, 60) || "Untitled view",
        filter,
        sort,
        isDefault: false,
        sortOrder: views.length,
        createdAt: now,
        updatedAt: now,
      };
      try {
        const db = await getStorage();
        await db.createKanbanView(view);
        saveActiveViewId(view.id);
        set((state) => ({
          views: [...state.views, view],
          activeViewId: view.id,
        }));
        return view;
      } catch {
        return null;
      }
    },

    updateActiveView: async () => {
      const { activeViewId, views, filter, sort } = get();
      const view = views.find((v) => v.id === activeViewId);
      if (!view || view.isDefault) return;
      const updated: KanbanView = { ...view, filter, sort, updatedAt: new Date() };
      try {
        const db = await getStorage();
        await db.updateKanbanView(updated);
        set((state) => ({
          views: state.views.map((v) => (v.id === activeViewId ? updated : v)),
        }));
      } catch {
        /* ignore */
      }
    },

    deleteView: async (id) => {
      const view = get().views.find((v) => v.id === id);
      if (!view || view.isDefault) return;
      try {
        const db = await getStorage();
        await db.deleteKanbanView(id);
        set((state) => {
          const views = state.views.filter((v) => v.id !== id);
          const fallback = views[0]!;
          const nextActive =
            state.activeViewId === id ? fallback.id : state.activeViewId;
          if (state.activeViewId === id) saveActiveViewId(fallback.id);
          return {
            views,
            activeViewId: nextActive,
            filter:
              state.activeViewId === id ? { ...fallback.filter } : state.filter,
            sort: state.activeViewId === id ? { ...fallback.sort } : state.sort,
          };
        });
      } catch {
        /* ignore */
      }
    },

    isFilterActive: () => isKanbanFilterActive(get().filter),
    getBoard: (tasks) => buildKanbanBoard(tasks, get().filter, get().sort),
  };
});

export { DEFAULT_VIEW_ID as KANBAN_DEFAULT_VIEW_ID };
