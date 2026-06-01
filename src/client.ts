import { LogtraceError } from "./error";
import type {
  APIResponse,
  ClientOptions,
  CreateAuditLogRequest,
  CreateEventRequest,
  CreateSessionRequest,
} from "./types";

const DEFAULT_BASE_URL = "https://api.logtracehq.com/v1/developers";
const DEFAULT_TIMEOUT_MS = 10_000;

export class Client {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(apiKey: string, options: ClientOptions = {}) {
    if (!apiKey) {
      throw new Error("logtrace: API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Factory method — mirrors Go's `New()`.
   *
   * ```ts
   * const client = Client.new(process.env.LOGTRACE_API_KEY!);
   * ```
   */
  static new(apiKey: string, options?: ClientOptions): Client {
    return new Client(apiKey, options);
  }

  // ─── Internal HTTP helper ──────────────────────────────────────────────────

  private async post<T>(
    path: string,
    body: T,
    signal?: AbortSignal,
  ): Promise<APIResponse> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    // Merge caller signal with our own timeout signal where supported (Node 20+).
    const combinedSignal: AbortSignal =
      signal && typeof AbortSignal.any === "function"
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify(body),
        signal: combinedSignal,
      });
    } catch (err) {
      throw new Error(
        `logtrace: request failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      clearTimeout(timer);
    }

    let text: string;
    try {
      text = await response.text();
    } catch (err) {
      throw new Error(
        `logtrace: failed to read response: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (response.status >= 400) {
      let message = text;
      try {
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed.message) message = parsed.message;
      } catch {
        // fall back to raw text
      }
      throw new LogtraceError(response.status, message);
    }

    let parsed: APIResponse;
    try {
      parsed = JSON.parse(text) as APIResponse;
    } catch (err) {
      throw new Error(
        `logtrace: failed to parse response: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return { ...parsed, statusCode: response.status };
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  createEvent(
    req: CreateEventRequest,
    signal?: AbortSignal,
  ): Promise<APIResponse> {
    return this.post("/events", req, signal);
  }

  createSession(
    req: CreateSessionRequest,
    signal?: AbortSignal,
  ): Promise<APIResponse> {
    return this.post("/sessions", req, signal);
  }

  createAuditLog(
    req: CreateAuditLogRequest,
    signal?: AbortSignal,
  ): Promise<APIResponse> {
    return this.post("/audit-logs", req, signal);
  }
}
