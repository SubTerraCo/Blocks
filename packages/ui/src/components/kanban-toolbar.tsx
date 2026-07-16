// ============================================================================
// BLOCKS - Kanban toolbar (N-0048 sort · N-0049 filter + saved views)
// Shared by web + desktop. Reads/writes the useKanbanViewStore.
// ============================================================================

import { useState } from "react";
import type {
  KanbanSortField,
  KanbanSortDirection,
  AccessContext,
  TaskPriority,
} from "@blocks/core";
import { ArrowDownUp, ArrowUp, ArrowDown, Filter, RefreshCw, Plus, Trash2, ChevronDown } from "lucide-react";
import { Button } from "./button";
import { cn } from "../lib/utils";
import { useKanbanViewStore } from "../hooks/use-kanban-view";
import { useTaskStore } from "../hooks/use-task-store";

const TOOLBAR_BTN =
  "flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border-default bg-bg-secondary px-3.5 text-sm text-text-primary hover:border-accent-magenta";

const TOOLBAR_SELECT =
  "h-9 shrink-0 appearance-none rounded-lg border border-border-default bg-bg-secondary pl-3 pr-8 text-sm text-text-primary focus:border-accent-magenta focus:outline-none";

const SORT_FIELDS: { value: KanbanSortField; label: string }[] = [
  { value: "priority", label: "Priority" },
  { value: "dueDate", label: "Due date" },
  { value: "createdAt", label: "Created" },
  { value: "name", label: "Name" },
  { value: "tags", label: "Tag" },
  { value: "accessContexts", label: "Access" },
  { value: "category", label: "Category" },
  { value: "manual", label: "Manual" },
];

const PRIORITIES: TaskPriority[] = ["1", "2", "3", "4", "5"];
const ACCESS_CONTEXTS: AccessContext[] = ["home", "errand", "computer", "phone"];

export interface KanbanToolbarProps {
  availableTags: string[];
  availableCategories: string[];
  /** All task ids currently on the board — for the global "refresh sort". */
  allTaskIds: string[];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-accent-magenta bg-accent-magenta/15 text-accent-magenta"
          : "border-border-default bg-bg-tertiary text-text-secondary hover:border-accent-magenta/50",
      )}
    >
      {children}
    </button>
  );
}

export function KanbanToolbar({
  availableTags,
  availableCategories,
  allTaskIds,
}: KanbanToolbarProps) {
  const views = useKanbanViewStore((s) => s.views);
  const activeViewId = useKanbanViewStore((s) => s.activeViewId);
  const filter = useKanbanViewStore((s) => s.filter);
  const sort = useKanbanViewStore((s) => s.sort);
  const setActiveView = useKanbanViewStore((s) => s.setActiveView);
  const setFilter = useKanbanViewStore((s) => s.setFilter);
  const setSort = useKanbanViewStore((s) => s.setSort);
  const clearFilter = useKanbanViewStore((s) => s.clearFilter);
  const saveAsView = useKanbanViewStore((s) => s.saveAsView);
  const deleteView = useKanbanViewStore((s) => s.deleteView);
  const isFilterActive = useKanbanViewStore((s) => s.isFilterActive());
  const clearKanbanOrder = useTaskStore((s) => s.clearKanbanOrder);

  const [showFilter, setShowFilter] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  const activeView = views.find((v) => v.id === activeViewId);

  const toggleArray = <T,>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const refreshSort = () => {
    void clearKanbanOrder(allTaskIds);
  };

  return (
    <div className="flex flex-col gap-2.5" data-testid="kanban-toolbar">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* View selector */}
        <div className="relative min-w-[8.5rem]">
          <select
            value={activeViewId}
            onChange={(e) => setActiveView(e.target.value)}
            data-testid="kanban-view-select"
            className={cn(TOOLBAR_SELECT, "w-full min-w-[8.5rem] font-medium")}
          >
            {views.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        </div>

        {activeView && !activeView.isDefault && (
          <button
            onClick={() => void deleteView(activeView.id)}
            aria-label="Delete view"
            title="Delete view"
            className="rounded-lg border border-border-default p-2 text-text-muted hover:border-status-error hover:text-status-error"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {/* Sort field */}
        <div className="relative min-w-[9.5rem]">
          <select
            value={sort.field}
            onChange={(e) =>
              setSort({ ...sort, field: e.target.value as KanbanSortField })
            }
            data-testid="kanban-sort-field"
            className={cn(TOOLBAR_SELECT, "w-full min-w-[9.5rem]")}
          >
            {SORT_FIELDS.map((f) => (
              <option key={f.value} value={f.value}>
                Sort: {f.label}
              </option>
            ))}
          </select>
          <ArrowDownUp className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        </div>

        {/* Direction toggle */}
        <button
          onClick={() =>
            setSort({
              ...sort,
              direction: (sort.direction === "asc" ? "desc" : "asc") as KanbanSortDirection,
            })
          }
          data-testid="kanban-sort-direction"
          aria-label={`Sort ${sort.direction === "asc" ? "ascending" : "descending"}`}
          className={cn(TOOLBAR_BTN, "min-w-[5.75rem]")}
        >
          {sort.direction === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          {sort.direction === "asc" ? "Asc" : "Desc"}
        </button>

        {/* Refresh sort (clears manual overrides board-wide) */}
        <button
          onClick={refreshSort}
          data-testid="kanban-refresh-sort"
          title="Refresh sort — reapply to all columns"
          className={cn(TOOLBAR_BTN, "min-w-[6.75rem]")}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilter((s) => !s)}
          data-testid="kanban-filter-toggle"
          className={cn(
            TOOLBAR_BTN,
            "min-w-[5.75rem] border px-3.5",
            isFilterActive
              ? "border-accent-magenta bg-accent-magenta/10 text-accent-magenta"
              : "",
          )}
        >
          <Filter className="h-4 w-4" />
          Filter{isFilterActive ? " •" : ""}
        </button>

        {/* Save current filter+sort as a named view */}
        <button
          onClick={() => setShowSave((s) => !s)}
          data-testid="kanban-save-view-toggle"
          className={cn(TOOLBAR_BTN, "min-w-[7.25rem]")}
        >
          <Plus className="h-4 w-4" />
          Save view
        </button>
      </div>

      {showSave && (
        <div className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-secondary p-3">
          <input
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            placeholder="View name"
            data-testid="kanban-view-name"
            className="h-9 flex-1 rounded-lg border border-border-default bg-bg-primary px-3 text-sm text-text-primary focus:border-accent-magenta focus:outline-none"
          />
          <Button
            variant="primary"
            data-testid="kanban-save-view-confirm"
            onClick={async () => {
              if (!newViewName.trim()) return;
              await saveAsView(newViewName);
              setNewViewName("");
              setShowSave(false);
            }}
          >
            Save
          </Button>
        </div>
      )}

      {showFilter && (
        <div
          className="space-y-3 rounded-lg border border-border-default bg-bg-secondary p-3"
          data-testid="kanban-filter-panel"
        >
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Priority</p>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => (
                <Chip
                  key={p}
                  active={filter.priority.includes(p)}
                  onClick={() => setFilter({ ...filter, priority: toggleArray(filter.priority, p) })}
                >
                  P{p}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Access</p>
            <div className="flex flex-wrap gap-1.5">
              {ACCESS_CONTEXTS.map((c) => (
                <Chip
                  key={c}
                  active={filter.accessContexts.includes(c)}
                  onClick={() =>
                    setFilter({ ...filter, accessContexts: toggleArray(filter.accessContexts, c) })
                  }
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          {availableTags.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((t) => (
                  <Chip
                    key={t}
                    active={filter.tags.includes(t)}
                    onClick={() => setFilter({ ...filter, tags: toggleArray(filter.tags, t) })}
                  >
                    #{t}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {availableCategories.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {availableCategories.map((c) => (
                  <Chip
                    key={c}
                    active={filter.category.includes(c)}
                    onClick={() =>
                      setFilter({ ...filter, category: toggleArray(filter.category, c) })
                    }
                  >
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Type</p>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                active={filter.kind === "event"}
                onClick={() =>
                  setFilter({ ...filter, kind: filter.kind === "event" ? undefined : "event" })
                }
              >
                Event
              </Chip>
              <Chip
                active={filter.kind === "task"}
                onClick={() =>
                  setFilter({ ...filter, kind: filter.kind === "task" ? undefined : "task" })
                }
              >
                Task
              </Chip>
              <Chip
                active={filter.scheduled === "scheduled"}
                onClick={() =>
                  setFilter({
                    ...filter,
                    scheduled: filter.scheduled === "scheduled" ? undefined : "scheduled",
                  })
                }
              >
                Scheduled
              </Chip>
              <Chip
                active={filter.scheduled === "unscheduled"}
                onClick={() =>
                  setFilter({
                    ...filter,
                    scheduled: filter.scheduled === "unscheduled" ? undefined : "unscheduled",
                  })
                }
              >
                Unscheduled
              </Chip>
              <Chip
                active={filter.subtasks === "with"}
                onClick={() =>
                  setFilter({
                    ...filter,
                    subtasks: filter.subtasks === "with" ? undefined : "with",
                  })
                }
              >
                Has subtasks
              </Chip>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border-default pt-3">
            <label className="text-xs text-text-tertiary">Due from</label>
            <input
              type="date"
              value={filter.dueFrom ? filter.dueFrom.toISOString().slice(0, 10) : ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  dueFrom: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="h-8 rounded-lg border border-border-default bg-bg-primary px-2 text-sm text-text-primary"
            />
            <label className="text-xs text-text-tertiary">to</label>
            <input
              type="date"
              value={filter.dueTo ? filter.dueTo.toISOString().slice(0, 10) : ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  dueTo: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="h-8 rounded-lg border border-border-default bg-bg-primary px-2 text-sm text-text-primary"
            />
            <button
              onClick={clearFilter}
              data-testid="kanban-filter-clear"
              className="ml-auto text-xs text-text-muted underline hover:text-text-primary"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
