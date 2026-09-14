import type { NextFunction, Request, Response } from "express";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
}

export function rateLimit(maxPerMinute = 120) {
  return (req: Request, res: Response, next: NextFunction) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(",")[0]?.trim() || req.ip || "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + 60_000 });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > maxPerMinute) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please slow down and try again shortly.",
      });
    }

    return next();
  };
}

export function requireJson(req: Request, res: Response, next: NextFunction) {
  if (["POST", "PUT", "PATCH"].includes(req.method) && !req.is("application/json")) {
    return res.status(415).json({
      success: false,
      message: "Content-Type must be application/json",
    });
  }
  return next();
}
