import ApiError from "../errors/ApiError.js";
import { supabase } from "../config/supabaseClient.js"; // Make sure to set up Supabase client in this file
export const getPricing = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from("pricing").select("*");
        if (error) {
            return next(ApiError.internal("Error retrieving pricing data"));
        }
        if (!data || data.length === 0) {
            return next(ApiError.notFound("Pricing not found"));
        }
        res.status(200).json({
            message: "Pricing",
            payload: data,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getPricingById = async (req, res, next) => {
    try {
        const { id, name } = req.params;
        if (!id && !name) {
            return next(ApiError.badRequest("ID or Name must be provided!"));
        }
        let query = supabase.from("pricing").select("*");
        if (id) {
            query = query.eq("id", id);
        }
        if (name) {
            query = query.eq("name", name);
        }
        const { data, error } = await query;
        if (error) {
            return next(ApiError.internal("Error retrieving pricing data"));
        }
        if (!data || data.length === 0) {
            return next(ApiError.notFound("Pricing not found"));
        }
        res.status(200).json({
            message: "Pricing retrieved successfully.",
            payload: data,
        });
    }
    catch (error) {
        next(error);
    }
};
export const createPricing = async (req, res, next) => {
    try {
        const { name, price, duration, description } = req.body;
        if (!name || !price || !duration || !description) {
            return res
                .status(400)
                .json({ message: "Name, Price, Duration, and Description are required." });
        }
        const { error } = await supabase.from("pricing").insert([
            { name, price, duration, description },
        ]);
        if (error) {
            console.error("Failed to insert data:", error);
            return next(ApiError.internal("Failed to insert data"));
        }
        res.status(201).json({ message: "Data inserted successfully" });
    }
    catch (error) {
        next(ApiError.badRequest("Bad request."));
    }
};
export const updatePricing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, duration, description } = req.body;
        const { error } = await supabase
            .from("pricing")
            .update({ name, price, duration, description })
            .eq("id", id);
        if (error) {
            console.error("Failed to update data:", error);
            return res.status(500).send("Failed to update data");
        }
        res.status(200).json({ message: `You updated pricing with id: ${id}` });
    }
    catch (error) {
        next(error);
    }
};
export const deletePricing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from("pricing").delete().eq("id", id);
        if (error) {
            console.error("Failed to delete pricing data:", error);
            return res.status(500).send("Failed to delete data");
        }
        res.status(200).json({
            message: `You deleted pricing with id = ${id}`,
        });
    }
    catch (error) {
        next(error);
    }
};
