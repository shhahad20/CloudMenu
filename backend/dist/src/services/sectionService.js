import { supabase } from "../config/supabaseClient.js";
import ApiError from "../errors/ApiError.js";
export const getAllMenuSections = async (userId, tableName, searchField, pageNo = 1, limit = 5, sortField, sortOrder, searchQuery) => {
    try {
        const offset = (pageNo - 1) * limit;
        let query = supabase
            .from(tableName)
            .select(`
          section_id,
          header,
          template_id,
          templates(
          id,
          user_id
          )
      `, { count: "exact" })
            .eq("templates.user_id", userId)
            .not("templates", "is", null)
            .range(offset, offset + limit - 1)
            .order(sortField, { ascending: sortOrder === "asc" });
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
export const getMenuSectionById = async (userId, id) => {
    try {
        if (!userId || !id) {
            throw new Error("Invalid input: userId, and sectionId must all be provided.");
        }
        const { data, error } = await supabase
            .from("template_sections")
            .select(`
          section_id,
          header,
          section_order,
          template_id,
          templates(
          id,
          user_id
          )
    `)
            .eq("section_id", id) // Match the section ID
            // .eq("template_id", id) // Match the template ID
            .eq("templates.user_id", userId) // Match the user_id in the templates table
            .single();
        if (error) {
            console.error("Error fetching menu section:", error);
            throw new Error(error.message);
        }
        if (!data) {
            throw new Error("Menu or section not found");
        }
        // Find the specific item in the nested sections
        // const section = data[0].template_sections
        //   ?.flatMap((section: any) => section.template_items)
        //   ?.find((templateItem: any) => templateItem.item_id === id);
        return data;
    }
    catch (error) {
        console.error("Error in getMenuSectionById: ", error);
        throw new Error(`Failed to fetch the section: ${error}`);
    }
};
export const getMenuSectionsById = async (userId, id) => {
    try {
        if (!userId || !id) {
            throw new Error("Invalid input: userId, and sectionId must all be provided.");
        }
        const { data, error } = await supabase
            .from("template_sections")
            .select(`
          section_id,
          header,
          section_order,
          template_id,
          templates(
          id,
          user_id
          )
    `)
            .eq("template_id", id)
            .eq("templates.user_id", userId);
        if (error) {
            console.error("Error fetching menu section:", error);
            throw new Error(error.message);
        }
        if (!data) {
            throw new Error("Menu or section not found");
        }
        return data;
    }
    catch (error) {
        console.error("Error in getMenuSectionsById: ", error);
        throw new Error(`Failed to fetch the sections: ${error}`);
    }
};
export const createMenuSection = async (menuSectionData) => {
    try {
        const { data, error } = await supabase
            .from("template_sections")
            .insert([
            {
                template_id: menuSectionData.template_id,
                header: menuSectionData.header,
            },
        ])
            .select("*");
        if (error) {
            console.log(error.message);
            throw new Error(error.message);
        }
        return data;
    }
    catch (error) {
        console.error("Error in createMenuSection:", error);
        throw new Error(`Failed to create menu section: ${error}`);
    }
};
export const updateMenuSections = async (userId, section_id, header) => {
    console.log({ userId, section_id, header });
    if (!userId || !section_id || !header) {
        throw new Error("Missing required parameters");
    }
    // await getMenuSectionById(section_id, userId, template_Id);
    const { data, error } = await supabase
        .from("template_sections")
        .select("*")
        .eq("section_id", section_id)
        .single();
    if (error || !data) {
        throw ApiError.notFound("Section not found" + error?.message);
    }
    const { data: updatedSection, error: updateError } = await supabase
        .from("template_sections")
        .update([
        {
            header: header,
        },
    ])
        .eq("section_id", section_id)
        .select("*");
    if (updateError) {
        throw updateError;
    }
    return updatedSection;
};
export const deleteMenuSections = async (section_id) => {
    const { error } = await supabase
        .from("template_sections")
        .delete()
        .eq("section_id", section_id);
    if (error)
        throw error;
};
