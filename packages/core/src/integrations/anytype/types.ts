// ============================================================================
// BLOCKS - Anytype sync types (N-0050)
// ============================================================================

import type {
  AccessContext,
  BlockSize,
  Task,
  TaskPriority,
  TaskStatus,
} from "../../types";

/**
 * Normalized Anytype task object — the shape the mapper and sync engine work
 * with, independent of the Anytype API wire format.
 */
export interface AnytypeTaskObject {
  id: string;
  spaceId: string;
  name: string;
  description?: string;
  notes?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: Date;
  scheduledAt?: Date;
  timeSpent: number;
  startedAt?: Date;
  completedAt?: Date;
  subtasks: Task["subtasks"];
  blockSize: BlockSize;
  blockCount: number;
  accessContexts: AccessContext[];
  updatedAt: Date;
  /** Back-link to the Blocks task id (blocks_task_id relation) */
  blocksTaskId?: string;
  /** Monotonic counter used as LWW tie-break */
  syncVersion?: number;
}

/** One property entry on the Anytype API wire format (lenient). */
export interface AnytypeApiProperty {
  key: string;
  format?: string;
  text?: string;
  number?: number;
  date?: string;
  checkbox?: boolean;
  select?: { name: string } | string | null;
  multi_select?: ({ name: string } | string)[];
}

/** Raw Anytype object as returned by the local HTTP API. */
export interface AnytypeApiObject {
  id: string;
  name?: string;
  space_id?: string;
  type?: { key?: string; name?: string } | string;
  properties?: AnytypeApiProperty[];
}

export interface AnytypeSpace {
  id: string;
  name: string;
}

export interface AnytypeClientConfig {
  /** Bearer token from Anytype Settings → API Keys */
  apiKey: string;
  /** Default: http://127.0.0.1:31009 */
  baseUrl?: string;
  /** Anytype-Version header. Default: 2025-11-08 */
  apiVersion?: string;
}

export const ANYTYPE_DEFAULT_BASE_URL = "http://127.0.0.1:31009";
export const ANYTYPE_DEFAULT_API_VERSION = "2025-11-08";

/** Thrown when the local Anytype API is unreachable. */
export class AnytypeUnavailableError extends Error {
  constructor(baseUrl: string, cause?: unknown) {
    super(
      `Anytype API unreachable at ${baseUrl}. Start Anytype Desktop and verify the API key.`,
    );
    this.name = "AnytypeUnavailableError";
    this.cause = cause;
  }
}
