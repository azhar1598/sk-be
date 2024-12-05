// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

class AuthMiddleware {
  static async authenticateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Check for Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          message: "No authentication token, authorization denied.",
        });
      }

      // Check for Bearer token
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          message: "Token format is incorrect. Use Bearer <token>",
        });
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret"
      ) as DecodedToken;

      // Attach user to request object
      req.user = decoded;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          message: "Token has expired. Please log in again.",
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          message: "Invalid token. Authentication failed.",
        });
      }

      console.error("Authentication error:", error);
      res.status(500).json({ message: "Server error during authentication" });
    }
  }
}

export default AuthMiddleware;
