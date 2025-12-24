// ============================================================================
// BLOCKS - AI Service (Multi-Provider Support)
// ============================================================================

import type { Task, AISuggestion, AIProvider, Settings } from "../types";
import { calculateDuration } from "../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Get task duration, handling optional duration field
 */
function getTaskDuration(task: Task): number {
  if (task.blockSize && task.blockCount) {
    return calculateDuration(task.blockSize, task.blockCount);
  }
  return task.duration ?? 30; // Default 30 minutes
}

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model: string;
  baseUrl?: string; // For Ollama or custom endpoints
}

export interface TimeGap {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

export interface AIPromptContext {
  currentTime: Date;
  availableTasks: Task[];
  timeGap?: TimeGap;
  currentTask?: Task;
  userSettings: Pick<Settings, "workStartTime" | "workEndTime" | "workDays">;
}

/**
 * AIService handles task suggestions and time optimization
 * Supports multiple AI providers: OpenAI, Anthropic (Claude), Ollama
 */
export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * Update the AI configuration
   */
  setConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate a suggestion for filling a time gap
   */
  async suggestTaskForGap(context: AIPromptContext): Promise<AISuggestion | null> {
    if (!context.timeGap || context.availableTasks.length === 0) {
      return null;
    }

    const prompt = this.buildGapFillerPrompt(context);
    const response = await this.callAI(prompt);
    
    if (!response) return null;

    return this.parseGapSuggestion(response, context);
  }

  /**
   * Suggest switching tasks if user has spent too long on current task
   */
  async suggestTaskSwitch(context: AIPromptContext): Promise<AISuggestion | null> {
    if (!context.currentTask) return null;

    const prompt = this.buildTaskSwitchPrompt(context);
    const response = await this.callAI(prompt);
    
    if (!response) return null;

    return this.parseTaskSwitchSuggestion(response, context);
  }

  /**
   * Ask AI to help reprioritize tasks based on current context
   */
  async suggestPriorityReorder(context: AIPromptContext): Promise<AISuggestion | null> {
    const prompt = this.buildPriorityPrompt(context);
    const response = await this.callAI(prompt);
    
    if (!response) return null;

    return {
      id: uuidv4(),
      type: "priority_reorder",
      message: response,
      confidence: 0.7,
      reason: "Based on your current task list and time constraints",
      dismissed: false,
      createdAt: new Date(),
    };
  }

  /**
   * Build prompt for gap filling
   */
  private buildGapFillerPrompt(context: AIPromptContext): string {
    const { timeGap, availableTasks } = context;
    
    const taskList = availableTasks
      .filter((t) => t.status === "backlog" && getTaskDuration(t) <= (timeGap?.durationMinutes ?? 0))
      .map((t) => `- ${t.name} (${getTaskDuration(t)}min, priority ${t.priority})`)
      .join("\n");

    return `You are a productivity assistant. The user has a ${timeGap?.durationMinutes} minute gap before their next commitment.

Available tasks:
${taskList}

Based on priority and time fit, suggest ONE task they should work on. Respond with ONLY a JSON object:
{
  "taskName": "exact task name from list",
  "reason": "brief explanation why this task",
  "confidence": 0.0-1.0
}`;
  }

  /**
   * Build prompt for task switch suggestion
   */
  private buildTaskSwitchPrompt(context: AIPromptContext): string {
    const { currentTask, availableTasks } = context;
    
    const otherTasks = availableTasks
      .filter((t) => t.id !== currentTask?.id && t.status === "backlog")
      .slice(0, 5)
      .map((t) => `- ${t.name} (priority ${t.priority})`)
      .join("\n");

    return `The user has been working on "${currentTask?.name}" for longer than planned (${currentTask ? getTaskDuration(currentTask) : 0} minutes estimated).

Other pending tasks:
${otherTasks}

Should they switch tasks? Respond with ONLY a JSON object:
{
  "shouldSwitch": true/false,
  "suggestedTask": "task name or null",
  "reason": "brief explanation"
}`;
  }

  /**
   * Build prompt for priority reordering
   */
  private buildPriorityPrompt(context: AIPromptContext): string {
    const { availableTasks, currentTime, userSettings } = context;
    
    const taskList = availableTasks
      .filter((t) => t.status === "backlog")
      .map((t) => `- ${t.name}: duration=${getTaskDuration(t)}min, priority=${t.priority}, due=${t.dueDate?.toISOString() ?? "none"}`)
      .join("\n");

    return `Current time: ${currentTime.toISOString()}
Work hours: ${userSettings.workStartTime} - ${userSettings.workEndTime}

Tasks to prioritize:
${taskList}

Suggest an optimal order for these tasks considering urgency and time. Keep response under 100 words.`;
  }

  /**
   * Call the configured AI provider
   */
  private async callAI(prompt: string): Promise<string | null> {
    try {
      switch (this.config.provider) {
        case "openai":
          return await this.callOpenAI(prompt);
        case "anthropic":
          return await this.callAnthropic(prompt);
        case "ollama":
          return await this.callOllama(prompt);
        default:
          console.error("Unknown AI provider:", this.config.provider);
          return null;
      }
    } catch (error) {
      console.error("AI call failed:", error);
      return null;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string | null> {
    if (!this.config.apiKey) {
      console.error("OpenAI API key not configured");
      return null;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful productivity assistant. Always respond with valid JSON when asked.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content ?? null;
  }

  /**
   * Call Anthropic (Claude) API
   */
  private async callAnthropic(prompt: string): Promise<string | null> {
    if (!this.config.apiKey) {
      console.error("Anthropic API key not configured");
      return null;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model || "claude-3-haiku-20240307",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json() as { content: Array<{ text: string }> };
    return data.content[0]?.text ?? null;
  }

  /**
   * Call Ollama (local) API
   */
  private async callOllama(prompt: string): Promise<string | null> {
    const baseUrl = this.config.baseUrl || "http://localhost:11434";

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model || "llama2",
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json() as { response: string };
    return data.response ?? null;
  }

  /**
   * Parse gap suggestion response
   */
  private parseGapSuggestion(
    response: string,
    context: AIPromptContext
  ): AISuggestion | null {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]) as {
        taskName: string;
        reason: string;
        confidence: number;
      };
      
      const suggestedTask = context.availableTasks.find(
        (t) => t.name.toLowerCase() === parsed.taskName.toLowerCase()
      );

      return {
        id: uuidv4(),
        type: "fill_gap",
        message: `How about working on "${parsed.taskName}"?`,
        suggestedTaskId: suggestedTask?.id,
        suggestedTaskName: parsed.taskName,
        confidence: parsed.confidence ?? 0.8,
        reason: parsed.reason,
        dismissed: false,
        createdAt: new Date(),
      };
    } catch {
      console.error("Failed to parse AI gap suggestion response");
      return null;
    }
  }

  /**
   * Parse task switch suggestion response
   */
  private parseTaskSwitchSuggestion(
    response: string,
    context: AIPromptContext
  ): AISuggestion | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]) as {
        shouldSwitch: boolean;
        suggestedTask: string | null;
        reason: string;
      };

      if (!parsed.shouldSwitch) return null;

      const suggestedTask = context.availableTasks.find(
        (t) => t.name.toLowerCase() === parsed.suggestedTask?.toLowerCase()
      );

      return {
        id: uuidv4(),
        type: "switch_task",
        message: `Consider switching to "${parsed.suggestedTask}"`,
        suggestedTaskId: suggestedTask?.id,
        suggestedTaskName: parsed.suggestedTask ?? undefined,
        confidence: 0.7,
        reason: parsed.reason,
        dismissed: false,
        createdAt: new Date(),
      };
    } catch {
      console.error("Failed to parse AI switch suggestion response");
      return null;
    }
  }
}

