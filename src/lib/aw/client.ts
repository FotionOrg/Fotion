import type { AwBucketResponse, AwEvent, AwInfo } from "./model";

interface AwProxyRequest {
  baseUrl: string;
  method: string;
  path: string;
  body?: unknown;
}

export class ActivityWatchClient {
  constructor(private readonly baseUrl: string) {}

  getInfo(): Promise<AwInfo> {
    return this.request<AwInfo>("/api/0/info", { method: "GET" });
  }

  getBuckets(): Promise<AwBucketResponse> {
    return this.request<AwBucketResponse>("/api/0/buckets/", { method: "GET" });
  }

  getEvents(bucketId: string, start: Date, end: Date): Promise<AwEvent[]> {
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
    });
    return this.request<AwEvent[]>(`/api/0/buckets/${encodeURIComponent(bucketId)}/events?${params}`, {
      method: "GET",
    });
  }

  query(timeperiods: string[], query: string[]): Promise<unknown> {
    return this.request<unknown>("/api/0/query/", {
      method: "POST",
      body: JSON.stringify({ timeperiods, query }),
      headers: { "content-type": "application/json" },
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    if (isTauriRuntime()) {
      const { invoke } = await import("@tauri-apps/api/core");
      const proxyRequest: AwProxyRequest = {
        baseUrl: this.baseUrl,
        method: init.method ?? "GET",
        path,
      };
      if (init.body) {
        proxyRequest.body = JSON.parse(String(init.body));
      }
      return invoke<T>("aw_request", { request: proxyRequest });
    }

    const response = await fetch(this.toBrowserUrl(path), init);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ActivityWatch returned ${response.status}: ${text}`);
    }
    return response.json() as Promise<T>;
  }

  private toBrowserUrl(path: string): string {
    if (import.meta.env.DEV && isDefaultLocalAwUrl(this.baseUrl)) {
      return path.replace(/^\/api/, "/aw-api");
    }
    return `${this.baseUrl.replace(/\/+$/, "")}${path}`;
  }
}

export function isDefaultLocalAwUrl(baseUrl: string): boolean {
  const normalized = baseUrl.replace(/\/+$/, "");
  return normalized === "http://localhost:5600" || normalized === "http://127.0.0.1:5600";
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && Boolean(window.__TAURI_INTERNALS__);
}
