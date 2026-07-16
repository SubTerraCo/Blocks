// ============================================================================
// BLOCKS - Anytype local HTTP API client (N-0050 · SB.EN.02.080.010)
// Talks to the Anytype Desktop API (default http://127.0.0.1:31009).
// ============================================================================

import { decodeAnytypeApiObject, encodeAnytypeApiObject } from "./mapper";
import {
  ANYTYPE_DEFAULT_API_VERSION,
  ANYTYPE_DEFAULT_BASE_URL,
  AnytypeUnavailableError,
  type AnytypeApiObject,
  type AnytypeClientConfig,
  type AnytypeSpace,
  type AnytypeTaskObject,
} from "./types";

export class AnytypeClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: AnytypeClientConfig) {
    this.baseUrl = (config.baseUrl ?? ANYTYPE_DEFAULT_BASE_URL).replace(/\/$/, "");
    this.headers = {
      Authorization: `Bearer ${config.apiKey}`,
      "Anytype-Version": config.apiVersion ?? ANYTYPE_DEFAULT_API_VERSION,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (cause) {
      throw new AnytypeUnavailableError(this.baseUrl, cause);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Anytype API ${method} ${path} failed (${response.status}): ${text}`);
    }
    return (await response.json()) as T;
  }

  /** Health check — resolves true when the local API answers. */
  async ping(): Promise<boolean> {
    try {
      await this.request<unknown>("GET", "/v1/spaces?limit=1");
      return true;
    } catch (error) {
      if (error instanceof AnytypeUnavailableError) return false;
      // API answered with an error status (e.g. bad key) — it is reachable.
      return true;
    }
  }

  async listSpaces(): Promise<AnytypeSpace[]> {
    const res = await this.request<{ data?: { id: string; name?: string }[] }>(
      "GET",
      "/v1/spaces",
    );
    return (res.data ?? []).map((s) => ({ id: s.id, name: s.name ?? s.id }));
  }

  /** List Task-type objects in a space (decoded to the normalized shape). */
  async listTaskObjects(spaceId: string): Promise<AnytypeTaskObject[]> {
    const res = await this.request<{ data?: AnytypeApiObject[] }>(
      "POST",
      `/v1/spaces/${encodeURIComponent(spaceId)}/search`,
      { types: ["task"], limit: 1000 },
    );
    return (res.data ?? []).map((raw) =>
      decodeAnytypeApiObject({ ...raw, space_id: raw.space_id ?? spaceId }),
    );
  }

  async createTaskObject(obj: AnytypeTaskObject): Promise<AnytypeTaskObject> {
    const res = await this.request<{ object?: AnytypeApiObject } & AnytypeApiObject>(
      "POST",
      `/v1/spaces/${encodeURIComponent(obj.spaceId)}/objects`,
      encodeAnytypeApiObject(obj),
    );
    const raw = res.object ?? res;
    return decodeAnytypeApiObject({ ...raw, space_id: raw.space_id ?? obj.spaceId });
  }

  async updateTaskObject(obj: AnytypeTaskObject): Promise<AnytypeTaskObject> {
    const res = await this.request<{ object?: AnytypeApiObject } & AnytypeApiObject>(
      "PATCH",
      `/v1/spaces/${encodeURIComponent(obj.spaceId)}/objects/${encodeURIComponent(obj.id)}`,
      encodeAnytypeApiObject(obj),
    );
    const raw = res.object ?? res;
    return decodeAnytypeApiObject({ ...raw, space_id: raw.space_id ?? obj.spaceId });
  }
}
