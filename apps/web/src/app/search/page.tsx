"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore, TaskCard, Input, Button, cn } from "@blocks/ui";
import type { Task, TaskStatus, TaskPriority } from "@blocks/core";
import { Search as SearchIcon, X, Filter } from "lucide-react";

const STATUS_FILTERS: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "design", label: "Design" },
  { value: "todo", label: "To-Do" },
  { value: "doing", label: "Doing" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_FILTERS: { value: TaskPriority; label: string }[] = [
  { value: "1", label: "P1" },
  { value: "2", label: "P2" },
  { value: "3", label: "P3" },
  { value: "4", label: "P4" },
  { value: "5", label: "P5" },
];

export default function SearchPage() {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);
  const completeTask = useTaskStore((state) => state.completeTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Filter tasks based on search query and filters
  const filteredTasks = useMemo(() => {
    let results = tasks;

    // Text search
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.location?.toLowerCase().includes(searchLower) ||
          t.category?.toLowerCase().includes(searchLower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      results = results.filter((t) => selectedStatuses.includes(t.status));
    }

    // Priority filter
    if (selectedPriorities.length > 0) {
      results = results.filter((t) => selectedPriorities.includes(t.priority));
    }

    // Sort by priority then by date
    return results.sort((a, b) => {
      const priorityDiff = parseInt(a.priority) - parseInt(b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [tasks, query, selectedStatuses, selectedPriorities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
  };

  const toggleStatus = (status: TaskStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const togglePriority = (priority: TaskPriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
  };

  const handleTaskToggle = async (task: Task) => {
    if (task.status === "done") {
      await updateTask(task.id, { status: "backlog", completedAt: undefined });
    } else {
      await completeTask(task.id);
    }
  };

  const handleTaskPress = (task: Task) => {
    router.push(`/edit-task/${task.id}`);
  };

  const hasActiveFilters = selectedStatuses.length > 0 || selectedPriorities.length > 0;

  return (
    <div className="px-4 py-6 pb-24">
      {/* Search input */}
      <form onSubmit={handleSearch} className="mb-4">
        <Input
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<SearchIcon className="h-4 w-4" />}
          rightIcon={
            query && (
              <button type="button" onClick={() => setQuery("")}>
                <X className="h-4 w-4 text-text-muted hover:text-text-primary" />
              </button>
            )
          }
        />
      </form>

      {/* Filter toggle */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(hasActiveFilters && "text-accent-magenta")}
        >
          <Filter className="mr-1 h-4 w-4" />
          Filters {hasActiveFilters && `(${selectedStatuses.length + selectedPriorities.length})`}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 space-y-4 rounded-lg bg-bg-secondary p-4">
          {/* Status filters */}
          <div>
            <p className="mb-2 text-sm font-medium text-text-secondary">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => toggleStatus(status.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm transition-colors",
                    selectedStatuses.includes(status.value)
                      ? "bg-accent-magenta text-white"
                      : "bg-bg-tertiary text-text-secondary hover:bg-border-hover"
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority filters */}
          <div>
            <p className="mb-2 text-sm font-medium text-text-secondary">Priority</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_FILTERS.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => togglePriority(priority.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm transition-colors",
                    selectedPriorities.includes(priority.value)
                      ? "bg-accent-magenta text-white"
                      : "bg-bg-tertiary text-text-secondary hover:bg-border-hover"
                  )}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent searches */}
      {!query && recentSearches.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-text-secondary">Recent searches</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <button
                key={search}
                onClick={() => handleRecentSearch(search)}
                className="rounded-full bg-bg-secondary px-3 py-1 text-sm text-text-secondary hover:bg-bg-tertiary"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="mb-4 text-sm text-text-muted">
        {filteredTasks.length} {filteredTasks.length === 1 ? "result" : "results"}
        {query && ` for "${query}"`}
      </p>

      {/* Results */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={handleTaskToggle}
            onPress={handleTaskPress}
            className="animate-fade-in"
          />
        ))}

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center">
            <SearchIcon className="mx-auto mb-4 h-12 w-12 text-text-muted" />
            <p className="text-text-secondary">No tasks found</p>
            {query && (
              <p className="mt-1 text-sm text-text-muted">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

