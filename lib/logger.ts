type LogLevel = "info" | "warn" | "error" | "success";

export function log(
  level: LogLevel,
  context: string,
  message: string,
  data?: any
) {
  const emoji = {
    info: "📊",
    warn: "⚠️",
    error: "❌",
    success: "✅",
  }[level];

  const timestamp = new Date().toISOString();
  const logMessage = `${emoji} [${timestamp}] [${context}] ${message}`;

  if (data !== undefined) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

export const logger = {
  info: (context: string, message: string, data?: any) =>
    log("info", context, message, data),
  warn: (context: string, message: string, data?: any) =>
    log("warn", context, message, data),
  error: (context: string, message: string, data?: any) =>
    log("error", context, message, data),
  success: (context: string, message: string, data?: any) =>
    log("success", context, message, data),
};

