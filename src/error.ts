export class LogtraceError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(`logtrace: ${statusCode} - ${message}`);
    this.name = "LogtraceError";
    this.statusCode = statusCode;

    // Restore the prototype chain when compiled to ES5/CommonJS.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
