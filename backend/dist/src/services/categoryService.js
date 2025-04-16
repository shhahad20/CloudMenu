import { supabase } from "../config/supabaseClient.js";
import ApiError from "../errors/ApiError.js";
export const getAllMenuItems = async (userId, tableName, searchField, pageNo = 1, limit = 5, sortField, sortOrder, searchQuery) => {
    try {
        const offset = (pageNo - 1) * limit;
        let query = supabase
            .from(tableName)
            .select(`
        id,
        user_id
        section_id
        template_sections (
          section_id,
          header,
          template_id,
        )
      `, { count: 'exact' })
            .eq('template_sections.templates.user_id', userId)
            .not('template_sections', 'is', null)
            .not('template_sections.templates', 'is', null)
            .range(offset, offset + limit - 1)
            .order(sortField, { ascending: sortOrder === 'asc' });
        if (searchQuery) {
            query = query.ilike(searchField, `%${searchQuery}%`); // ilike() for Case-insensitive search
        }
        const { data, error, count } = await query;
        // Debugging: Check if there's an error or no data
        if (error) {
            console.error("Error fetching menu sections: ", error);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
        // Debugging: Check if we have data or if it's empty
        if (!data || data.length === 0) {
            console.warn("No data found or the data is empty.");
        }
        return {
            data,
            totalItems: count || 0,
            currentPage: pageNo,
            totalPages: Math.ceil((count || 0) / limit),
        };
    }
    catch (error) {
        console.error("Error in fetching data: ", error);
        throw new Error(`Failed to fetch data: ${error}`);
    }
};
export const getCategoryById = async (id) => {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();
    if (error)
        throw error;
    return data;
};
export const createCategory = async (name) => {
    const { data, error } = await supabase.from("categories").insert([{ name }]).select('*');
    if (error)
        throw error;
    return data;
};
export const deleteCategory = async (id) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error)
        throw error;
};
export const updateCategory = async (id, name) => {
    const { data: existingCategory, error: selectError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();
    if (selectError || !existingCategory) {
        throw ApiError.notFound("Category not found");
    }
    const { data, error } = await supabase
        .from("categories")
        .update({ name })
        .eq("id", id)
        .select("*");
    if (error)
        throw error;
    return data;
};
