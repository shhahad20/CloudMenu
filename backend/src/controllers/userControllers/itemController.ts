import { NextFunction, Request, Response } from "express";
import ApiError from "../../errors/ApiError.js";
import { supabase } from "../../config/supabaseClient.js"; 

export const getAllItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase.from("menus").select("*");

    if (error) {
      return next(ApiError.internal("Error retrieving menus data"));
    }

    if (!data || data.length === 0) {
      return next(ApiError.notFound("Menus not found"));
    }

    res.status(200).json({
      message: "Menus retrieved successfully.",
      payload: data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuByName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;

    if (!name) {
      return next(ApiError.badRequest("Menu name must be provided!"));
    }

    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .eq("name", name);

    if (error) {
      return next(ApiError.internal("Error retrieving menu data"));
    }

    if (!data || data.length === 0) {
      return next(ApiError.notFound(`Menu with name: ${name} not found.`));
    }

    res.status(200).json({
      message: "Menu retrieved successfully.",
      payload: data,
    });
  } catch (error) {
    next(error);
  }
};

export const createMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, num_sections, num_products, description } = req.body;

    // Basic validation for required fields
    if (!name || !num_sections || !num_products || !description) {
      return res
        .status(400)
        .json({ message: "Name, num_sections, num_products, and Description are required." });
    }

    const { error } = await supabase
      .from("menus")
      .insert([{ name, num_sections, num_products, description }]);

    if (error) {
      console.error("Failed to insert data:", error);
      return next(ApiError.internal("Failed to insert data"));
    }

    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    next(ApiError.badRequest("Bad request."));
  }
};

export const updateMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, num_sections, num_products, description } = req.body;

    const { error, count } = await supabase
      .from("menus")
      .update({ name, num_sections, num_products, description })
      .eq("id", id);

    if (error) {
      console.error("Failed to update data:", error);
      return res.status(500).send("Failed to update data");
    }

    if (count === 0) {
      return next(ApiError.notFound("Menu template not found"));
    }

    res.status(200).json({ message: `You updated menu with id: ${id}` });
  } catch (error) {
    next(error);
  }
};

export const deleteMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { error, count } = await supabase
      .from("menus")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete menu data:", error);
      return res.status(500).send("Failed to delete data");
    }

    if (count === 0) {
      return next(ApiError.notFound("Menu template not found"));
    }

    res.status(200).json({
      message: `You deleted menu with id = ${id}`,
    });
  } catch (error) {
    next(error);
  }
};
