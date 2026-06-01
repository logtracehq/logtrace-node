// ─── Shared primitives ────────────────────────────────────────────────────────

export type Metadata = Record<string, unknown>;

// ─── Request / response shapes ────────────────────────────────────────────────

export interface RequestDetails {
  timestamp: string; // ISO-8601
  httpMethod: string;
  httpEndpoint: string;
  httpStatusCode: number;
  ipAddress: string;
  operatingSystem: string;
  clientUserAgent: string;
  geoIpLocation?: string;
  requestHeaders: Record<string, string>;
  requestDuration?: string;
  requestId?: string;
}

export interface CreateEventRequest {
  actionName: string;
  userId?: string;
  userName?: string;
  httpMethod: string;
  httpStatus: number;
  httpEndpoint?: string;
  clientIp: string;
  /** Populated automatically by the middleware / RequestClient. */
  requestDetails?: RequestDetails;
  clientUserAgent: string;
  type?: string;
  geoIpLocation?: string;
  metadata?: Metadata;
}

export interface CreateSessionRequest {
  loginAt: Date | string;
  status: string;
  userId?: string;
  userName?: string;
  deviceInfo?: string;
  ipAddress?: string;
  location?: string;
  /** Populated automatically by the middleware / RequestClient. */
  requestDetails?: RequestDetails;
  token?: string;
  metadata?: Metadata;
}

export interface CreateAuditLogRequest {
  action: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  /** Populated automatically by the middleware / RequestClient. */
  requestDetails?: RequestDetails;
  requestId?: string;
  metadata?: Metadata;
}

export interface APIResponse {
  message: string;
  statusCode: number;
}

// ─── Client options ───────────────────────────────────────────────────────────

export interface ClientOptions {
  /** Override the default base URL. */
  baseUrl?: string;
  /** HTTP timeout in milliseconds. Defaults to 10 000. */
  timeoutMs?: number;
}
