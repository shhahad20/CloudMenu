import { supabase } from "../config/supabaseClient.js";
export const getAllMenus = async (userId, tableName, searchField, pageNo = 1, limit = 5, sortField, // Default sort field
sortOrder, searchQuery) => {
    try {
        const offset = (pageNo - 1) * limit;
        let query = supabase
            .from(tableName)
            .select(` *
      `, { count: 'exact' })
            .eq('user_id', userId)
            .range(offset, offset + limit - 1)
            .order(sortField, { ascending: sortOrder === 'asc' });
        if (searchQuery) {
            query = query.ilike(searchField, `%${searchQuery}%`);
        }
        const { data, error, count } = await query;
        if (error) {
            console.error("Error fetching menus: ", error);
            throw new Error(`Failed to fetch menus data: ${error.message}`);
        }
        if (!data || data.length === 0) {
            console.warn("No data found or the data is empty.");
        }
        return {
            templates: data,
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
