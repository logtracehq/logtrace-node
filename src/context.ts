import { AsyncLocalStorage } from "node:async_hooks";
import type { Logtrace } from "./client";
import type {
  APIResponse,
  CreateAuditLogRequest,
  CreateEventRequest,
  CreateSessionRequest,
  RequestDetails,
} from "./types";

// ─── RequestClient ─────────────────────────────────────────────────────────

interface RequestClientOptions {
  method?: string;
  endpoint?: string;
  clientIp?: string;
  userAgent?: string;
  operatingSystem?: string;
  /** Called lazily so it reflects the final status code. */
  getStatus?: () => number;
  headers?: Record<string, string>;
}

export class RequestClient {
  private readonly client: Logtrace;
  private readonly method: string;
  private readonly endpoint: string;
  private readonly clientIp: string;
  private readonly userAgent: string;
  private readonly operatingSystem: string;
  private readonly getStatus: (() => number) | undefined;
  /** Mutable — populated by the middleware after the handler finishes. */
  _headers: Record<string, string>;

  constructor(client: Logtrace, options: RequestClientOptions = {}) {
    this.client = client;
    this.method = options.method ?? "";
    this.endpoint = options.endpoint ?? "";
    this.clientIp = options.clientIp ?? "";
    this.userAgent = options.userAgent ?? "";
    this.operatingSystem = options.operatingSystem ?? "";
    this.getStatus = options.getStatus;
    this._headers = options.headers ?? {};
  }

  private buildRequestDetails(): RequestDetails {
    return {
      timestamp: new Date().toISOString(),
      httpMethod: this.method,
      httpEndpoint: this.endpoint,
      ipAddress: this.clientIp,
      clientUserAgent: this.userAgent,
      httpStatusCode: this.getStatus?.() ?? 0,
      operatingSystem: this.operatingSystem,
      requestHeaders: { ...this._headers },
    };
  }

  createEvent(
    req: CreateEventRequest,
    signal?: AbortSignal,
  ): Promise<APIResponse> {
    req.requestDetails = this.buildRequestDetails();
    return this.client.createEvent(req, signal);
  }

  createSession(
    req: CreateSessionRequest,
    signal?: AbortSignal,
  ): Promise<APIResponse> {
    req.requestDetails = this.buildRequestDetails();
    return this.client.createSession(req, signal);
  }

  createAuditLog(
    req: CreateAuditLogRequest,
    signal?: AbortSignal,
  ): Promise<APIResponse> {
    req.requestDetails = this.buildRequestDetails();
    return this.client.createAuditLog(req, signal);
  }
}

// ─── AsyncLocalStorage store ────────────────────────────────────────────────

/** @internal — exported only for use by the middleware. */
export const _storage = new AsyncLocalStorage<RequestClient>();

/**
 * Retrieve the {@link RequestClient} bound to the current async context.
 * Falls back to a bare `RequestClient` wrapping `fallback` if the middleware
 * has not been applied (useful in tests and non-HTTP contexts).
 *
 * @example
 * ```ts
 * const rc = fromContext(client);
 * await rc.createEvent({ actionName: 'login', ... });
 * ```
 */
export function fromContext(fallback: Logtrace): RequestClient {
  return _storage.getStore() ?? new RequestClient(fallback);
}
