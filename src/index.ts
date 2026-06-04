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
export { Logtrace } from "./client";

// Context helpers
export { fromContext, RequestClient } from "./context";

// Middleware + utilities
export { logger, operatingSystem, realIP } from "./middleware";
