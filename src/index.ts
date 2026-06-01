// Types
export type {
  APIResponse,
  ClientOptions,
  CreateAuditLogRequest,
  CreateEventRequest,
  CreateSessionRequest,
  Metadata,
  RequestDetails,
} from "./types";

// Error
export { LogtraceError } from "./error";

// Core client
export { Client } from "./client";

// Context helpers
export { fromContext, RequestClient } from "./context";

// Middleware + utilities
export { logger, operatingSystem, realIP } from "./middleware";
