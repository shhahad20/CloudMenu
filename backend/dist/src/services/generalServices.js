import { supabase } from "../config/supabaseClient.js";
export const getAll = async (userId, tableName
//   searchField: string,
//   pageNo: number = 1,
//   limit: number = 5,
//   sortField: string,
//   sortOrder: string ,
//   searchQuery?: string,
) => {
    try {
        // const offset = (pageNo - 1) * limit;
        let query = supabase.from(tableName).select("*", { count: "exact" });
        // if (searchQuery) {
        //   query = query.ilike(searchField, `%${searchQuery}%`); // ilike() for Case-insensitive search
        // }
        const { data, error, count } = await query;
        // Debugging: Check if there's an error or no data
        if (error) {
            console.error("Error fetching: ", error);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
        if (!data || data.length === 0) {
            console.warn("No data found or the data is empty.");
        }
        return {
            data,
        };
    }
    catch (error) {
        console.error("Error in fetching data: ", error);
        throw new Error(`Failed to fetch data: ${error}`);
    }
};
export const getSingleData = async (id, tableName, userId) => {
    try {
        if (!id || !userId) {
            throw new Error("Invalid input: id, and userId must all be provided.");
        }
        const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .eq("id", id)
            .eq("user_id", userId); // Ensure you're checking the user ID if needed
        if (error) {
            console.error("Error fetching data:", error);
            throw new Error(error.message);
        }
        if (!data || data.length === 0) {
            return new Error(`Component with ID: ${id} not found.`);
        }
        return data[0];
    }
    catch (error) {
        console.error("Error in getSingleData:", error, " or you don't have permission");
        throw new Error(`Failed to fetch the data: ${error}`);
    }
};
export const createData = async (tableName, newData) => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .insert([
            {
                template_id: newData.template_id,
                header: newData.header,
                header_img: newData.header_img,
                logo: newData.logo,
                slogan: newData.slogan,
                navbar: newData.navbar,
                contact_info: newData.contact_info,
                user_id: newData.user_id,
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
        console.error("Error in create data: ", error);
        throw new Error(`Failed to create data: ${error}`);
    }
};
export const deleteData = async (id, user_id, tableName) => {
    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("user_id", user_id)
        .eq("id", id);
    if (error)
        throw error;
};
export const updateData = async (tableName, id, newData) => {
    const { data: updatedData, error: updateError } = await supabase
        .from(tableName)
        .update([
        {
            template_id: newData.template_id,
            header: newData.header,
            header_img: newData.header_img,
            logo: newData.logo,
            slogan: newData.slogan,
            navbar: newData.navbar,
            contact_info: newData.contact_info,
            user_id: newData.userId,
            updated_at: new Date(),
        },
    ])
        .eq("id", id)
        .eq("user_id", newData.userId)
        .select("*");
    if (updateError)
        throw updateError;
    return updatedData;
};
