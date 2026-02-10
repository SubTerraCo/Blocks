"use client";

import { useState, useEffect, useRef } from "react";
import { useTaskStore, useOnlineStatus, TaskCard, cn } from "@blocks/ui";
import { GeminiService, type ChatMessage, type Task } from "@blocks/core";
import { Send, Wifi, WifiOff, Sparkles, Search, MessageSquare } from "lucide-react";

type TabType = "chat" | "search";

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  
  const isOnline = useOnlineStatus();
  const tasks = useTaskStore((state) => state.tasks);
  // Initialize Gemini service when API key is available
  useEffect(() => {
    // For now, we'll use a placeholder - in production, this would come from settings
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      setGeminiService(new GeminiService({ apiKey }));
    }
  }, []);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !geminiService || !isOnline) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setIsLoading(true);

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);

    try {
      const response = await geminiService.chat(userMessage, {
        tasks,
        currentTime: new Date(),
        workStartTime: "09:00",
        workEndTime: "17:00",
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks for search
  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.name.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Header with tabs */}
      <div className="border-b border-border-default bg-bg-secondary">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent-cyan" />
            <h1 className="text-lg font-semibold text-text-primary">AI Assistant</h1>
          </div>
          
          {/* Online status indicator */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
            isOnline ? "bg-accent-green/20 text-accent-green" : "bg-red-500/20 text-red-400"
          )}>
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex px-4 gap-4">
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex items-center gap-2 pb-3 border-b-2 transition-colors",
              activeTab === "chat"
                ? "border-accent-cyan text-accent-cyan"
                : "border-transparent text-text-tertiary hover:text-text-secondary"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={cn(
              "flex items-center gap-2 pb-3 border-b-2 transition-colors",
              activeTab === "search"
                ? "border-accent-cyan text-accent-cyan"
                : "border-transparent text-text-tertiary hover:text-text-secondary"
            )}
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          <ChatTab
            messages={messages}
            isLoading={isLoading}
            isOnline={isOnline}
            hasApiKey={!!geminiService}
          />
        ) : activeTab === "search" ? (
          <SearchTab
            query={searchQuery}
            setQuery={setSearchQuery}
            tasks={filteredTasks}
          />
        ) : null}
      </div>

      {/* Chat input - only show in chat tab */}
      {activeTab === "chat" && (
        <div className="border-t border-border-default bg-bg-secondary p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder={
                !isOnline
                  ? "AI is unavailable offline..."
                  : !geminiService
                  ? "Configure API key in settings..."
                  : "Ask about your tasks..."
              }
              disabled={!isOnline || !geminiService || isLoading}
              className={cn(
                "flex-1 bg-bg-tertiary border border-border-default rounded-xl px-4 py-3",
                "text-text-primary placeholder:text-text-muted",
                "focus:border-accent-cyan focus:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            <button
              onClick={handleSendMessage}
              disabled={!isOnline || !geminiService || !chatInput.trim() || isLoading}
              className={cn(
                "flex items-center justify-center h-12 w-12 rounded-xl",
                "bg-accent-cyan text-bg-primary",
                "hover:bg-accent-cyan/80 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Chat tab component
function ChatTab({
  messages,
  isLoading,
  isOnline,
  hasApiKey,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  isOnline: boolean;
  hasApiKey: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <WifiOff className="h-16 w-16 text-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          AI Unavailable Offline
        </h2>
        <p className="text-text-secondary max-w-sm">
          Connect to the internet to chat with your AI task assistant. Search still works offline!
        </p>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <Sparkles className="h-16 w-16 text-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Configure AI
        </h2>
        <p className="text-text-secondary max-w-sm">
          Add your Google Gemini API key in settings to enable AI-powered task scheduling and chat.
        </p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <Sparkles className="h-16 w-16 text-accent-cyan mb-4" />
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          AI Task Assistant
        </h2>
        <p className="text-text-secondary max-w-sm mb-6">
          Ask me to help schedule your tasks, prioritize your work, or get recommendations!
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "What should I focus on today?",
            "Schedule my tasks for tomorrow",
            "Which task is most urgent?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              className="px-4 py-2 rounded-xl bg-bg-tertiary text-text-secondary text-sm hover:bg-bg-elevated transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3",
              message.role === "user"
                ? "bg-accent-cyan text-bg-primary rounded-br-md"
                : "bg-bg-tertiary text-text-primary rounded-bl-md"
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p
              className={cn(
                "text-xs mt-1",
                message.role === "user" ? "text-bg-primary/70" : "text-text-muted"
              )}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-bg-tertiary rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

// Search tab component
function SearchTab({
  query,
  setQuery,
  tasks,
}: {
  query: string;
  setQuery: (query: string) => void;
  tasks: Task[];
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className={cn(
              "w-full bg-bg-tertiary border border-border-default rounded-xl pl-12 pr-4 py-3",
              "text-text-primary placeholder:text-text-muted",
              "focus:border-accent-magenta focus:outline-none"
            )}
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-text-muted mb-4" />
            <p className="text-text-secondary">
              {query ? "No tasks match your search" : "No tasks yet"}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => {
                // Navigate to edit task
                window.location.href = `/edit-task/${task.id}`;
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

