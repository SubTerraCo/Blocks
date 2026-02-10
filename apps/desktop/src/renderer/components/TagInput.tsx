// ============================================================================
// BLOCKS - Tag Input Component
// Advanced tag input with suggestions and filtering
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@blocks/ui";
import { X, Plus, Hash } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface TagData {
  id: string;
  name: string;
  color: string;
  usageCount?: number;
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: TagData[];
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

// ============================================================================
// Predefined colors
// ============================================================================

const TAG_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

function getTagColor(tagName: string): string {
  // Generate consistent color based on tag name
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

// ============================================================================
// Component
// ============================================================================

export function TagInput({
  tags,
  onChange,
  suggestions = [],
  maxTags = 10,
  placeholder = "Add tag...",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(
    (s) =>
      !tags.includes(s.name) &&
      s.name.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  // Show suggestions from current tags that match input
  const showCreateOption =
    inputValue.trim() &&
    !tags.includes(inputValue.trim()) &&
    !filteredSuggestions.some(
      (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
  
  const addTag = useCallback((tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    
    onChange([...tags, trimmed]);
    setInputValue("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [tags, maxTags, onChange]);
  
  const removeTag = useCallback((tagName: string) => {
    onChange(tags.filter((t) => t !== tagName));
  }, [tags, onChange]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        addTag(filteredSuggestions[highlightedIndex].name);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const maxIndex = showCreateOption
        ? filteredSuggestions.length
        : filteredSuggestions.length - 1;
      setHighlightedIndex((prev) => Math.min(prev + 1, maxIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, -1));
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className={cn("relative", className)}>
      {/* Tags container */}
      <div
        className={cn(
          "flex flex-wrap gap-2 rounded-lg border border-border-default bg-bg-tertiary px-3 py-2",
          "focus-within:border-accent-magenta focus-within:ring-1 focus-within:ring-accent-magenta/20"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Existing tags */}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: getTagColor(tag) }}
          >
            <Hash className="h-3 w-3" />
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="ml-0.5 hover:opacity-80"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        {/* Input */}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[100px] bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        )}
      </div>
      
      {/* Suggestions dropdown */}
      {isOpen && (filteredSuggestions.length > 0 || showCreateOption) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-border-default bg-bg-secondary shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => addTag(suggestion.name)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                highlightedIndex === index
                  ? "bg-accent-magenta/10 text-text-primary"
                  : "text-text-secondary hover:bg-bg-tertiary"
              )}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: suggestion.color || getTagColor(suggestion.name) }}
              />
              <span className="flex-1">{suggestion.name}</span>
              {suggestion.usageCount !== undefined && (
                <span className="text-xs text-text-muted">
                  {suggestion.usageCount} tasks
                </span>
              )}
            </button>
          ))}
          
          {showCreateOption && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left text-sm border-t border-border-default transition-colors",
                highlightedIndex === filteredSuggestions.length
                  ? "bg-accent-magenta/10 text-text-primary"
                  : "text-text-secondary hover:bg-bg-tertiary"
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Create "{inputValue}"</span>
            </button>
          )}
        </div>
      )}
      
      {/* Helper text */}
      {tags.length >= maxTags && (
        <p className="text-xs text-text-muted mt-1">
          Maximum {maxTags} tags reached
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Tag Filter Component
// ============================================================================

interface TagFilterProps {
  availableTags: TagData[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

export function TagFilter({
  availableTags,
  selectedTags,
  onChange,
  className,
}: TagFilterProps) {
  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };
  
  if (availableTags.length === 0) return null;
  
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.name)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all",
              isSelected
                ? "text-white"
                : "bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80"
            )}
            style={{
              backgroundColor: isSelected ? (tag.color || getTagColor(tag.name)) : undefined,
            }}
          >
            <Hash className="h-3 w-3" />
            {tag.name}
            {tag.usageCount !== undefined && (
              <span className={cn(
                "ml-1",
                isSelected ? "opacity-75" : "text-text-muted"
              )}>
                {tag.usageCount}
              </span>
            )}
          </button>
        );
      })}
      
      {selectedTags.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

