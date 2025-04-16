import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/ApiError.js";
import { CustomRequest } from "../types/types";


export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = (req as Request & { user?: { role: string } }).user?.role;
    console.log("User Role from Middleware:", userRole);
    if (userRole !== "superAdmin") {
      return next(
        ApiError.forbidden("You don't have permission to access this resource.")
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
