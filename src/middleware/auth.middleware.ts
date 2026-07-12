import { Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/auth.controller";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const sessionStore = AuthController.getSessionStore();
  const session = sessionStore.get(token);
  
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  // Check if session expired
  if (new Date() > session.expires) {
    sessionStore.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }

  // Extend session
  session.expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  req.headers["x-admin-user"] = session.username;
  next();
};
