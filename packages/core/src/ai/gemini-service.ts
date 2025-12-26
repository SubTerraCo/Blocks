// ============================================================================
// BLOCKS - Google Gemini AI Service
// AI-powered task scheduling and chat assistant
// ============================================================================

import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import type { Task } from "../types";

/**
 * Error thrown when AI features are used while offline
 */
export class AIOfflineError extends Error {
  constructor(message: string = "AI features require an internet connection") {
    super(message);
    this.name = "AIOfflineError";
  }
}

/**
 * Configuration for GeminiService
 */
export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

/**
 * Chat message format
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Task scheduling suggestion from AI
 */
export interface SchedulingSuggestion {
  taskId: string;
  suggestedStartTime: Date;
  suggestedDuration: number;
  reason: string;
  priority: number;
}

/**
 * Context provided to AI for task scheduling
 */
export interface TaskContext {
  tasks: Task[];
  currentTime: Date;
  workStartTime?: string; // "09:00"
  workEndTime?: string;   // "17:00"
  userPreferences?: string;
}

/**
 * Check if the browser/app is online
 */
function isOnline(): boolean {
  if (typeof navigator !== "undefined") {
    return navigator.onLine;
  }
  return true; // Assume online in Node.js environments
}

/**
 * Google Gemini AI Service
 * 
 * Provides AI-powered features:
 * - Chat interface for task management
 * - Automatic task scheduling suggestions
 * - Priority recommendations
 */
export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private chatHistory: ChatMessage[] = [];

  constructor(config: GeminiConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = this.client.getGenerativeModel({
      model: config.model || "gemini-pro",
    });
  }

  /**
   * Check online status before making API calls
   */
  private ensureOnline(): void {
    if (!isOnline()) {
      throw new AIOfflineError();
    }
  }

  /**
   * Send a chat message and get a response
   */
  async chat(message: string, context?: TaskContext): Promise<string> {
    this.ensureOnline();

    // Build context prompt
    let contextPrompt = "";
    if (context) {
      const taskSummary = context.tasks
        .slice(0, 10)
        .map((t) => `- ${t.name} (${t.status}, priority ${t.priority})`)
        .join("\n");

      contextPrompt = `
You are Blocks AI, a helpful task management assistant. You help users organize their tasks, schedule their day, and stay productive.

Current context:
- Current time: ${context.currentTime.toLocaleString()}
- Work hours: ${context.workStartTime || "09:00"} to ${context.workEndTime || "17:00"}
- User's tasks:
${taskSummary || "No tasks yet"}

User preferences: ${context.userPreferences || "None specified"}

Please provide helpful, concise responses. When discussing tasks, reference them by name.
`;
    }

    // Add user message to history
    this.chatHistory.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    try {
      const prompt = contextPrompt
        ? `${contextPrompt}\n\nUser: ${message}`
        : message;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Add assistant response to history
      this.chatHistory.push({
        role: "assistant",
        content: response,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      // Remove the failed user message
      this.chatHistory.pop();
      throw error;
    }
  }

  /**
   * Get task scheduling suggestions based on current tasks
   */
  async suggestSchedule(context: TaskContext): Promise<SchedulingSuggestion[]> {
    this.ensureOnline();

    const taskList = context.tasks
      .filter((t) => t.status === "doing" || t.status === "todo")
      .map((t) => ({
        id: t.id,
        name: t.name,
        priority: t.priority,
        duration: t.duration || 30,
        status: t.status,
      }));

    if (taskList.length === 0) {
      return [];
    }

    const prompt = `
You are a task scheduling AI. Given the following tasks, suggest an optimal schedule starting from the current time.

Current time: ${context.currentTime.toISOString()}
Work hours: ${context.workStartTime || "09:00"} to ${context.workEndTime || "17:00"}

Tasks to schedule:
${JSON.stringify(taskList, null, 2)}

Respond with a JSON array of scheduling suggestions in this exact format:
[
  {
    "taskId": "task-id-here",
    "suggestedStartTime": "2024-01-01T09:00:00.000Z",
    "suggestedDuration": 30,
    "reason": "Brief explanation",
    "priority": 1
  }
]

Sort by priority (1 = highest). Only include the JSON array, no other text.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn("Could not parse scheduling suggestions from AI response");
        return [];
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      return suggestions.map((s: { taskId: string; suggestedStartTime: string; suggestedDuration: number; reason: string; priority: number }) => ({
        ...s,
        suggestedStartTime: new Date(s.suggestedStartTime),
      }));
    } catch (error) {
      console.error("Error getting scheduling suggestions:", error);
      return [];
    }
  }

  /**
   * Get a quick task recommendation
   */
  async getQuickRecommendation(tasks: Task[]): Promise<string> {
    this.ensureOnline();

    const activeTasks = tasks.filter(
      (t) => t.status === "doing" || t.status === "todo"
    );

    if (activeTasks.length === 0) {
      return "You have no active tasks. Add some tasks to get started!";
    }

    const taskNames = activeTasks
      .slice(0, 5)
      .map((t) => `"${t.name}" (priority ${t.priority})`)
      .join(", ");

    const prompt = `Given these tasks: ${taskNames}, give a brief one-sentence recommendation on which to focus on next and why. Be direct and actionable.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      return "I couldn't generate a recommendation right now. Try focusing on your highest priority task!";
    }
  }

  /**
   * Get chat history
   */
  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  /**
   * Clear chat history
   */
  clearChatHistory(): void {
    this.chatHistory = [];
  }

  /**
   * Check if AI is available (online)
   */
  static isAvailable(): boolean {
    return isOnline();
  }
}

export default GeminiService;

