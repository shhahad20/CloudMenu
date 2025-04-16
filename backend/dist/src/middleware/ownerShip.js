import { supabase } from "../config/supabaseClient.js";
export const verifyOwnership = async (req, res, next) => {
    try {
        const { id } = req.params; // Assuming item ID is in the request params
        const userId = req.user?.id; // Extracted from the JWT by isLoggedIn middleware
        // Fetch the item by ID
        const { data: item, error } = await supabase
            .from("items")
            .select("user_id")
            .eq("id", id)
            .single();
        if (error || !item) {
            return res.status(404).json({ message: "Item not found" });
        }
        // Check if the user owns the item
        if (item.user_id !== userId) {
            return res.status(403).json({ message: "You do not have permission to access this item." });
        }
        next(); // User owns the item, proceed to the next middleware/controller
    }
    catch (error) {
        next(error);
    }
};
