import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/ApiError.js";
import { supabase } from "../config/supabaseClient.js";

export const getAllFAQs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase.from("faqs").select("*");

    if (error) {
      return next(ApiError.internal("Error retrieving FAQs data"));
    }

    if (!data || data.length === 0) {
      return next(ApiError.notFound("FAQs not found"));
    }

    res.status(200).json({
      message: "FAQs retrieved successfully.",
      payload: data,
    });
  } catch (error) {
    next(error);
  }
};

export const getFAQById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(ApiError.badRequest("FAQ Id must be provided!"));
    }

    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("id", id);

    if (error) {
      return next(ApiError.internal("Error retrieving FAQ data"));
    }

    if (!data || data.length === 0) {
      return next(ApiError.notFound(`FAQ with ID: ${id} not found.`));
    }

    res.status(200).json({
      message: "FAQ retrieved successfully.",
      payload: data,
    });
  } catch (error) {
    next(error);
  }
};

export const createFAQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer ) {
      return res
        .status(400)
        .json({ message: "Question, answer are required." });
    }

    const { error } = await supabase
      .from("faqs")
      .insert([{ question, answer }]); 

    if (error) {
      console.error("Failed to insert data:", error);
      return next(ApiError.internal("Failed to insert data"));
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    next(ApiError.badRequest("Bad request."));
  }
};

export const updateFAQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    const { error, count } = await supabase
      .from("faqs")
      .update({ question, answer })
      .eq("id", id);

    if (error) {
      console.error("Failed to update data:", error);
      return res.status(500).send("Failed to update data");
    }

    if (count === 0) {
      return next(ApiError.notFound("FAQ not found"));
    }

    res.status(200).json({ message: `You updated FAQ with id: ${id}` });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { error, count } = await supabase
      .from("faqs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete FAQ data:", error);
      return res.status(500).send("Failed to delete data");
    }

    if (count === 0) {
      return next(ApiError.notFound("FAQ not found"));
    }

    res.status(200).json({
      message: `You deleted FAQ with id = ${id}`,
    });
  } catch (error) {
    next(error);
  }
};
