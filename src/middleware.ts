import type { NextFunction, Request, Response } from "express";
import dotenv from "dotenv"
dotenv.config();
import jwt from "jsonwebtoken"

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  const decoded = jwt.verify(header as string, process.env.jwt_password ?? "your_jwt_secret_key") as { id: string } | undefined;
  if (decoded) {
    req.userId = decoded.id;
    next()
  } else {
    res.status(403).json({
      message: "u are not logged in"
    })
  }
}