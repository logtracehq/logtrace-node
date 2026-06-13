export type Metadata = Record<string, unknown>;

export interface RequestDetails {
  timestamp: string;
  http_method: string;
  http_endpoint: string;
  http_status_code: number;
  ip_address: string;
  operating_system: string;
  client_user_agent: string;
  geo_ip_location?: string;
  request_headers: Record<string, string>;
  request_duration?: string;
  request_id?: string;
}

export interface CreateEventRequest {
  name: string;
  user_id?: string;
  username?: string;
  http_method: string;
  http_status: number;
  http_endpoint?: string;
  client_ip: string;
  request_details?: RequestDetails;
  client_user_agent: string;
  type?: string;
  geo_ip_location?: string;
  metadata?: Metadata;
}

export interface CreateSessionRequest {
  login_at: string;
  logout_at: string;
  status: string;
  user_id?: string;
  username?: string;
  device_info?: string;
  ip_address?: string;
  location?: string;
  request_details?: RequestDetails;
  token?: string;
  metadata?: Metadata;
}

export interface CreateAuditLogRequest {
  name: string;
  timestamp: string;
  user_id?: string;
  username?: string;
  ip_address?: string;
  request_details?: RequestDetails;
  request_id?: string;
  metadata?: Metadata;
}

export interface APIResponse {
  message: string;
  statusCode: number;
}

export interface ClientOptions {
  /** HTTP timeout in milliseconds. Defaults to 10 000. */
  timeoutMs?: number;
}
