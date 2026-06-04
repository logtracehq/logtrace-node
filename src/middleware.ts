import type { IncomingMessage, ServerResponse } from "node:http";
import type { Logtrace } from "./client";
import { RequestClient, _storage } from "./context";

// ─── IP helpers ────────────────────────────────────────────────────────────

/**
 * Resolve the real client IP from common proxy / CDN headers, in priority order:
 * `CF-Connecting-IP` → `X-Real-IP` → `X-Forwarded-For` (first entry) → socket remote address.
 */
export function realIP(req: IncomingMessage): string {
  const header = (name: string): string | undefined => {
    const val = req.headers[name];
    return Array.isArray(val) ? val[0] : val;
  };

  const cf = header("cf-connecting-ip");
  if (cf) return cf;

  const xri = header("x-real-ip");
  if (xri) return xri;

  const xff = header("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();

  return (req.socket as { remoteAddress?: string }).remoteAddress ?? "";
}

// ─── OS detection ──────────────────────────────────────────────────────────

/**
 * Infer the client operating system from a User-Agent string.
 */
export function operatingSystem(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("curl")) return "Unknown (curl)";
  if (ua.includes("windows")) return "Windows";
  if (
    ua.includes("mac os") ||
    ua.includes("macintosh") ||
    ua.includes("darwin")
  )
    return "macOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios"))
    return "iOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("cros")) return "Chrome OS";
  return "Unknown";
}

// ─── Middleware ────────────────────────────────────────────────────────────

/**
 * Express / Connect-compatible middleware that injects a {@link RequestClient}
 * into the async context for the duration of each request.
 *
 * @example
 * ```ts
 * import express from 'express';
 * import * as logtrace from 'logtrace';
 *
 * const client = logtrace.Client.new(process.env.LOGTRACE_API_KEY!);
 * const app = express();
 *
 * app.use(logtrace.logger(client));
 *
 * app.get('/', async (req, res) => {
 *   const rc = logtrace.fromContext(client);
 *   await rc.createEvent({ actionName: 'home-visit', ... });
 *   res.send('ok');
 * });
 * ```
 */
export function logger(client: Logtrace) {
  return function logtraceMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ): void {
    const userAgent = req.headers["user-agent"] ?? "";

    const rc = new RequestClient(client, {
      method: req.method ?? "GET",
      endpoint: (req as { originalUrl?: string }).originalUrl ?? req.url ?? "/",
      clientIp: realIP(req),
      userAgent,
      operatingSystem: operatingSystem(userAgent),
      // Read lazily — captures the final status code set by downstream handlers.
      getStatus: () => res.statusCode,
    });

    // Capture request headers once the response has been flushed so that
    // anything added by downstream middleware is included.
    res.on("finish", () => {
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          headers[key] = Array.isArray(value)
            ? value[value.length - 1]!
            : value;
        }
      }
      rc._headers = headers;
    });

    // Run the rest of the middleware chain inside the async context so that
    // `fromContext()` resolves without any prop-drilling.
    _storage.run(rc, () => next());
  };
}
