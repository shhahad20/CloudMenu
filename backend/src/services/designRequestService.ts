import { supabase } from "../config/supabaseClient.js";

export const createDesignRequest = async (requestData:{userId: string, message: string, design_for:string, first_name:string, title: string, email:string}) => {

    try {
        const { data, error } = await supabase
              .from("design_requests")
              .insert([
                {
                  user_id: requestData.userId,
                  first_name: requestData.first_name,
                  title:requestData.title,
                  email: requestData.email,
                  message: requestData.message,
                  design_for: requestData.design_for,
                },
              ])
              .select("*");

              if (error) {
                console.log(error.message);
                throw new Error(error.message);
              }
              return data;
    } catch (error) {
        console.error("Error:", error);
        throw new Error(`Failed to create new design request: ${error}`);
    }
};
