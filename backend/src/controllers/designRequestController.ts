import { NextFunction, Request, Response } from "express";
import { createDesignRequest } from "../services/designRequestService.js";
import ApiError from "../errors/ApiError.js";

export const createRequest = async (req: Request, res: Response,next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { message, design_for, first_name, email, title } = req.body;
    // Input validation (can also use a validation library)
    if (!userId) {
        return next(ApiError.unauthorized("User not authenticated, please login first."));
      }
    if (!message || !email || !first_name ||!title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create the design request
    const designRequest = await createDesignRequest({userId, message, design_for, first_name,title, email});

    return res.status(201).json(designRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
