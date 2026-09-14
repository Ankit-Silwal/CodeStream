import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) =>
{
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
  {
    return res.status(401).json({ error: "Unauthorized: No token" });
  }
  try
  {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    req.userId = (decoded as any).id; 
    next();
  }
  catch (err)
  {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

export const requireRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user as any)?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }
    next();
  };
